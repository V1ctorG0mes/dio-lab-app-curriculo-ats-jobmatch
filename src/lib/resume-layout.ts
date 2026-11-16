/**
 * Presentation-only layer for the A4 résumé sheet. It regroups what the ATS
 * engine produced into visual blocks (entries, bullets, skill rows) without
 * adding or dropping any of the candidate's words. Output stays single-column.
 */
import { normalize, type ResumeSection } from "./ats";

export type TextRun = { text: string; strong?: boolean };

export type LayoutBlock =
  | { type: "paragraph"; text: string }
  | { type: "entry"; title: string; org: string | null; period: string | null; bullets: string[]; notes: string[] }
  | { type: "bullets"; items: string[] }
  | { type: "skills"; rows: { label: string | null; value: string }[] };

const ENTRY_SECTIONS = /experien|formac|certific|projet|educa|academ/;
const SKILL_SECTIONS = /competenc|habilidad|skills|tecnolog/;

const MONTH = "(?:jan|fev|feb|mar|abr|apr|mai|may|jun|jul|ago|aug|set|sep|out|oct|nov|dez|dec)[a-zç.]*\\s*(?:\\/|de)?\\s*";
const YEAR_OR_NOW = `(?:(?:${MONTH})?\\d{4}|atual|o momento|presente|hoje|current|present|now)`;
const PERIOD_RE = new RegExp(
  `[\\s,|–—-]*\\(?\\s*((?:${MONTH})?\\d{4}\\s*(?:[-–—]|a|até|to)\\s*${YEAR_OR_NOW}|(?:${MONTH})?\\d{4})\\s*\\)?\\s*$`,
  "i",
);
const ORG_SPLIT_RE = /\s+[—–|@]\s+|\s+-\s+/;
const TRAILING_CONNECTOR_RE = /(?:^|\s)(?:de|da|do|das|dos|e|ou|em|na|no|nas|nos|com|para|por|que|o|a|os|as|um|uma|via|ao|aos)$/i;

export function parseEntryHeader(line: string): { title: string; org: string | null; period: string | null } | null {
  const trimmed = line.trim();
  if (!trimmed || trimmed.length > 130 || /[.!?;,:]$/.test(trimmed)) return null;
  // Continuation lines starting with lowercase or parentheses are never entry headers
  if (/^[a-záàâãéêíóôõúç(]/.test(trimmed)) return null;
  if (TRAILING_CONNECTOR_RE.test(trimmed)) return null;

  let rest = trimmed;
  let period: string | null = null;
  const m = rest.match(PERIOD_RE);
  if (m && m.index && m.index > 0) {
    period = m[1].replace(/\s*[-–—]\s*/, " – ").replace(/\b(atual|presente|hoje|o momento)\b/i, (w) => w[0].toUpperCase() + w.slice(1));
    rest = rest.slice(0, m.index).replace(/[\s,|–—-]+$/, "").trim();
  }

  let split = rest.split(ORG_SPLIT_RE);
  if (split.length === 1 && period) {
    split = rest.split(/,\s+/);
  }
  const title = split[0]?.trim() ?? "";
  const org = split.length > 1 ? rest.slice(title.length).replace(/^[\s,|@–—-]+/, "").trim() || null : null;

  if (!title || (!org && !period)) return null;
  // Without an explicit date/period, require a concise title + org (avoid turning prose sentences into headers)
  if (!period && (title.length > 55 || trimmed.length > 90 || /^[^:]{1,35}:\s/.test(trimmed))) {
    return null;
  }
  return { title, org, period };
}

// --- Bullets: highlight the opening action verb and concrete results -------

const ACTION_VERB_RE = /^(\p{L}{3,}(?:ei|i|ou|amos|imos|ava|ia|ed))(?=[\s,:])/iu;
const METRIC_RE = /(R\$\s?\d[\d.,]*(?:\s?(?:mil|mi|milhões|bi|k))?|\+?\d[\d.,]*\s?(?:%|x\b|mil\b|milhões\b|k\b|pp\b))/giu;

export function highlightBullet(text: string): TextRun[] {
  const runs: TextRun[] = [];
  let rest = text;
  const verb = rest.match(ACTION_VERB_RE);
  if (verb) {
    runs.push({ text: verb[1], strong: true });
    rest = rest.slice(verb[1].length);
  }
  let last = 0;
  for (const m of rest.matchAll(METRIC_RE)) {
    const i = m.index ?? 0;
    if (i > last) runs.push({ text: rest.slice(last, i) });
    runs.push({ text: m[0], strong: true });
    last = i + m[0].length;
  }
  if (last < rest.length) runs.push({ text: rest.slice(last) });
  return runs;
}

// --- Skills: group comma lists into clean labelled rows -----------------------

const METHOD_TERMS = [
  "Scrum", "Kanban", "Metodologias ágeis", "CI/CD", "Testes automatizados", "Acessibilidade",
  "Performance web", "Design System", "SEO", "Microsserviços", "ETL", "Modelagem de dados",
  "Estatística", "Machine Learning", "Roadmap", "OKRs", "Product Discovery", "KPIs",
  "Pesquisa com usuários", "Priorização", "Testes A/B", "SaaS", "B2B", "Dashboards",
];
const SOFT_TERMS = ["Liderança", "Comunicação", "Mentoria", "Trabalho em equipe", "Stakeholders", "Inglês", "Espanhol"];

export const SKILL_GROUPS = {
  tech: "Tecnologias & Ferramentas",
  method: "Metodologias & Práticas",
  soft: "Competências & Idiomas",
} as const;

const METHOD_SET = new Set(METHOD_TERMS.map(normalize));
const SOFT_SET = new Set(SOFT_TERMS.map(normalize));
const ALIGNED_LABEL = /^compet[eê]ncias alinhadas [aà] vaga$/i;

function splitList(value: string) {
  return value.split(/\s*[,;]\s*/).map((s) => s.trim()).filter(Boolean);
}

/** Merge PDF-wrapped skill lines that lack a colon back onto the previous labelled line. */
function unwrapSkillLines(lines: string[]): string[] {
  const out: string[] = [];
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    const text = line.replace(/^- /, "");
    const hasLabel = /^[^:]{2,45}:\s*\S/.test(text);
    const prev = out.at(-1);
    if (prev && !hasLabel && !/[.!?]$/.test(prev)) {
      out[out.length - 1] = `${prev} ${text}`;
    } else {
      out.push(line);
    }
  }
  return out;
}

