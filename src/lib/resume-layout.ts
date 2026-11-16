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
const ORG_SPLIT_RE = /\s+[—–|@]\s+|\s+-\s+|,\s+/;

export function parseEntryHeader(line: string): { title: string; org: string | null; period: string | null } | null {
  if (line.length > 140 || /[.!?;]$/.test(line)) return null;
  let rest = line.trim();
  let period: string | null = null;
  const m = rest.match(PERIOD_RE);
  if (m && m.index && m.index > 0) {
    period = (m[1] ?? "").replace(/\s*[-–—]\s*/, " – ").replace(/\b(atual|presente|hoje|o momento)\b/i, (w) => w.charAt(0).toUpperCase() + w.slice(1));
    rest = rest.slice(0, m.index).replace(/[\s,|–—-]+$/, "").trim();
  }
  const split = rest.split(ORG_SPLIT_RE);
  const title = split[0]?.trim() ?? "";
  const org = split.length > 1 ? rest.slice(title.length).replace(/^[\s,|@–—-]+/, "").trim() || null : null;
  if (!title || (!org && !period)) return null;
  return { title, org, period };
}

// --- Bullets: highlight the opening action verb and concrete results -------

const ACTION_VERB_RE = /^(\p{L}{3,}(?:ei|i|ou|amos|imos|ava|ia|ed))(?=[\s,:])/iu;
const METRIC_RE = /(R\$\s?\d[\d.,]*(?:\s?(?:mil|mi|milhões|bi|k))?|\+?\d[\d.,]*\s?(?:%|x\b|mil\b|milhões\b|k\b|pp\b))/giu;

export function highlightBullet(text: string): TextRun[] {
  const runs: TextRun[] = [];
  let rest = text;
  const verb = rest.match(ACTION_VERB_RE);
  if (verb?.[1]) {
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

/** Every skill the candidate listed appears exactly once in the output rows. */
export function groupSkills(lines: string[]): { label: string | null; value: string }[] {
  const groups: Record<keyof typeof SKILL_GROUPS, string[]> = { tech: [], method: [], soft: [] };
  const seen: string[] = [];
  const labelled: { label: string | null; value: string }[] = [];
  const add = (term: string) => {
    const n = normalize(term);
    if (seen.some((s) => s === n || s.startsWith(`${n} `) || n.startsWith(`${s} `))) return;
    seen.push(n);
    groups[METHOD_SET.has(n) ? "method" : SOFT_SET.has(n) ? "soft" : "tech"].push(term);
  };

  for (const line of lines) {
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

export function layoutSection(section: ResumeSection): LayoutBlock[] {
  const key = normalize(section.title);
  if (SKILL_SECTIONS.test(key)) return [{ type: "skills", rows: groupSkills(section.lines) }];

  const entryMode = ENTRY_SECTIONS.test(key);
  const blocks: LayoutBlock[] = [];
  let entry: Extract<LayoutBlock, { type: "entry" }> | null = null;
  let list: Extract<LayoutBlock, { type: "bullets" }> | null = null;

  for (const line of section.lines) {
    if (line === "") {
      entry = null;
      list = null;
      continue;
    }
    if (line.startsWith("- ")) {
      const item = line.slice(2);
      if (entry) entry.bullets.push(item);
      else {
        if (!list) blocks.push((list = { type: "bullets", items: [] }));
        list.items.push(item);
      }
      continue;
    }
    list = null;
    const header = entryMode ? parseEntryHeader(line) : null;
    if (header) {
      blocks.push((entry = { type: "entry", ...header, bullets: [], notes: [] }));
    } else if (entry && entry.bullets.length === 0) {
      entry.notes.push(line);
    } else {
      entry = null;
      blocks.push({ type: "paragraph", text: line });
    }
  }
  return blocks;
}
