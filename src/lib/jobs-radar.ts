/** Browser-only role recommendations. Profiles are illustrative, never job listings. */
import { analyze, countWords, normalize } from "./ats";
import type { NicheId } from "./samples";

export type MatchTier = "alta" | "media" | "baixa";
export type RoleProfile = { id: string; title: string; niche: NicheId; description: string };
export type JobMatchItem = RoleProfile & {
  score: number;
  referenceScore: number;
  rankScore: number;
  keywords: string[];
  found: string[];
  missing: string[];
  sharedWithReference: string[];
  matchTier: MatchTier;
  source: "referencia" | "perfil";
};
export type RadarFilterOptions = { niche?: NicheId | "all"; search?: string };
export type RadarSummary = {
  total: number;
  highMatchCount: number;
  bestScore: number;
  averageScore: number;
};

export function hasRadarInputs(job: string, resume: string): boolean {
  return countWords(job) >= 15 && countWords(resume) >= 15;
}

export const RADAR_PROFILES: RoleProfile[] = [
  // --- TECH ---
  {
    id: "tech-react-pleno",
    title: "Desenvolvedor(a) Frontend React Pleno",
    niche: "tech",
    description: `Vaga: Desenvolvedor(a) Frontend React Pleno

Sobre a vaga
Buscamos pessoa desenvolvedora Frontend para evoluir uma plataforma B2B de pagamentos.

Responsabilidades
- Desenvolver interfaces com React, TypeScript e Next.js
- Evoluir nosso Design System no Figma e Storybook em parceria com UX
- Integrar APIs REST e GraphQL
- Garantir acessibilidade (WCAG) e performance web (Core Web Vitals)
- Escrever testes automatizados com Jest e Testing Library

Requisitos
- Experiência sólida com React, JavaScript, HTML, CSS e Tailwind CSS
- Experiência com Git e pipelines de CI/CD
- Vivência com metodologias ágeis (Scrum)

Diferenciais
- Inglês intermediário e testes E2E com Cypress`,
  },
  {
    id: "tech-fullstack-ts",
    title: "Engenheiro(a) Fullstack TypeScript & Node.js",
    niche: "tech",
    description: `Vaga: Engenheiro(a) Fullstack TypeScript & Node.js

Responsabilidades
- Construir aplicações web escaláveis com React, TypeScript e Node.js
- Projetar e manter APIs REST e microsserviços em Docker e Kubernetes
- Gerenciar banco de dados PostgreSQL (SQL) e deploy em AWS
- Garantir qualidade com testes automatizados e CI/CD

Requisitos
- Domínio de JavaScript, TypeScript, React e Node.js
- Experiência prática com SQL, Git, Docker e cloud (AWS)
- Vivência com Scrum e comunicação clara com times multidisciplinares`,
  },
  {
    id: "tech-backend-java",
    title: "Desenvolvedor(a) Backend Java & Spring Boot",
    niche: "tech",
    description: `Vaga: Desenvolvedor(a) Backend Java & Spring Boot

Responsabilidades
- Arquitetar microsserviços financeiros de alta disponibilidade em Java e Spring Boot
- Integrar APIs REST seguras com PostgreSQL e mensageria
- Atuar com Docker, Kubernetes, AWS e pipelines CI/CD
- Realizar mentoria técnica e code review para o time

Requisitos
- Experiência sólida com Java, Spring Boot, POO e SQL
- Prática com testes automatizados, Git e liderança técnica
- Conhecimento em Docker, Kubernetes e cloud AWS`,
  },

  // --- DADOS ---
  {
    id: "dados-bi-pleno",
    title: "Analista de Dados & BI Pleno",
    niche: "dados",
    description: `Vaga: Analista de Dados & BI Pleno

Responsabilidades
- Construir dashboards estratégicos em Power BI para diretoria e áreas comerciais
- Escrever consultas SQL avançadas e manter pipelines de ETL
- Analisar KPIs de vendas e margem com Python (Pandas) e estatística
- Apresentar insights e recomendações para stakeholders

Requisitos
- Experiência comprovada com SQL, Python, Power BI e Excel avançado
- Conhecimento em modelagem de dados e estatística aplicada
- Desejável: vivência com Machine Learning ou Looker`,
  },
  {
    id: "dados-engenharia-etl",
    title: "Engenheiro(a) de Dados (Python, SQL & Cloud)",
    niche: "dados",
    description: `Vaga: Engenheiro(a) de Dados

Responsabilidades
- Desenvolver pipelines de ETL escaláveis em Python e SQL (BigQuery / PostgreSQL)
- Estruturar modelagem de dados dimensional para ferramentas de BI (Looker e Power BI)
- Orquestrar cargas em ambientes cloud (AWS / GCP) com Docker e Git

Requisitos
- Domínio de SQL, Python (Pandas) e arquitetura de ETL
- Experiência com modelagem de dados, AWS ou GCP e Docker
- Boas práticas de versionamento com Git`,
  },
  {
    id: "dados-ciencia-ml",
    title: "Cientista de Dados & Machine Learning",
    niche: "dados",
    description: `Vaga: Cientista de Dados & Machine Learning

Responsabilidades
- Desenvolver modelos preditivos de Machine Learning em Python (Pandas) para roteirização logística
- Conduzir testes A/B e análises de estatística aplicada
- Extrair bases em SQL e publicar dashboards de KPIs em Tableau ou Power BI
- Comunicar resultados técnicos para stakeholders executivos

Requisitos
- Sólida experiência com Python, SQL, estatística e Machine Learning
- Vivência com testes A/B, ETL e comunicação com negócios`,
  },

  // --- PRODUTO ---
  {
    id: "produto-pm-saas",
    title: "Product Manager (SaaS B2B)",
    niche: "produto",
    description: `Vaga: Product Manager (SaaS B2B)

Responsabilidades
- Definir o roadmap do produto e liderar ciclos de OKRs trimestrais
- Conduzir product discovery contínuo e pesquisa com usuários
- Priorizar backlog no Jira junto à engenharia em metodologia Scrum
- Acompanhar métricas de produto (KPIs), funil e testes A/B
- Alinhar stakeholders médicos e comerciais

Requisitos
- Experiência como Product Manager ou Product Owner em produtos SaaS ou B2B
- Domínio de Product Discovery, OKRs, Roadmap, Jira e Scrum
- Inglês avançado e perfil orientado a dados (SQL ou Looker é diferencial)`,
  },
  {
    id: "produto-po-agile",
    title: "Product Owner (Plataforma Financeira)",
    niche: "produto",
    description: `Vaga: Product Owner

Responsabilidades
- Gerenciar e priorizar o backlog de duas squads usando Scrum e Kanban no Jira
- Facilitar ritos ágeis, escrever histórias de usuário e acompanhar KPIs de entrega
- Colaborar com UX no Figma e alinhar entregas com stakeholders e CRM

Requisitos
- Experiência prévia como Product Owner em metodologias ágeis (Scrum e Kanban)
- Conhecimento em priorização de backlog, Jira, KPIs e comunicação com stakeholders`,
  },
  {
    id: "produto-growth",
    title: "Product Manager de Growth & Experimentação",
    niche: "produto",
    description: `Vaga: Product Manager de Growth & Experimentação

Responsabilidades
- Liderar experimentos de testes A/B para aumentar conversão e retenção em SaaS
- Analisar funil e KPIs em Looker e SQL junto ao time de dados
- Conduzir pesquisa com usuários e definir roadmap focado em OKRs de crescimento

Requisitos
- Experiência com Growth, testes A/B, OKRs, SEO e análise de KPIs
- Vivência com Product Discovery, Jira e Figma`,
  },

  // --- NEGÓCIOS ---
  {
    id: "negocios-financeiro-erp",
    title: "Analista Financeiro & Operações Pleno",
    niche: "negocios",
    description: `Vaga: Analista Financeiro & Operações Pleno

Responsabilidades
- Conduzir fechamento mensal, análise de DRE e controle de fluxo de caixa
- Realizar conciliação bancária e acompanhamento de controle orçamentário
- Otimizar processos financeiros no sistema ERP (SAP) e planilhas Excel avançado
- Construir dashboards de KPIs em Power BI para diretoria e stakeholders
- Negociar prazos e contratos com fornecedores

Requisitos
- Experiência com ERP (SAP), Excel avançado, DRE, Fluxo de Caixa e conciliação bancária
- Vivência com Power BI e melhoria de processos`,
  },
  {
    id: "negocios-operacoes-crm",
    title: "Analista de Operações Comerciais & CRM",
    niche: "negocios",
    description: `Vaga: Analista de Operações Comerciais & CRM

Responsabilidades
- Administrar funil de vendas no CRM e apoiar metas B2B com dashboards no Excel e Power BI
- Mapear e otimizar processos internos entre vendas, financeiro e atendimento
- Acompanhar KPIs semanais, relatórios em Microsoft 365 e alinhamento com stakeholders

Requisitos
- Experiência com CRM, Excel avançado, Power BI e melhoria de processos
- Boa comunicação, organização em Kanban e trabalho em equipe`,
  },
  {
    id: "negocios-controladoria-sr",
    title: "Especialista de Controladoria & FP&A",
    niche: "negocios",
    description: `Vaga: Especialista de Controladoria & FP&A

Responsabilidades
- Liderar o planejamento e controle orçamentário anual, DRE gerencial e fluxo de caixa
- Padronizar processos no ERP SAP e automatizar relatórios de KPIs no Power BI e Excel
- Apresentar resultados executivos e negociar metas com stakeholders e diretoria

Requisitos
- Sólida experiência em controladoria, DRE, orçamento, SAP e Excel avançado
- Liderança, comunicação executiva e inglês intermediário`,
  },

  // --- ESTÁGIO / PRIMEIRO EMPREGO ---
  {
    id: "estagio-dev-web",
    title: "Estágio em Desenvolvimento de Software",
    niche: "estagio",
    description: `Vaga: Estágio em Desenvolvimento de Software

Atividades
- Apoiar a criação de interfaces responsivas com HTML, CSS, JavaScript e React
- Escrever consultas básicas em SQL e colaborar com APIs REST
- Versionar código com Git e GitHub junto ao time em Scrum

Requisitos
- Cursando Análise e Desenvolvimento de Sistemas, Ciência da Computação ou áreas afins
- Conhecimento em Lógica de Programação, POO (Java ou Python) e Git
- Boa comunicação e trabalho em equipe`,
  },
  {
    id: "estagio-dados-bi",
    title: "Estágio em Dados, BI & Automação",
    niche: "estagio",
    description: `Vaga: Estágio em Dados, BI & Automação

Atividades
- Apoiar a atualização de planilhas Excel, consultas em SQL e painéis em Power BI
- Auxiliar em scripts simples em Python para automação de relatórios
- Versionar scripts no GitHub e participar de ritos em equipe

Requisitos
- Estudante de graduação ou tecnólogo em TI, Estatística, Engenharia ou Administração
- Conhecimentos em Lógica de Programação, SQL, Excel e Python
- Vontade de aprender, comunicação clara e trabalho em equipe`,
  },
  {
    id: "estagio-suporte-ti",
    title: "Júnior / Trainee em Suporte Técnico & Sistemas",
    niche: "estagio",
    description: `Vaga: Trainee em Suporte Técnico & Sistemas

Atividades
- Prestar suporte técnico a usuários em Microsoft 365, hardware e redes
- Registrar chamados, consultar bancos SQL básicos e documentar processos internos
- Apoiar o time de desenvolvimento com testes manuais e GitHub

Requisitos
- Formação técnica ou superior em andamento em Análise e Desenvolvimento de Sistemas ou redes
- Noções de Suporte Técnico, SQL, Git e pacote Microsoft 365
- Comunicação empática e trabalho em equipe`,
  },
];

