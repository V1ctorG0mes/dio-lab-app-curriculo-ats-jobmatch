/**
 * Client-side ATS engine: keyword extraction, match scoring and ethical resume
 * reformatting. It only reorganizes and normalizes what the candidate already
 * wrote — it never adds experience or skills that are not in the resume.
 */

export type ResumeSection = { title: string; lines: string[] };
export type OptimizedResume = { name: string; contact: string[]; sections: ResumeSection[] };

export type AnalysisResult = {
  jobTitle: string;
  company: string;
  keywords: string[];
  found: string[];
  missing: string[];
  initialScore: number;
  score: number;
  resume: OptimizedResume;
  plainText: string;
};

type LexiconEntry = { term: string; aliases?: string[] };

const LEXICON: LexiconEntry[] = [
  // Frontend / engineering
  { term: "React Native" },
  { term: "React", aliases: ["reactjs", "react.js"] },
  { term: "TypeScript", aliases: ["ts"] },
  { term: "JavaScript", aliases: ["js", "es6", "ecmascript"] },
  { term: "Next.js", aliases: ["nextjs"] },
  { term: "Node.js", aliases: ["nodejs", "node"] },
  { term: "HTML", aliases: ["html5"] },
  { term: "CSS", aliases: ["css3"] },
  { term: "Tailwind CSS", aliases: ["tailwind", "tailwindcss"] },
  { term: "Redux", aliases: ["redux toolkit"] },
  { term: "Zustand" },
  { term: "Vue.js", aliases: ["vue", "vuejs"] },
  { term: "Angular" },
  { term: "Jest" },
  { term: "Testing Library", aliases: ["react testing library"] },
  { term: "Cypress" },
  { term: "Playwright" },
  {
    term: "Testes automatizados",
    aliases: ["testes unitarios", "testes de integracao", "unit tests", "testes e2e"],
  },
  { term: "Git", aliases: ["github", "gitlab"] },
  { term: "CI/CD", aliases: ["github actions", "pipelines de deploy"] },
  { term: "APIs REST", aliases: ["rest", "restful", "api rest", "apis restful"] },
  { term: "GraphQL" },
  { term: "Acessibilidade", aliases: ["a11y", "wcag", "accessibility"] },
  { term: "Performance web", aliases: ["web vitals", "core web vitals", "lighthouse"] },
  { term: "Design System", aliases: ["design systems", "storybook"] },
  { term: "Figma" },
  { term: "SEO" },
  { term: "Vite" },
  { term: "Webpack" },
  { term: "Docker" },
  { term: "Kubernetes", aliases: ["k8s"] },
  { term: "AWS", aliases: ["amazon web services"] },
  { term: "Azure" },
  { term: "GCP", aliases: ["google cloud"] },
  { term: "Microsserviços", aliases: ["microservices", "microsservicos"] },
  { term: "Java" },
  { term: "Spring Boot", aliases: ["spring"] },
  // Data
  { term: "Python" },
  { term: "SQL", aliases: ["postgresql", "mysql", "sql server", "bigquery"] },
  { term: "Power BI", aliases: ["powerbi"] },
  { term: "Tableau" },
  { term: "Looker", aliases: ["looker studio"] },
  { term: "Excel", aliases: ["planilhas"] },
  { term: "Pandas" },
  { term: "ETL", aliases: ["pipelines de dados"] },
  { term: "Estatística", aliases: ["statistics"] },
  { term: "Machine Learning", aliases: ["aprendizado de maquina", "ml"] },
  { term: "Dashboards", aliases: ["dashboard", "paineis"] },
  { term: "Modelagem de dados", aliases: ["data modeling", "modelagem dimensional"] },
  // Product / management
  { term: "Scrum" },
  { term: "Kanban" },
  { term: "Metodologias ágeis", aliases: ["agile", "agil", "ageis"] },
  { term: "Roadmap", aliases: ["roadmaps"] },
  { term: "OKRs", aliases: ["okr"] },
  { term: "Product Discovery", aliases: ["discovery"] },
  { term: "Jira" },
  { term: "KPIs", aliases: ["kpi", "metricas de produto", "metricas"] },
  { term: "Stakeholders", aliases: ["stakeholder"] },
  {
    term: "Pesquisa com usuários",
    aliases: ["user research", "ux research", "entrevistas com usuarios"],
  },
  { term: "Priorização", aliases: ["backlog", "rice"] },
  { term: "Testes A/B", aliases: ["teste a/b", "a/b testing", "ab testing"] },
  { term: "SaaS" },
  { term: "B2B" },
  // Soft skills & languages
  { term: "Inglês", aliases: ["english"] },
  { term: "Espanhol", aliases: ["spanish"] },
  { term: "Liderança", aliases: ["liderar", "lideranca tecnica", "leadership"] },
  { term: "Comunicação", aliases: ["communication"] },
  { term: "Mentoria", aliases: ["mentorar", "mentoring"] },
  { term: "Trabalho em equipe", aliases: ["colaboracao", "teamwork"] },
];

