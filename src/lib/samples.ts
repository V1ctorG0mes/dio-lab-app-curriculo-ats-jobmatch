export type NicheId = "tech" | "dados" | "produto" | "negocios" | "estagio";

export type NicheOption = {
  id: NicheId;
  label: string;
  shortLabel: string;
  description: string;
};

export const NICHES: NicheOption[] = [
  {
    id: "tech",
    label: "Tecnologia & Software",
    shortLabel: "Tecnologia",
    description: "Foco em linguagens, frameworks, APIs, cloud e testes.",
  },
  {
    id: "dados",
    label: "Dados, BI & IA",
    shortLabel: "Dados & BI",
    description: "Foco em SQL, Python, BI, ETL, estatística e ML.",
  },
  {
    id: "produto",
    label: "Produto & Growth",
    shortLabel: "Produto",
    description: "Foco em roadmap, discovery, métricas, OKRs e agile.",
  },
  {
    id: "negocios",
    label: "Finanças & Negócios",
    shortLabel: "Negócios",
    description: "Foco em ERP, Excel, DRE, processos, CRM e KPIs.",
  },
  {
    id: "estagio",
    label: "Primeiro Emprego / Estágio",
    shortLabel: "Estágio",
    description: "Destaca formação e projetos práticos antes da experiência.",
  },
];

export const SAMPLE_JOB_BUSINESS = `Vaga: Analista Financeiro & Operações Pleno
Empresa: Grupo Horizonte

Responsabilidades
- Conduzir o fechamento mensal, análise de DRE e fluxo de caixa
- Realizar conciliação bancária e controle orçamentário
- Otimizar processos operacionais no sistema ERP (SAP) e planilhas Excel avançado
- Construir relatórios gerenciais e dashboards de KPIs em Power BI para diretoria
- Negociar com fornecedores e alinhar stakeholders internos

Requisitos
- Experiência com ERP, Excel avançado, DRE e Fluxo de Caixa
- Conhecimento em Power BI e melhoria de processos
- Comunicação clara e trabalho em equipe`;

export const SAMPLE_RESUME_BUSINESS = `Camila Ferreira
Curitiba, PR | camila.ferreira@email.com | (41) 99123-4567

Resumo Profissional
Analista financeira com 4 anos de experiência em controladoria, fluxo de caixa e otimização de processos administrativos.

Experiência Profissional
Analista Financeira — Distribuidora Sul (2022 - atual)
- Estruturei o controle de fluxo de caixa e análise mensal de DRE, reduzindo divergências em 25%
- Automatizei rotinas de conciliação no Excel com macros e consultas em ERP SAP, economizando 8h semanais
- Elaborei relatórios de KPIs financeiros para diretoria e stakeholders comerciais

Assistente Administrativo — Comercial Paraná (2020 - 2022)
- Apoiei o controle de contas a pagar e receber utilizando sistema ERP e pacote Microsoft 365

Formação Acadêmica
Bacharelado em Administração — UFPR (2020)

Competências
Excel, ERP, SAP, DRE, Fluxo de Caixa, Power BI, Comunicação, Trabalho em equipe`;

export const SAMPLE_JOB_INTERN = `Vaga: Estágio em Desenvolvimento de Software
Empresa: EducaTech Brasil

Sobre a vaga
Buscamos estudante de Tecnologia com vontade de aprender desenvolvimento web e banco de dados em ambiente ágil.

Atividades
- Apoiar a criação de interfaces responsivas com HTML, CSS, JavaScript e React
- Escrever consultas básicas em SQL e colaborar com APIs REST
- Versionar código com Git e GitHub junto ao time em Scrum

Requisitos
- Cursando Análise e Desenvolvimento de Sistemas, Ciência da Computação ou áreas afins
- Conhecimento em Lógica de Programação, POO (Java ou Python) e Git
- Boa comunicação e trabalho em equipe`;

export const SAMPLE_RESUME_INTERN = `Lucas Almeida
Campinas, SP | lucas.almeida@email.com | github.com/lucasalmeida-dev

Resumo Profissional
Estudante de Análise e Desenvolvimento de Sistemas focado em desenvolvimento web e boas práticas de programação.

Formação Acadêmica
Tecnologia em Análise e Desenvolvimento de Sistemas — FATEC Campinas (2025 - 2027)

Projetos
Sistema Acadêmico de Biblioteca (2025)
- Desenvolvi interfaces responsivas com HTML, CSS e JavaScript integradas a banco de dados SQL
- Modelei regras de negócio aplicando POO em Java e versionamento no GitHub

Monitoria Voluntária de Algoritmos (2024)
- Auxiliei 30 alunos em exercícios de lógica de programação e resolução de problemas em Python

Competências Técnicas
HTML, CSS, JavaScript, Java, Python, SQL, Git, GitHub, Lógica de Programação, Trabalho em equipe`;

export function getSampleForNiche(niche: NicheId): { job: string; resume: string } {
  switch (niche) {
    case "dados":
      return { job: SAMPLE_JOB_DATA, resume: SAMPLE_RESUME_DATA };
    case "produto":
      return { job: SAMPLE_JOB_PM, resume: SAMPLE_RESUME_PM };
    case "negocios":
      return { job: SAMPLE_JOB_BUSINESS, resume: SAMPLE_RESUME_BUSINESS };
    case "estagio":
      return { job: SAMPLE_JOB_INTERN, resume: SAMPLE_RESUME_INTERN };
    case "tech":
    default:
      return { job: SAMPLE_JOB_FRONTEND, resume: SAMPLE_RESUME_FRONTEND };
  }
}

