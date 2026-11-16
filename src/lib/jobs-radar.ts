/**
 * Client-side Job Matchmaking Radar ("Radar de Vagas Compatíveis").
 * Evaluates a curated catalog of fictional opportunities across all niches
 * using the deterministic ATS scoring engine — never inventing qualifications.
 */
import { analyze, countWords, normalize } from "./ats";
import type { NicheId } from "./samples";

export type WorkModel = "Remoto" | "Híbrido" | "Presencial";
export type SeniorityLevel = "Estágio" | "Júnior" | "Pleno" | "Sênior";
export type MatchTier = "alta" | "media" | "baixa";

export type RadarJob = {
  id: string;
  title: string;
  company: string;
  niche: NicheId;
  seniority: SeniorityLevel;
  workModel: WorkModel;
  location: string;
  salaryRange: string;
  postedDaysAgo: number;
  description: string;
};

export type JobMatchItem = RadarJob & {
  score: number;
  initialScore: number;
  keywords: string[];
  found: string[];
  missing: string[];
  matchTier: MatchTier;
};

export type RadarFilterOptions = {
  niche?: NicheId | "all";
  workModel?: WorkModel | "all";
  search?: string;
};

export type RadarSummary = {
  total: number;
  highMatchCount: number;
  bestScore: number;
  averageScore: number;
};