const STOPWORDS = new Set(
  (
    "para com como uma umas uns que dos das nos nas pelo pela pelos pelas seu sua seus suas mais " +
    "voce voces nossa nosso nossos nossas este esta isso esse essa entre sobre sera serao estar " +
    "ser ter tem temos todo toda todos todas cada area vaga vagas empresa time equipe trabalho " +
    "experiencia conhecimento conhecimentos requisitos desejavel desejaveis diferencial diferenciais " +
    "responsabilidades atividades beneficios buscamos procuramos pessoa profissional anos " +
    "the and for with you your our will are have from that this sera"
  ).split(" "),
);

export function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
}

function containsTerm(normalizedText: string, term: string): boolean {
  const re = new RegExp(`(?<![a-z0-9])${escapeRegex(normalize(term))}(?![a-z0-9])`);
  return re.test(normalizedText);
}

export function countWords(text: string): number {
  const t = text.trim();
  return t ? t.split(/\s+/).length : 0;
}

/** Keywords the job description asks for, in the vacancy's own spelling. */
export function extractKeywords(jobDescription: string): string[] {
  const jd = normalize(jobDescription);
  const found: string[] = [];
  for (const entry of LEXICON) {
    const variants = [entry.term, ...(entry.aliases ?? [])];
    if (variants.some((v) => containsTerm(jd, v))) found.push(entry.term);
  }

  // Fallback: frequent meaningful words when the lexicon finds little.
  if (found.length < 8) {
    const counts = new Map<string, number>();
    for (const word of jd.match(/[a-z][a-z0-9+#.-]{4,}/g) ?? []) {
      const w = word.replace(/[.-]+$/, "");
      if (STOPWORDS.has(w) || w.length < 5) continue;
      counts.set(w, (counts.get(w) ?? 0) + 1);
    }
    const known = new Set(found.map(normalize));
    const extra = [...counts.entries()]
      .filter(([w, c]) => c >= 2 && !known.has(w))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8 - found.length)
      .map(([w]) => w.charAt(0).toUpperCase() + w.slice(1));
    found.push(...extra);
  }
  return found;
}

function variantsFor(keyword: string): string[] {
  const entry = LEXICON.find((e) => e.term === keyword);
  return entry ? [entry.term, ...(entry.aliases ?? [])] : [keyword];
}

// ---------- Resume parsing & formatting ----------

type SectionKey =
  | "resumo"
  | "competencias"
  | "experiencia"
  | "formacao"
  | "certificacoes"
  | "projetos"
  | "idiomas";

const SECTION_PATTERNS: { key: SectionKey; title: string; re: RegExp }[] = [
  {
    key: "resumo",
    title: "RESUMO PROFISSIONAL",
    re: /^(resumo|sobre|perfil|objetivo|summary|about)/,
  },
  {
    key: "experiencia",
    title: "EXPERIÊNCIA PROFISSIONAL",
    re: /^(experiencia|experiences?|historico profissional|atuacao profissional|work experience)/,
  },
  {
    key: "formacao",
    title: "FORMAÇÃO ACADÊMICA",
    re: /^(formacao|educacao|education|escolaridade)/,
  },
  {
    key: "competencias",
    title: "COMPETÊNCIAS TÉCNICAS",
    re: /^(habilidades|competencias|skills|tecnologias|conhecimentos|stack|ferramentas)/,
  },
  {
    key: "certificacoes",
    title: "CERTIFICAÇÕES E CURSOS",
    re: /^(certificac|cursos|certifications)/,
  },
  { key: "projetos", title: "PROJETOS", re: /^(projetos|projects|portfolio)/ },
  { key: "idiomas", title: "IDIOMAS", re: /^(idiomas|languages|linguas)/ },
];

const SECTION_ORDER: SectionKey[] = [
  "resumo",
  "competencias",
  "experiencia",
  "formacao",
  "certificacoes",
  "projetos",
  "idiomas",
];

const EMOJI_RE = /[\p{Extended_Pictographic}\u{FE0F}\u{200D}]/gu;
const HAS_EMOJI = /\p{Extended_Pictographic}/u;
const BULLET_RE = /^\s*(?:[-*•●▪►▶✓✔★☆◆◇■□➤→]|\d+[.)])\s+/;