/** Every skill the candidate listed appears exactly once in the output rows. */
export function groupSkills(lines: string[]): { label: string | null; value: string }[] {
  const unwrapped = unwrapSkillLines(lines);
  const groups: Record<keyof typeof SKILL_GROUPS, string[]> = { tech: [], method: [], soft: [] };
  const seen: string[] = [];
  const labelled: { label: string | null; value: string }[] = [];
  const add = (term: string) => {
    const n = normalize(term);
    if (seen.some((s) => s === n || s.startsWith(`${n} `) || n.startsWith(`${s} `))) return;
    seen.push(n);
    groups[METHOD_SET.has(n) ? "method" : SOFT_SET.has(n) ? "soft" : "tech"].push(term);
  };

  for (const line of unwrapped) {
    if (!line) continue;
    const text = line.replace(/^- /, "");
    const colon = text.indexOf(":");
    const label = colon > 0 && colon < 45 ? text.slice(0, colon).trim() : null;
    const value = label ? text.slice(colon + 1).trim() : text;
    const items = splitList(value);
    if (label && ALIGNED_LABEL.test(label)) items.forEach(add);
    else if (!label && items.length > 1) items.forEach(add);
    else labelled.push({ label, value });
  }

  const rows = (Object.keys(SKILL_GROUPS) as (keyof typeof SKILL_GROUPS)[])
    .filter((k) => groups[k].length)
    .map((k) => ({ label: SKILL_GROUPS[k] as string, value: groups[k].join(", ") }));
  return [...rows, ...labelled];
}

// --- Section → blocks --------------------------------------------------------

function isContinuation(prev: string, next: string): boolean {
  if (/^[a-záàâãéêíóôõúç(]/.test(next)) return true;
  if (!/[.!?]$/.test(prev) && TRAILING_CONNECTOR_RE.test(prev)) return true;
  if (prev.endsWith(",")) return true;
  return false;
}

export function layoutSection(section: ResumeSection): LayoutBlock[] {
  const key = normalize(section.title);
  if (SKILL_SECTIONS.test(key)) return [{ type: "skills", rows: groupSkills(section.lines) }];

  const entryMode = ENTRY_SECTIONS.test(key);
  const blocks: LayoutBlock[] = [];
  let entry: Extract<LayoutBlock, { type: "entry" }> | null = null;
  let list: Extract<LayoutBlock, { type: "bullets" }> | null = null;
  let paragraph: Extract<LayoutBlock, { type: "paragraph" }> | null = null;

  for (const rawLine of section.lines) {
    const line = rawLine.trim();
    if (line === "") {
      entry = null;
      list = null;
      paragraph = null;
      continue;
    }

    if (line.startsWith("- ")) {
      paragraph = null;
      const item = line.slice(2);
      if (entry) entry.bullets.push(item);
      else {
        if (!list) blocks.push((list = { type: "bullets", items: [] }));
        list.items.push(item);
      }
      continue;
    }

    const header = entryMode ? parseEntryHeader(line) : null;
    if (header) {
      list = null;
      paragraph = null;
      blocks.push((entry = { type: "entry", ...header, bullets: [], notes: [] }));
      continue;
    }

    // Continuation of an active bullet list (from PDF line wrapping)
    if (list && list.items.length > 0 && isContinuation(list.items.at(-1)!, line)) {
      list.items[list.items.length - 1] = `${list.items.at(-1)!} ${line}`;
      continue;
    }

    if (entry && entry.bullets.length > 0 && isContinuation(entry.bullets.at(-1)!, line)) {
      entry.bullets[entry.bullets.length - 1] = `${entry.bullets.at(-1)!} ${line}`;
      continue;
    }

    list = null;

    if (entry && entry.bullets.length === 0) {
      const prevNote = entry.notes.at(-1);
      // Merge wrapped description lines in entry notes, but keep short standalone subtitle separate
      const prevIsSubtitle = entry.notes.length === 1 && prevNote && prevNote.length <= 95 && !/[.!?]$/.test(prevNote) && !isContinuation(prevNote, line);
      if (prevNote && !prevIsSubtitle && (isContinuation(prevNote, line) || (prevNote.length > 60 && line.length > 20))) {
        entry.notes[entry.notes.length - 1] = `${prevNote} ${line}`;
      } else {
        entry.notes.push(line);
      }
      continue;
    }

    entry = null;
    if (paragraph) {
      // Merge consecutive prose lines in non-entry sections (e.g. Resumo Profissional) into one clean paragraph
      paragraph.text = `${paragraph.text} ${line}`;
    } else {
      blocks.push((paragraph = { type: "paragraph", text: line }));
    }
  }

  return blocks;
}