export const SAMPLE_JOB_FRONTEND = `Vaga: Desenvolvedor(a) Frontend React Pleno
Empresa: Nuvem Pay

Sobre a vaga
Buscamos uma pessoa desenvolvedora Frontend para construir a nova plataforma de pagamentos B2B da Nuvem Pay, um SaaS usado por mais de 4 mil empresas.

Responsabilidades
- Desenvolver interfaces com React, TypeScript e Next.js
- Evoluir nosso Design System no Figma e Storybook em parceria com o time de UX
- Integrar APIs REST e GraphQL
- Garantir acessibilidade (WCAG) e performance web (Core Web Vitals)
- Escrever testes automatizados com Jest e Testing Library

Requisitos
- 3+ anos de experiência com React e JavaScript
- Domínio de HTML, CSS e Tailwind CSS
- Experiência com Git e CI/CD
- Vivência com metodologias ágeis (Scrum)

Diferenciais
- Inglês intermediário
- Experiência com Cypress
- Mentoria de pessoas desenvolvedoras júnior`;

export const SAMPLE_RESUME_FRONTEND = `# Marina Costa
📍 São Paulo, SP | marina.costa@email.com | (11) 98765-4321 | linkedin.com/in/marinacosta

## 🚀 Sobre mim
Desenvolvedora frontend com 4 anos de experiência criando produtos web em startups de tecnologia. Apaixonada por interfaces acessíveis e código limpo.

## 💼 Experiência
**Desenvolvedora Frontend — Loja Ágil (2022 - atual)**
★ Desenvolvi o novo checkout em ReactJS e TS, reduzindo o abandono de carrinho em 18%
★ Criei componentes reutilizáveis documentados no Storybook
★ Integrei APIs RESTful de frete e pagamento
★ Implementei testes unitários com Jest

**Desenvolvedora Web Júnior — Agência Pixel (2020 - 2022)**
★ Criei landing pages com HTML5, CSS3 e JS
★ Trabalhei com versionamento no GitHub em times Scrum

## 🎓 Educação
Tecnologia em Análise e Desenvolvimento de Sistemas — FATEC São Paulo (2019)

## 🛠️ Skills
| Linguagens | Ferramentas |
| --- | --- |
| JavaScript, TypeScript | Figma, Vite, Tailwind |

## 🌎 Idiomas
Inglês intermediário`;

export const SAMPLE_JOB_DATA = `Vaga: Analista de Dados Pleno
Empresa: Varejo Norte

Responsabilidades
- Construir dashboards em Power BI para as áreas comerciais
- Escrever consultas SQL e manter pipelines de ETL
- Analisar KPIs de vendas com Python (Pandas) e estatística
- Apresentar resultados a stakeholders

Requisitos
- Experiência com SQL, Python e Power BI
- Excel avançado
- Desejável: modelagem de dados e Machine Learning`;

export const SAMPLE_RESUME_DATA = `Rafael Lima
Recife, PE | rafael.lima@email.com | (81) 99876-5432

Resumo
Analista de BI com 3 anos de experiência transformando dados de vendas em decisões.

Experiência Profissional
Analista de BI — Atacado Recife (2021 - atual)
- Criei painéis no PowerBI acompanhados semanalmente pela diretoria
- Automatizei relatórios em Python com Pandas, economizando 10h por semana
- Escrevi consultas em PostgreSQL para análises de margem
- Apresentei KPIs mensais para stakeholders comerciais

Formação Acadêmica
Bacharelado em Estatística — UFPE (2020)

Habilidades
SQL, Python, Power BI, Excel, estatística`;

export const SAMPLE_JOB_PM = `Vaga: Product Manager
Empresa: Saúde+ App

Você vai liderar o produto de agendamentos do nosso app.
- Definir roadmap e OKRs trimestrais
- Conduzir product discovery e pesquisa com usuários
- Priorizar backlog com o time de engenharia em Scrum
- Acompanhar métricas de produto e testes A/B
- Alinhar stakeholders e comunicar decisões
Requisitos: experiência com Jira, SQL básico e inglês avançado.`;

export const SAMPLE_RESUME_PM = `Juliana Ramos
Belo Horizonte, MG | juliana.ramos@email.com

Resumo profissional
Product Owner com 5 anos de experiência em produtos digitais de saúde e fintech.

Experiência Profissional
Product Owner — ClinicaFácil (2021 - atual)
- Defini o roadmap do módulo de teleconsulta, com 40 mil consultas por mês
- Conduzi entrevistas com usuários e discovery de novas funcionalidades
- Priorizei o backlog no Jira junto ao time de engenharia em Scrum
- Acompanhei KPIs de conversão e retenção
- Liderei o alinhamento com stakeholders médicos e comerciais

Formação Acadêmica
Administração — UFMG (2017)

Competências
Roadmap, Discovery, Jira, Scrum, OKRs

Idiomas
Inglês avançado`;