function stripMarkdown(line: string): string {
  return line
    .replace(EMOJI_RE, "")
    .replace(/^#{1,6}\s*/, "")
    .replace(/\*\*|__|`/g, "")
    .replace(/(^|\s)[*_](\S[^*_]*\S|\S)[*_](?=\s|$)/g, "$1$2")
    .replace(/[★☆●▪►▶✓✔◆◇■□➤]/g, "")
    .replace(/\t/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

const PAGE_FOOTER_RE = /\b(?:p[aá]gina|page)\s+\d+\s*(?:de|of|\/)\s*\d+\s*$/i;
const BARE_BULLET_RE = /^\s*[-*•●▪►▶✓✔★☆◆◇■□➤→]\s*$/;

function detectHeading(raw: string): { key: SectionKey | null; title: string } | null {
  const cleaned = stripMarkdown(raw).replace(/:$/, "").trim();
  if (!cleaned) return null;
  const norm = normalize(cleaned);
  const isMarkdownHeading = /^\s*#{1,6}\s/.test(raw);
  const isAllCaps = cleaned === cleaned.toUpperCase() && /[A-ZÀ-Ú]/.test(cleaned);
  const shortEnough = cleaned.length <= (isAllCaps ? 65 : 40);
  if (shortEnough) {
    for (const p of SECTION_PATTERNS) {
      const maxWords = isAllCaps ? 7 : 4;
      const plainHeading = cleaned.split(" ").length <= maxWords && !/[:,;]/.test(cleaned);
      if (p.re.test(norm) && (isMarkdownHeading || plainHeading)) {
        return { key: p.key, title: p.title };
      }
    }
  }
  if (isMarkdownHeading && shortEnough) return { key: null, title: cleaned.toUpperCase() };
  return null;
}

type ParsedResume = {
  name: string;
  contact: string[];
  sections: { key: SectionKey | null; title: string; lines: string[] }[];
};

function parseResume(text: string): ParsedResume {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  let name = "";
  const contact: string[] = [];
  const sections: ParsedResume["sections"] = [];
  let current: ParsedResume["sections"][number] | null = null;
  let lastWasTableRow = false;

  for (const rawLine of lines) {
    if (PAGE_FOOTER_RE.test(rawLine.trim()) || BARE_BULLET_RE.test(rawLine)) {
      continue;
    }
    if (/^\s*\|?\s*:?-{3,}/.test(rawLine) || /^\s*(-{3,}|_{3,}|\*{3,}|={3,})\s*$/.test(rawLine)) {
      // A markdown table rule follows the header row: drop that header.
      if (lastWasTableRow && current) current.lines.pop();
      lastWasTableRow = false;
      continue;
    }
    lastWasTableRow = /^\s*\|.*\|\s*$/.test(rawLine);
    const heading = detectHeading(rawLine);
    if (heading && name) {
      current = { key: heading.key, title: heading.title, lines: [] };
      sections.push(current);
      continue;
    }

    let line = rawLine;
    if (/^\s*\|.*\|\s*$/.test(line)) {
      line = line
        .split("|")
        .map((c) => c.trim())
        .filter(Boolean)
        .join(", ");
    }
    const isBullet = BULLET_RE.test(line);
    let cleaned = stripMarkdown(line.replace(BULLET_RE, ""));
    if (!cleaned) {
      if (current && current.lines.length && current.lines.at(-1) !== "") current.lines.push("");
      continue;
    }
    if (isBullet) cleaned = `- ${cleaned}`;

    if (!name) {
      name = cleaned.replace(/^- /, "");
      continue;
    }
    if (!current) {
      contact.push(
        ...cleaned
          .split(/\s*[|•·]\s*/)
          .map((p) => p.trim())
          .filter(Boolean),
      );
      continue;
    }
    current.lines.push(cleaned);
  }

  for (const s of sections) {
    while (s.lines.at(-1) === "") s.lines.pop();
  }
  return { name, contact, sections };
}

function formatScore(rawText: string, parsed: ParsedResume): number {
  const keys = new Set(parsed.sections.map((s) => s.key));
  const checks = [
    /[\w.+-]+@[\w-]+\.[\w.]+/.test(rawText) || /\(?\d{2}\)?\s?9?\d{4}-?\d{4}/.test(rawText),
    keys.has("experiencia"),
    keys.has("formacao"),
    keys.has("competencias"),
    !HAS_EMOJI.test(rawText) && !/\*\*|^\s*\|/m.test(rawText) && !/[★☆●►▶✓✔◆■➤]/.test(rawText),
  ];
  return (checks.filter(Boolean).length / checks.length) * 100;
}

export function resumeToPlainText(resume: OptimizedResume): string {
  const out: string[] = [resume.name.toUpperCase()];
  if (resume.contact.length) out.push(resume.contact.join(" | "));
  for (const s of resume.sections) {
    out.push("", s.title, ...s.lines);
  }
  return out.join("\n").trim();
}

function extractField(jd: string, re: RegExp): string | null {
  for (const line of jd.split("\n")) {
    const m = stripMarkdown(line).match(re);
    if (m?.[2]) return m[2].trim();
  }
  return null;
}

export function analyze(jobDescription: string, resumeText: string): AnalysisResult {
  const keywords = extractKeywords(jobDescription);
  const resumeNorm = normalize(resumeText);

  const exactFound = keywords.filter((k) => containsTerm(resumeNorm, k));
  const found = keywords.filter((k) => variantsFor(k).some((v) => containsTerm(resumeNorm, v)));
  const missing = keywords.filter((k) => !found.includes(k));

  const parsed = parseResume(resumeText);
  const total = Math.max(keywords.length, 1);
  const initialScore = Math.round(
    0.75 * ((exactFound.length / total) * 100) + 0.25 * formatScore(resumeText, parsed),
  );

  // Build the ATS-friendly resume: standard headings, standard order, plain bullets,
  // and the vacancy's exact spelling for skills the candidate ALREADY has.
  const byKey = new Map<SectionKey, ResumeSection>();
  const others: ResumeSection[] = [];
  for (const s of parsed.sections) {
    if (s.key) {
      const existing = byKey.get(s.key);
      if (existing) existing.lines.push(...s.lines);
      else byKey.set(s.key, { title: SECTION_PATTERNS.find((p) => p.key === s.key)!.title, lines: [...s.lines] });
    } else {
      others.push({ title: s.title, lines: [...s.lines] });
    }
  }

  if (found.length) {
    const aligned = `Competências alinhadas à vaga: ${found.join(", ")}`;
    const skills = byKey.get("competencias");
    if (skills) skills.lines.unshift(aligned);
    else byKey.set("competencias", { title: "COMPETÊNCIAS TÉCNICAS", lines: [aligned] });
  }

  const sections = [
    ...SECTION_ORDER.flatMap((k) => (byKey.has(k) ? [byKey.get(k)!] : [])),
    ...others,
  ].filter((s) => s.lines.length > 0);

  const resume: OptimizedResume = {
    name: parsed.name || "Seu Nome",
    contact: parsed.contact,
    sections,
  };
  const plainText = resumeToPlainText(resume);

  const optimizedFormat = formatScore(plainText, {
    ...parsed,
    sections: sections.map((s) => ({
      key: SECTION_PATTERNS.find((p) => p.title === s.title)?.key ?? null,
      title: s.title,
      lines: s.lines,
    })),
  });
  const score = Math.max(
    initialScore,
    Math.round(0.75 * ((found.length / total) * 100) + 0.25 * optimizedFormat),
  );

  const jobTitle =
    extractField(jobDescription, /^(vaga|cargo|posi[cç][aã]o|t[ií]tulo|role)\s*[:\-–]\s*(.+)/i) ??
    (stripMarkdown(jobDescription.split("\n").find((l) => l.trim()) ?? "").slice(0, 60) ||
      "Vaga sem título");
  const company =
    extractField(jobDescription, /^(empresa|company|contratante)\s*[:\-–]\s*(.+)/i) ??
    "Não informada";

  return { jobTitle, company, keywords, found, missing, initialScore, score, resume, plainText };
}
