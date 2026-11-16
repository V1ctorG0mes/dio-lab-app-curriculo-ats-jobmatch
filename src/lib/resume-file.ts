// Reads résumé files 100% in the browser. Heavy readers (PDF, DOCX) are loaded on demand.

export const ACCEPTED_RESUME_EXTENSIONS = [".txt", ".md", ".docx", ".pdf"] as const;
export const ACCEPT_ATTR = ".txt,.md,.markdown,.docx,.pdf,text/plain,text/markdown,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document";
export const MAX_RESUME_FILE_BYTES = 10 * 1024 * 1024;

export type ResumeFileKind = "text" | "docx" | "pdf";

export function getResumeFileKind(name: string): ResumeFileKind | null {
  const ext = name.toLowerCase().match(/\.[a-z0-9]+$/)?.[0] ?? "";
  if (ext === ".txt" || ext === ".md" || ext === ".markdown") return "text";
  if (ext === ".docx") return "docx";
  if (ext === ".pdf") return "pdf";
  return null;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
}

/** Collapses extra blank lines/spaces left by extractors. */
export function tidyExtractedText(text: string): string {
  return text
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t\u00a0]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function readAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error ?? new Error("Falha ao ler o arquivo"));
    reader.readAsText(file, "utf-8");
  });
}

async function readDocx(file: File): Promise<string> {
  const mod = await import("mammoth");
  const mammoth = (mod as unknown as { default?: typeof mod }).default ?? mod;
  const { value } = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
  return value;
}

async function readPdf(file: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  const { default: workerUrl } = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
  const task = pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) });
  const doc = await task.promise;
  const pages: string[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    let line = "";
    const lines: string[] = [];
    for (const item of content.items) {
      if (!("str" in item)) continue;
      line += item.str;
      if (item.hasEOL) {
        lines.push(line);
        line = "";
      } else if (item.str && !line.endsWith(" ")) {
        line += " ";
      }
    }
    if (line) lines.push(line);
    pages.push(lines.join("\n"));
  }
  void task.destroy();
  return pages.join("\n\n");
}

export async function readResumeFile(file: File): Promise<string> {
  const kind = getResumeFileKind(file.name);
  if (!kind) throw new Error("Formato não suportado. Use .txt, .md, .docx ou .pdf.");
  if (file.size > MAX_RESUME_FILE_BYTES) throw new Error("Arquivo muito grande (máximo 10 MB).");
  const raw = kind === "text" ? await readAsText(file) : kind === "docx" ? await readDocx(file) : await readPdf(file);
  const text = tidyExtractedText(raw);
  if (!text) {
    throw new Error(
      kind === "pdf"
        ? "Não encontramos texto neste PDF. Ele pode ser uma imagem escaneada."
        : "O arquivo está vazio.",
    );
  }
  return text;
}