export const RADAR_JOBS: RadarJob[] = [
  // --- TECH ---
  {
    id: "tech-react-pleno",
    title: "Desenvolvedor(a) Frontend React Pleno",
    company: "Nuvem Pay",
    niche: "tech",
    seniority: "Pleno",
    workModel: "Remoto",
    location: "Remoto (Brasil)",
    salaryRange: "R$ 8.500 – R$ 11.500",
    postedDaysAgo: 1,
    description: `Vaga: Desenvolvedor(a) Frontend React Pleno
Empresa: Nuvem Pay

Sobre a vaga
Buscamos pessoa desenvolvedora Frontend para evoluir nossa plataforma B2B de pagamentos usada por mais de 4 mil empresas.

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
    company: "FinTech Verde",
    niche: "tech",
    seniority: "Pleno",
    workModel: "Híbrido",
    location: "São Paulo, SP",
    salaryRange: "R$ 10.000 – R$ 13.500",
    postedDaysAgo: 2,
    description: `Vaga: Engenheiro(a) Fullstack TypeScript & Node.js
Empresa: FinTech Verde

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
    company: "CredFácil",
    niche: "tech",
    seniority: "Sênior",
    workModel: "Remoto",
    location: "Remoto (Brasil)",
    salaryRange: "R$ 13.000 – R$ 16.500",
    postedDaysAgo: 4,
    description: `Vaga: Desenvolvedor(a) Backend Java & Spring Boot
Empresa: CredFácil

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
    company: "Varejo Norte",
    niche: "dados",
    seniority: "Pleno",
    workModel: "Híbrido",
    location: "Recife, PE",
    salaryRange: "R$ 6.500 – R$ 8.500",
    postedDaysAgo: 1,
    description: `Vaga: Analista de Dados & BI Pleno
Empresa: Varejo Norte

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
    company: "Orbita Dados",
    niche: "dados",
    seniority: "Pleno",
    workModel: "Remoto",
    location: "Remoto (Brasil)",
    salaryRange: "R$ 9.500 – R$ 12.500",
    postedDaysAgo: 3,
    description: `Vaga: Engenheiro(a) de Dados
Empresa: Orbita Dados

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
    company: "LogiSmart",
    niche: "dados",
    seniority: "Sênior",
    workModel: "Remoto",
    location: "Remoto (Brasil)",
    salaryRange: "R$ 12.000 – R$ 15.500",
    postedDaysAgo: 5,
    description: `Vaga: Cientista de Dados & Machine Learning
Empresa: LogiSmart

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
    company: "Saúde+ App",
    niche: "produto",
    seniority: "Pleno",
    workModel: "Remoto",
    location: "Remoto (Brasil)",
    salaryRange: "R$ 10.500 – R$ 14.000",
    postedDaysAgo: 1,
    description: `Vaga: Product Manager (SaaS B2B)
Empresa: Saúde+ App

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
    company: "Banco Ágil",
    niche: "produto",
    seniority: "Pleno",
    workModel: "Híbrido",
    location: "São Paulo, SP",
    salaryRange: "R$ 8.500 – R$ 11.000",
    postedDaysAgo: 2,
    description: `Vaga: Product Owner
Empresa: Banco Ágil

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
    company: "Loja Ágil",
    niche: "produto",
    seniority: "Pleno",
    workModel: "Remoto",
    location: "Remoto (Brasil)",
    salaryRange: "R$ 9.500 – R$ 12.500",
    postedDaysAgo: 4,
    description: `Vaga: Product Manager de Growth & Experimentação
Empresa: Loja Ágil

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
    company: "Grupo Horizonte",
    niche: "negocios",
    seniority: "Pleno",
    workModel: "Híbrido",
    location: "Curitiba, PR",
    salaryRange: "R$ 5.800 – R$ 7.500",
    postedDaysAgo: 2,
    description: `Vaga: Analista Financeiro & Operações Pleno
Empresa: Grupo Horizonte

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
    company: "Varejo Express",
    niche: "negocios",
    seniority: "Júnior",
    workModel: "Presencial",
    location: "Belo Horizonte, MG",
    salaryRange: "R$ 4.200 – R$ 5.500",
    postedDaysAgo: 3,
    description: `Vaga: Analista de Operações Comerciais & CRM
Empresa: Varejo Express

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
    company: "Indústria Brasil",
    niche: "negocios",
    seniority: "Sênior",
    workModel: "Híbrido",
    location: "São Paulo, SP",
    salaryRange: "R$ 9.000 – R$ 12.000",
    postedDaysAgo: 5,
    description: `Vaga: Especialista de Controladoria & FP&A
Empresa: Indústria Brasil

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
    company: "EducaTech Brasil",
    niche: "estagio",
    seniority: "Estágio",
    workModel: "Remoto",
    location: "Remoto (Brasil)",
    salaryRange: "R$ 2.000 + bolsa auxílio",
    postedDaysAgo: 1,
    description: `Vaga: Estágio em Desenvolvimento de Software
Empresa: EducaTech Brasil

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
    company: "Conecta Educação",
    niche: "estagio",
    seniority: "Estágio",
    workModel: "Híbrido",
    location: "Campinas, SP",
    salaryRange: "R$ 1.900 + benefícios",
    postedDaysAgo: 2,
    description: `Vaga: Estágio em Dados, BI & Automação
Empresa: Conecta Educação

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
    company: "Studio Pixel",
    niche: "estagio",
    seniority: "Júnior",
    workModel: "Presencial",
    location: "Porto Alegre, RS",
    salaryRange: "R$ 2.800 – R$ 3.500",
    postedDaysAgo: 4,
    description: `Vaga: Trainee em Suporte Técnico & Sistemas
Empresa: Studio Pixel

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

function classifyTier(score: number): MatchTier {
  if (score >= 70) return "alta";
  if (score >= 45) return "media";
  return "baixa";
}

export function matchJobsToResume(
  resumeText: string,
  options: RadarFilterOptions = {},
): JobMatchItem[] {
  const { niche = "all", workModel = "all", search = "" } = options;
  const searchNorm = normalize(search.trim());
  const hasResume = countWords(resumeText) >= 15;

  const filtered = RADAR_JOBS.filter((job) => {
    if (niche !== "all" && job.niche !== niche) return false;
    if (workModel !== "all" && job.workModel !== workModel) return false;
    if (searchNorm) {
      const haystack = normalize(`${job.title} ${job.company} ${job.location} ${job.description}`);
      if (!haystack.includes(searchNorm)) return false;
    }
    return true;
  });

  const matched = filtered.map((job): JobMatchItem => {
    const analysis = analyze(job.description, hasResume ? resumeText : "", job.niche);
    const score = hasResume ? analysis.score : 0;
    const initialScore = hasResume ? analysis.initialScore : 0;
    return {
      ...job,
      score,
      initialScore,
      keywords: analysis.keywords,
      found: hasResume ? analysis.found : [],
      missing: hasResume ? analysis.missing : analysis.keywords,
      matchTier: classifyTier(score),
    };
  });

  return matched.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.found.length !== a.found.length) return b.found.length - a.found.length;
    return a.postedDaysAgo - b.postedDaysAgo;
  });
}

export function summarizeRadarMatches(items: JobMatchItem[]): RadarSummary {
  if (!items.length) {
    return { total: 0, highMatchCount: 0, bestScore: 0, averageScore: 0 };
  }
  const highMatchCount = items.filter((item) => item.score >= 70).length;
  const bestScore = Math.max(...items.map((item) => item.score));
  const averageScore = Math.round(
    items.reduce((acc, item) => acc + item.score, 0) / items.length,
  );

  return {
    total: items.length,
    highMatchCount,
    bestScore,
    averageScore,
  };
}
