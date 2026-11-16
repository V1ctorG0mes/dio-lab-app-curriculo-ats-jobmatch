/**
 * Client-side ATS engine: keyword extraction, match scoring and ethical resume
 * reformatting. It only reorganizes and normalizes what the candidate already
 * wrote — it never adds experience or skills that are not in the resume.
 */
import type { NicheId } from "./samples";

export type ResumeSection = { title: string; lines: string[] };
export type OptimizedResume = { name: string; contact: string[]; sections: ResumeSection[] };

export type QualityMetrics = {
  totalBullets: number;
  actionVerbBullets: number;
  actionVerbRate: number;
  impactMetricsCount: number;
  detectedMetrics: string[];
};

export type AnalysisResult = {
  niche: NicheId;
  jobTitle: string;
  company: string;
  keywords: string[];
  found: string[];
  missing: string[];
  initialScore: number;
  score: number;
  quality: QualityMetrics;
  resume: OptimizedResume;
  plainText: string;
};

type LexiconEntry = { term: string; aliases?: string[]; niches?: NicheId[] };

const LEXICON: LexiconEntry[] = [
  // Frontend / engineering / tech
  { term: "React Native", niches: ["tech"] },
  { term: "React", aliases: ["reactjs", "react.js"], niches: ["tech", "estagio"] },
  { term: "TypeScript", aliases: ["ts"], niches: ["tech"] },
  { term: "JavaScript", aliases: ["js", "es6", "ecmascript"], niches: ["tech", "estagio"] },
  { term: "Next.js", aliases: ["nextjs"], niches: ["tech"] },
  { term: "Node.js", aliases: ["nodejs", "node"], niches: ["tech"] },
  { term: "HTML", aliases: ["html5"], niches: ["tech", "estagio"] },
  { term: "CSS", aliases: ["css3"], niches: ["tech", "estagio"] },
  { term: "Tailwind CSS", aliases: ["tailwind", "tailwindcss"], niches: ["tech", "estagio"] },
  { term: "Redux", aliases: ["redux toolkit"], niches: ["tech"] },
  { term: "Zustand", niches: ["tech"] },
  { term: "Vue.js", aliases: ["vue", "vuejs"], niches: ["tech"] },
  { term: "Angular", niches: ["tech"] },
  { term: "Jest", niches: ["tech"] },
  { term: "Testing Library", aliases: ["react testing library"], niches: ["tech"] },
  { term: "Cypress", niches: ["tech"] },
  { term: "Playwright", niches: ["tech"] },
  {
    term: "Testes automatizados",
    aliases: ["testes unitarios", "testes de integracao", "unit tests", "testes e2e"],
    niches: ["tech"],
  },
  { term: "Git", aliases: ["github", "gitlab"], niches: ["tech", "dados", "estagio"] },
  { term: "GitHub", niches: ["tech", "estagio"] },
  { term: "CI/CD", aliases: ["github actions", "pipelines de deploy"], niches: ["tech"] },
  { term: "APIs REST", aliases: ["rest", "restful", "api rest", "apis restful"], niches: ["tech", "estagio"] },
  { term: "GraphQL", niches: ["tech"] },
  { term: "Acessibilidade", aliases: ["a11y", "wcag", "accessibility"], niches: ["tech", "produto"] },
  { term: "Performance web", aliases: ["web vitals", "core web vitals", "lighthouse"], niches: ["tech"] },
  { term: "Design System", aliases: ["design systems", "storybook"], niches: ["tech", "produto"] },
  { term: "Figma", niches: ["tech", "produto"] },
  { term: "SEO", niches: ["tech", "produto"] },
  { term: "Vite", niches: ["tech"] },
  { term: "Webpack", niches: ["tech"] },
  { term: "Docker", niches: ["tech", "dados"] },
  { term: "Kubernetes", aliases: ["k8s"], niches: ["tech"] },
  { term: "AWS", aliases: ["amazon web services"], niches: ["tech", "dados"] },
  { term: "Azure", niches: ["tech", "dados"] },
  { term: "GCP", aliases: ["google cloud"], niches: ["tech", "dados"] },
  { term: "Microsserviços", aliases: ["microservices", "microsservicos"], niches: ["tech"] },
  { term: "Java", niches: ["tech", "estagio"] },
  { term: "Spring Boot", aliases: ["spring"], niches: ["tech"] },
  { term: "Kotlin", niches: ["tech", "estagio"] },
  { term: "POO", aliases: ["programacao orientada a objetos"], niches: ["tech", "estagio"] },
  { term: "Lógica de Programação", aliases: ["algoritmos", "pensamento computacional"], niches: ["estagio", "tech"] },
  { term: "Suporte Técnico", aliases: ["hardware", "redes", "infraestrutura"], niches: ["estagio", "negocios"] },
  // Data
  { term: "Python", niches: ["dados", "tech", "estagio"] },
  { term: "SQL", aliases: ["postgresql", "mysql", "sql server", "bigquery", "oracle", "oracle db"], niches: ["dados", "tech", "estagio"] },
  { term: "Power BI", aliases: ["powerbi"], niches: ["dados", "negocios"] },
  { term: "Tableau", niches: ["dados"] },
  { term: "Looker", aliases: ["looker studio"], niches: ["dados", "produto"] },
  { term: "Excel", aliases: ["planilhas", "excel avancado"], niches: ["dados", "negocios"] },
  { term: "Pandas", niches: ["dados"] },
  { term: "ETL", aliases: ["pipelines de dados"], niches: ["dados"] },
  { term: "Estatística", aliases: ["statistics"], niches: ["dados"] },
  { term: "Machine Learning", aliases: ["aprendizado de maquina", "ml"], niches: ["dados"] },
  { term: "Dashboards", aliases: ["dashboard", "paineis"], niches: ["dados", "negocios", "produto"] },
  { term: "Modelagem de dados", aliases: ["data modeling", "modelagem dimensional"], niches: ["dados"] },
  // Product / management
  { term: "Scrum", niches: ["produto", "tech", "estagio"] },
  { term: "Kanban", niches: ["produto", "tech", "negocios"] },
  { term: "Metodologias ágeis", aliases: ["agile", "agil", "ageis"], niches: ["produto", "tech", "estagio"] },
  { term: "Roadmap", aliases: ["roadmaps"], niches: ["produto"] },
  { term: "OKRs", aliases: ["okr"], niches: ["produto", "negocios"] },
  { term: "Product Discovery", aliases: ["discovery"], niches: ["produto"] },
  { term: "Jira", niches: ["produto", "tech"] },
  { term: "KPIs", aliases: ["kpi", "metricas de produto", "metricas"], niches: ["produto", "dados", "negocios"] },
  { term: "Stakeholders", aliases: ["stakeholder"], niches: ["produto", "negocios", "dados"] },
  {
    term: "Pesquisa com usuários",
    aliases: ["user research", "ux research", "entrevistas com usuarios"],
    niches: ["produto"],
  },
  { term: "Priorização", aliases: ["backlog", "rice"], niches: ["produto"] },
  { term: "Testes A/B", aliases: ["teste a/b", "a/b testing", "ab testing"], niches: ["produto", "dados"] },
  { term: "SaaS", niches: ["produto", "tech"] },
  { term: "B2B", niches: ["produto", "negocios"] },
  // Business / Finance / Operations
  { term: "ERP", aliases: ["sistemas erp"], niches: ["negocios"] },
  { term: "SAP", niches: ["negocios"] },
  { term: "DRE", aliases: ["demonstracao de resultado"], niches: ["negocios"] },
  { term: "Fluxo de Caixa", aliases: ["contas a pagar", "contas a receber"], niches: ["negocios"] },
  { term: "Conciliação bancária", aliases: ["conciliacao"], niches: ["negocios"] },
  { term: "Controle orçamentário", aliases: ["orcamento", "controladoria"], niches: ["negocios"] },
  { term: "Processos", aliases: ["otimizacao de processos", "melhoria de processos"], niches: ["negocios"] },
  { term: "Microsoft 365", aliases: ["pacote office", "office"], niches: ["negocios", "estagio"] },
  { term: "CRM", niches: ["negocios", "produto"] },
  { term: "Negociação", aliases: ["fornecedores"], niches: ["negocios"] },
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

/** Keywords the job description asks for, prioritizing terms relevant to the selected niche. */
export function extractKeywords(jobDescription: string, niche: NicheId = "tech"): string[] {
  const jd = normalize(jobDescription);
  const prioritized: string[] = [];
  const general: string[] = [];
  for (const entry of LEXICON) {
    const variants = [entry.term, ...(entry.aliases ?? [])];
    if (variants.some((v) => containsTerm(jd, v))) {
      if (entry.niches?.includes(niche)) prioritized.push(entry.term);
      else general.push(entry.term);
    }
  }
  const found = [...prioritized, ...general];

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

const STRONG_ACTION_VERB_RE =
  /^(?:\p{L}{3,}(?:ei|i|ou|amos|imos|ava|ia|ed)|desenvolvi|criei|implementei|liderei|otimizei|reduzi|aumentei|automatizei|estruturei|gerenciei|coordenei|conduzi|projetei|integrei|construi|configurei|analisei|defini|priorizei|acompanhei|colaborei|elaborei|auxiliei|modelei|trabalhei|apoiei|atuei|participei|entreguei|lancei|negociei|mapei|reestruturei|organizei|padronizei|solucionei|migrei|escalei|mentorei|treinei|developed|built|led|implemented|created|reduced|increased|optimized|designed|managed|automated|delivered|launched)(?=[\s,:])/iu;

const IMPACT_METRIC_RE =
  /(?:R\$\s?\d[\d.,]*(?:\s?(?:mil|mi|milh[õo]es|bi|k))?|\$\s?\d[\d.,]*(?:\s?(?:k|m|b))?|\+?\d[\d.,]*\s?(?:%|x\b|mil\b|milh[õo]es\b|k\b|pp\b|h\b|horas?\b|dias?\b|meses?\b|anos?\b|alunos?\b|usu[áa]rios?\b|clientes?\b|empresas?\b|consultas?\b|projetos?\b)|\b\d{1,3}\/\d{2,3}\b)/giu;

const INTERN_SECTION_ORDER: SectionKey[] = [
  "resumo",
  "formacao",
  "projetos",
  "competencias",
  "experiencia",
  "certificacoes",
  "idiomas",
];

export function analyzeWritingQuality(resume: OptimizedResume, rawResumeText: string): QualityMetrics {
  const bulletLines: string[] = [];
  for (const s of resume.sections) {
    const key = normalize(s.title);
    if (key.includes("competencia") || key.includes("idioma")) continue;
    for (const line of s.lines) {
      if (line.startsWith("- ")) bulletLines.push(line.slice(2).trim());
    }
  }

  const totalBullets = bulletLines.length;
  const actionVerbBullets = bulletLines.filter((b) => STRONG_ACTION_VERB_RE.test(b)).length;
  const actionVerbRate = totalBullets > 0 ? Math.round((actionVerbBullets / totalBullets) * 100) : 0;

  const detectedSet = new Set<string>();
  const cleanedRaw = rawResumeText.replace(/\(\d{2}\)\s?\d{4,5}-?\d{4}/g, "");
  for (const match of cleanedRaw.matchAll(IMPACT_METRIC_RE)) {
    const val = match[0].trim();
    // Skip pure calendar years if matched unexpectedly
    if (/^(19|20)\d{2}$/.test(val)) continue;
    detectedSet.add(val);
  }
  const detectedMetrics = [...detectedSet];

  return {
    totalBullets,
    actionVerbBullets,
    actionVerbRate,
    impactMetricsCount: detectedMetrics.length,
    detectedMetrics,
  };
}

export function buildXRayText(result: AnalysisResult): string {
  const lines: string[] = [
    `[ATS_PARSER_ENGINE v1.0 | NICHO: ${result.niche.toUpperCase()}]`,
    `[MATCH_SCORE: ${result.score}% | KEYWORDS_INDEXADAS: ${result.found.length}/${result.keywords.length}]`,
    "",
    "[CABEÇALHO_DETECTADO]",
    `  CANDIDATO: ${result.resume.name.toUpperCase()}`,
    `  CONTATOS : ${result.resume.contact.join(" | ") || "NÃO DETECTADO"}`,
    "",
    `[HARD_SKILLS_MATCHED (${result.found.length})]`,
    `  ${result.found.length ? result.found.join(", ") : "(nenhuma)"}`,
    "",
    `[SEÇÕES_LINEARIZADAS (${result.resume.sections.length})]`,
  ];

  for (const s of result.resume.sections) {
    lines.push("", `[SEÇÃO: ${s.title}]`);
    for (const l of s.lines) {
      if (l) lines.push(`  ${l}`);
    }
  }

  return lines.join("\n").trim();
}

export function analyze(
  jobDescription: string,
  resumeText: string,
  niche: NicheId = "tech",
): AnalysisResult {
  const keywords = extractKeywords(jobDescription, niche);
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

  const order = niche === "estagio" ? INTERN_SECTION_ORDER : SECTION_ORDER;
  const sections = [
    ...order.flatMap((k) => (byKey.has(k) ? [byKey.get(k)!] : [])),
    ...others,
  ].filter((s) => s.lines.length > 0);

  const resume: OptimizedResume = {
    name: parsed.name || "Seu Nome",
    contact: parsed.contact,
    sections,
  };
  const plainText = resumeToPlainText(resume);
  const quality = analyzeWritingQuality(resume, resumeText);

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

  return {
    niche,
    jobTitle,
    company,
    keywords,
    found,
    missing,
    initialScore,
    score,
    quality,
    resume,
    plainText,
  };
}
