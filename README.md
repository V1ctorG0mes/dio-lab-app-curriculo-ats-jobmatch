# 📄 JobMatch ATS — Otimizador de Currículos & Matchmaking para Robôs ATS

<p align="center">
  <img src="https://img.shields.io/badge/Bootcamp-Santander%20%2F%20DIO-red?style=for-the-badge" alt="DIO Bootcamp" />
  <img src="https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/shadcn%2Fui-000000?style=for-the-badge&logo=shadcnui&logoColor=white" alt="shadcn/ui" />
  <img src="https://img.shields.io/badge/Lovable-FF5722?style=for-the-badge" alt="Lovable" />
  <img src="https://img.shields.io/badge/Status-Online-success?style=for-the-badge" alt="Status" />
</p>

> Projeto desenvolvido para o desafio prático do **Bootcamp Santander: Construa seu Primeiro App com I.A.** na plataforma **DIO (Digital Innovation One)**, aplicando Inteligência Artificial como parceira de desenvolvimento desde a concepção do MVP, engenharia de prompts, até a evolução com upload de arquivos e publicação no ar.

---

## 🌐 Demonstração Online & Repositório

- **Aplicação no Ar (Deploy):** [https://curriculo-ats-jobmatch.lovable.app/](https://curriculo-ats-jobmatch.lovable.app/)
- **Repositório no GitHub:** [https://github.com/V1ctorG0mes/dio-lab-app-curriculo-ats-jobmatch](https://github.com/V1ctorG0mes/dio-lab-app-curriculo-ats-jobmatch)

---

## 📸 Telas da Aplicação

<div align="center">
  <h3>1. Otimizador ATS com Upload de Arquivo (Drag & Drop) & Diagnóstico de Match</h3>
  <img src="docs/screenshots/01-otimizador-ats.jpg" alt="Otimizador ATS com Upload" width="90%" />

  <br/><br/>
  <h3>2. Dashboard de Métricas & Histórico com Gráficos Recharts</h3>
  <img src="docs/screenshots/02-dashboard-historico.jpg" alt="Dashboard e Histórico" width="90%" />

  <br/><br/>
  <h3>3. Os 5 Mandamentos para Passar pelo Robô ATS</h3>
  <img src="docs/screenshots/03-mandamentos-ats.jpg" alt="5 Mandamentos ATS" width="70%" />
</div>

---

## 🎯 1. A Dor Escolhida e Por Que Vale um Negócio

### O Problema
Milhões de profissionais altamente capacitados se candidatam diariamente a vagas de emprego, mas **seus currículos são descartados nos primeiros 5 segundos por robôs de triagem (ATS — *Applicant Tracking Systems*)**, como Gupy, Workday, Taleo e Greenhouse, antes mesmo de qualquer recrutador humano abrir o documento.

Os principais motivos de rejeição algorítmica são:
1. **Desalinhamento de Vocabulário:** A vaga pede *"React"* e o candidato escreveu *"ReactJS"*; a vaga pede *"Scrum"* e o candidato escreveu *"Métodos Ágeis"*. O robô não pontua o termo e diminui o ranking do candidato.
2. **Formatação Incompatível:** Tabelas com múltiplas colunas, gráficos de barra de habilidades, caixas de texto e ícones decorativos embaralham o parser de leitura óptica dos ATS.
3. **Falta de Clareza em Resultados:** Experiências descritas de forma genérica sem verbos de ação e métricas tangíveis de impacto.

### A Oportunidade
Construir uma ferramenta web **ágil, 100% gratuita, sem necessidade de cadastro ou atrito**, que analisa a aderência entre a vaga e o currículo, diagnostica termos ausentes e formata uma versão limpa e legível para qualquer robô de RH, agora com suporte a **upload direto de arquivos** para eliminar a fricção de copiar e colar.

---

## 🛡️ 2. O Princípio Ético Inegociável (A Regra de Ouro)

> *"Garantia Ética: Este app alinha palavras-chave e formatação para sistemas ATS, mas **NUNCA inventa experiências que você não possui**."*

Seguindo a diretriz pedagógica do Expert Bruno na DIO, a ferramenta:
- **Não alucina competências:** Ela nunca cria cargos fictícios, empresas imaginárias ou cursos inexistentes.
- **Trabalha com equivalência semântica:** Mapeia termos técnicos (léxico com suporte a sinônimos e variações de grafia) e reorganiza o conteúdo já fornecido pelo candidato para evidenciar seus pontos fortes.
- **Foco na transparência:** A seção de palavras-chave faltantes atua como um guia de autoavaliação sincero sobre o que a vaga exige e o que o candidato de fato sabe.

---

## 📊 3. Tamanho de Mercado e Business Model Canvas

### Estimativa de Mercado (TAM, SAM, SOM)
- **TAM (Total Addressable Market):** Mais de **100 milhões de profissionais economicamente ativos** no Brasil participando de seleções corporativas.
- **SAM (Serviceable Addressable Market):** Aproximadamente **8 milhões de profissionais de tecnologia, produtos digitais, finanças e serviços corporativos** cujos processos seletivos são mediados por softwares ATS.
- **SOM (Serviceable Obtainable Market):** **120.000 profissionais em busca ativa de recolocação ou transição de carreira** que buscam ferramentas rápidas de otimização de currículo sem pagar assinaturas mensais caras.

### Business Model Canvas (Resumo Executivo)
| Bloco do Canvas | Descrição no Negócio |
| :--- | :--- |
| **Proposta de Valor** | Matchmaking instantâneo de currículos com vagas, leitura automática de arquivos (.pdf/.docx/.txt) e geração de versão 100% legível por ATS em menos de 1 minuto, com garantia ética de veracidade. |
| **Segmento de Clientes** | Desenvolvedores, analistas de dados, gerentes de produto e profissionais em transição de carreira. |
| **Canais** | Aplicação Web responsiva (SPA), compartilhamento orgânico em comunidades tech (LinkedIn, GitHub, Discord). |
| **Relacionamento** | Experiência self-service instantânea, sem fricção de login obrigatório, com salvamento transparente no navegador (`localStorage`). |
| **Fontes de Receita (Roadmap)** | Versão Core 100% gratuita; expansão futura para planos Pro com integração a portais de vagas e simulação de entrevistas com IA. |
| **Recursos Chave** | Algoritmo Léxico ATS client-side, leitor de arquivos no navegador, componentes acessíveis shadcn/ui, dashboard analítico com Recharts. |
| **Atividades Chave** | Curadoria contínua do dicionário de palavras-chave técnicas, refinamento de parsers de arquivo e testes de compatibilidade. |
| **Parcerias Chave** | Lovable (desenvolvimento ágil assistido por IA) e DIO (ecossistema de educação tech). |
| **Estrutura de Custos** | Custo operacional zero no MVP (deploy estático em Cloudflare/Lovable e processamento local no cliente). |

---

## 🖥️ 4. O Fluxo da Aplicação

```
  [Colar Vaga]   +   [Upload .pdf/.docx/.txt ou Colar CV]
       │                         │
       └───────────┬─────────────┘
                   ▼
       [Extração de Keywords & Léxico]
                   ▼
     ┌─────────────────────────────┐
     │  Diagnóstico & Match Score  │
     │  - Score (%) em Verde Lima  │
     │  - Keywords Encontradas     │
     │  - Keywords Faltantes       │
     └─────────────┬───────────────┘
                   ▼
   ┌────────────────────────────────┐
   │ Geração da Versão Otimizada    │
   │ - Estrutura Padrão ATS         │
   │ - Verbos de Ação + Impacto     │
   │ - Aba de Texto Puro (Gupy)     │
   └───────────────┬────────────────┘
                   ▼
     [Copiar]  │  [Salvar PDF]  │  [Dashboard de Histórico]
```

1. **Upload de Arquivo & Entrada de Dados:** 
   - Zona de **Drag & Drop** com suporte a arquivos `.pdf`, `.docx`, `.txt` e `.md` (até 10 MB) processados **100% no navegador (client-side)**, garantindo total privacidade do candidato.
   - Opção tradicional de colar texto livremente ou utilizar o botão **"Carregar Exemplo de Teste"** para experimentação com 1 clique (presets de Frontend, Dados e Product Management).
2. **Motor Léxico ATS:** O algoritmo extrai termos técnicos, hard skills, metodologias e certificações, comparando-os com o currículo por meio de expressões regulares seguras e normalização de caracteres (sem acentos e minúsculas).
3. **Diagnóstico Visual:** Círculo de progresso animado com o Match Score, badges em verde lima para termos validados e badges roxos para palavras ausentes.
4. **Currículo ATS Formatado:**
   - **Modo Folha A4:** Tipografia limpa, hierarquia linear (sem colunas), cabeçalho executivo e tópicos objetivos.
   - **Modo Texto Puro:** Formatado para copiar e colar diretamente em caixas de texto de portais de recrutamento (ex: Gupy/Workday).
5. **Exportação Sem Dependências Pesadas:** Botão de cópia rápida com Toast de confirmação e botão de impressão estilizado via regras CSS `@media print` para salvar em PDF perfeito.
6. **Dashboard com Gráficos & Histórico:** Página dedicada (`/dashboard`) com KPIs de evolução, tabela de histórico de candidaturas salvas no `localStorage` e gráfico de barras comparando **Nota Inicial vs. Nota Otimizada**.
7. **Modal "5 Mandamentos ATS":** Dicas práticas e didáticas para candidatos nunca caírem em armadilhas de formatação.

---

## 🤖 5. Engenharia de Prompts (Lovable)

### 1º Prompt: Concepção do MVP (Mega Prompt Único)
```markdown
Crie uma aplicação web SPA completa, moderna e responsiva chamada JobMatch ATS, 
utilizando React, React Router, Tailwind CSS e componentes do shadcn/ui.

A aplicação serve para comparar currículos com vagas de emprego, gerar versões 
amigáveis para robôs ATS (Application Tracking Systems) e acompanhar métricas em um Dashboard.

1. Identidade Visual & Design System:
- Design System: Componentes shadcn/ui (Button, Card, Badge, Tabs, Progress, Dialog, Table, Alert, Tooltip).
- Cores: Fundo Branco (#FFFFFF), Primária Roxo Claro (#8B5CF6 / violet-500), Destaque Verde Lima (#84CC16 / lime-500).

2. Princípio Ético Obrigatório:
- "Garantia Ética: Este app alinha palavras-chave e formatação para sistemas ATS, mas NUNCA inventa experiências que você não possui."

3. Navegação Global:
- Header com rotas: "Otimizador ATS" (/), "Dashboard & Histórico" (/dashboard) e modal "Dicas ATS".

4. Página 1: Otimizador ATS (/):
- Entradas para Descrição da Vaga e Currículo com botão "Carregar Exemplo de Teste".
- Diagnóstico instantâneo: Score de Match (%), Palavras-Chave Encontradas vs. Faltantes.
- Visualizador do Currículo Otimizado em A4 e Texto Puro, com exportação e impressão limpa.

5. Página 2: Dashboard & Histórico (/dashboard):
- Cards de KPIs (Total de análises, Score médio, Maior match).
- Gráfico de barras comparando Nota Inicial vs. Nota Otimizada ATS (Recharts).
- Tabela de histórico persistida em localStorage.
```

### 2º Prompt: Evolução do Produto (Upload de Arquivos com Drag & Drop)
```markdown
Mantenha todas as funcionalidades e estilo atuais da aplicação e adicione suporte a upload de arquivos no card "Seu currículo atual" na página principal (`src/routes/index.tsx`):

1. Interface de Upload (shadcn/ui):
- Acima da área de texto do currículo, crie uma zona de upload interativa com suporte a Drag & Drop (arrastar e soltar) e botão "Selecionar Arquivo".
- Aceite os formatos: `.txt`, `.md`, `.docx` e `.pdf` (até 10 MB).
- Estilo: Borda tracejada suave (`border-dashed border-violet-200`), ícone de upload da Lucide, e efeito visual em verde lima ao arrastar um arquivo por cima.

2. Lógica de Leitura 100% Client-Side:
- Para arquivos `.txt` e `.md`: Leia diretamente usando a API nativa `FileReader`.
- Para arquivos `.docx`: Utilize uma biblioteca leve de leitura client-side (como `mammoth`) para extrair o texto puro.
- Para arquivos `.pdf`: Utilize `pdfjs-dist` (ou leitor nativo de texto de PDF no navegador) para extrair o texto das páginas.
- Assim que o arquivo for lido, preencha automaticamente a Textarea do currículo com o texto extraído, atualize o contador de palavras e exiba um Toast de sucesso.

3. Controle do Arquivo Carregado:
- Se houver um arquivo carregado, mostre uma badge/tag com o nome do arquivo, tamanho e um botão com ícone 'X' para remover ou substituir o arquivo facilmente.
```

---

## 🗺️ 6. Roadmap de Evolução Futura

Para as próximas iterações do produto:
- [x] **Upload de Arquivo:** Suporte a arquivos `.pdf`, `.docx`, `.txt` e `.md` via Drag & Drop.
- [x] **Exportação em .DOCX (Word):** Download direto do currículo editável no formato Word mantendo a hierarquia de coluna única ATS.
- [x] **Visão Raio-X do Robô ATS:** Aba demonstrando a extração bruta e tags semânticas lidas pelo parser algorítmico com destaque de keywords.
- [x] **Analisador de Verbos de Ação & Métricas:** Métricas em tempo real avaliando a densidade de verbos fortes e indicadores numéricos (`%`, `R$`, números) nos tópicos de experiência.
- [x] **Seletor de Área / Nicho:** Filtro por especialidade (Tech, Dados, Produto, Negócios, Primeiro Emprego) adaptando o dicionário léxico, exemplos e ordenação de seções.
- [x] **Redesign Executivo da Folha A4:** Aprimamento visual, hierarquia tipográfica, agrupamento inteligente de PDFs e configurações de impressão A4 (`15mm`) mantendo 100% de compatibilidade com robôs ATS.
- [ ] **Radar de Vagas Compatíveis (Matchmaking):** Painel que cruza o currículo enviado com um catálogo de vagas em aberto, ranqueando as mais aderentes por Match Score (%) com botão de 1 clique para gerar o CV otimizado para aquela vaga.

---

## 🛠️ Tecnologias Utilizadas

- **[React 19](https://react.dev/):** Interface de usuário reativa com a versão mais recente do ecossistema React.
- **[TypeScript](https://www.typescriptlang.org/):** Tipagem estática rigorosa para garantir segurança e manutenibilidade.
- **[Tailwind CSS v4](https://tailwindcss.com/):** Estilização moderna e utilitária com alta performance.
- **[TanStack Router / TanStack Start](https://tanstack.com/router):** Roteamento tipado com renderização rápida e suporte a SSR/CSR.
- **[shadcn/ui](https://ui.shadcn.com/) / [Radix UI](https://www.radix-ui.com/):** Componentes de interface acessíveis, consistentes e customizáveis.
- **[Recharts](https://recharts.org/):** Visualização de dados e gráficos comparativos de evolução do candidato.
- **[Lucide React](https://lucide.dev/):** Ícones modernos e consistentes.
- **[Sonner](https://sonner.emilkowal.ski/):** Sistema de notificações e toasts visuais.
- **[Vitest](https://vitest.dev/):** Suíte de testes unitários para o motor léxico ATS e navegação.

---

## 🔒 Auditoria de Segurança & Privacidade

Antes da publicação, o código-fonte foi auditado e aprovado com base nas diretrizes do Bootcamp:
- ✅ **Zero Chaves de API Expostas:** O aplicativo não utiliza chaves de terceiros ou segredos no cliente.
- ✅ **Zero Dados Pessoais Sensíveis:** Todos os exemplos de teste utilizam nomes e contatos fictícios (*Marina Costa*, *Rafael Lima*, etc.).
- ✅ **Zero Custos Ocultos:** Toda a análise, histórico, leitura de arquivos e cálculos operam 100% no navegador do usuário via JavaScript nativo e `localStorage`.

---

## 🚀 Como Executar Localmente

```bash
# 1. Clone o repositório
git clone https://github.com/V1ctorG0mes/dio-lab-app-curriculo-ats-jobmatch.git

# 2. Acesse a pasta do projeto
cd dio-lab-app-curriculo-ats-jobmatch

# 3. Instale as dependências
npm install

# 4. Inicie o servidor de desenvolvimento
npm run dev

# 5. Execute a suíte de testes
npm test
```

---

## 👨‍💻 Autor

Desenvolvido por **Victor Gomes**  
Bootcamp Santander: Construa seu Primeiro App com I.A. — **DIO**  
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/V1ctorG0mes)