/** Compatibility is keyword coverage, not the optimized formatting score. */
export function generateJobRecommendations(
  jobDescription: string,
  resumeText: string,
  niche: NicheId,
  options: RadarFilterOptions = {},
): JobMatchItem[] {
  if (!hasRadarInputs(jobDescription, resumeText)) return [];
  const reference = analyze(jobDescription, resumeText, niche);
  const referenceTerms = new Set(reference.keywords.map(normalize));
  const profiles: Array<RoleProfile & { source: JobMatchItem["source"] }> = [
    {
      id: "vaga-referencia",
      title: reference.jobTitle,
      niche,
      description: jobDescription,
      source: "referencia",
    },
    ...RADAR_PROFILES.map((profile) => ({ ...profile, source: "perfil" as const })),
  ];
  const search = normalize(options.search?.trim() ?? "");
  return profiles
    .flatMap((profile): JobMatchItem[] => {
      if (options.niche && options.niche !== "all" && profile.niche !== options.niche) return [];
      if (search && !normalize(`${profile.title} ${profile.description}`).includes(search))
        return [];
      const analysis = analyze(profile.description, resumeText, profile.niche);
      const total = analysis.keywords.length;
      if (!total) return [];
      const score = Math.round((100 * analysis.found.length) / total);
      // Never recommend a role on formatting or a single incidental keyword alone.
      if (score < 35 || analysis.found.length < Math.min(2, total)) return [];
      const sharedWithReference = analysis.keywords.filter((term) =>
        referenceTerms.has(normalize(term)),
      );
      const referenceScore = Math.round((100 * sharedWithReference.length) / total);
      return [
        {
          ...profile,
          score,
          referenceScore,
          rankScore: Math.round(score * 0.8 + referenceScore * 0.2),
          keywords: analysis.keywords,
          found: analysis.found,
          missing: analysis.missing,
          sharedWithReference,
          matchTier: score >= 70 ? "alta" : score >= 45 ? "media" : "baixa",
        },
      ];
    })
    .sort(
      (a, b) => b.rankScore - a.rankScore || b.score - a.score || a.title.localeCompare(b.title),
    );
}

export function summarizeRadarMatches(items: JobMatchItem[]): RadarSummary {
  return {
    total: items.length,
    highMatchCount: items.filter((item) => item.score >= 70).length,
    bestScore: items.length ? Math.max(...items.map((item) => item.score)) : 0,
    averageScore: items.length
      ? Math.round(items.reduce((sum, item) => sum + item.score, 0) / items.length)
      : 0,
  };
}
