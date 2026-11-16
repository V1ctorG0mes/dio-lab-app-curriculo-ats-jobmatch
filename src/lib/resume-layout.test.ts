import { describe, expect, it } from "vitest";
import { analyze, normalize } from "./ats";
import { groupSkills, highlightBullet, layoutSection, parseEntryHeader, SKILL_GROUPS } from "./resume-layout";
import { SAMPLE_JOB_FRONTEND, SAMPLE_RESUME_FRONTEND } from "./samples";

describe("A4 résumé layout", () => {
  it("splits a job line into role, company and period", () => {
    expect(parseEntryHeader("Desenvolvedora Frontend — Loja Ágil (2022 - atual)")).toEqual({
      title: "Desenvolvedora Frontend",
      org: "Loja Ágil",
      period: "2022 – Atual",
    });
  });

  it("groups skills into Tecnologias and Metodologias rows", () => {
    const rows = groupSkills(["Competências alinhadas à vaga: React, Scrum, CI/CD, TypeScript, Inglês"]);
    expect(rows).toEqual([
      { label: SKILL_GROUPS.tech, value: "React, TypeScript" },
      { label: SKILL_GROUPS.method, value: "Scrum, CI/CD" },
      { label: SKILL_GROUPS.soft, value: "Inglês" },
    ]);
  });

  it("never drops a word the candidate wrote", () => {
    const { resume } = analyze(SAMPLE_JOB_FRONTEND, SAMPLE_RESUME_FRONTEND);
    for (const s of resume.sections) {
      const blocks = layoutSection(s);
      const rendered = normalize(JSON.stringify(blocks));
      const words = normalize(s.lines.join("\n").replace(/^- /gm, "").replace(/^Competências alinhadas à vaga:/m, "")).match(/[\p{L}\d]{3,}/gu) ?? [];
      for (const w of words) {
        expect(rendered.includes(w), `${s.title}: ${w}`).toBe(true);
      }
    }
  });

  it("bolds the opening action verb and the numeric result of a bullet", () => {
    const strong = highlightBullet("Desenvolvi o checkout, reduzindo o abandono em 18%")
      .filter((r) => r.strong)
      .map((r) => r.text);
    expect(strong).toEqual(["Desenvolvi", "18%"]);
  });

  it("does not turn PDF-wrapped prose sentences with commas into job headers and strips footers/bare bullets", () => {
    expect(parseEntryHeader("Atuação em rotina corporativa dinâmica, interagindo com diversas áreas da empresa para")).toBeNull();
    expect(parseEntryHeader("Durante o curso, tenho desenvolvido forte base em programação backend")).toBeNull();

    const pdfLikeResume = [
      "CARLOS MENDES",
      "São Paulo, SP | carlos.mendes@example.com",
      "PERFIL PROFISSIONAL",
      "Estudante de Análise e Desenvolvimento de Sistemas (Universidade Exemplo)",
      "focado na resolução de problemas.",
      "EXPERIÊNCIA PROFISSIONAL",
      "Empresa Alfa - Divisão Sul (Multinacional) Jul/2023 – Out/2024",
      "Assistente Júnior, Setor Administrativo",
      "Atuação em rotina corporativa dinâmica, interagindo com diversas áreas",
      "para acompanhamento de demandas.",
      "Carlos Mendes - Currículo Página 1 de 2",
      "COMPETÊNCIAS TÉCNICAS IDIOMAS E CERTIFICAÇÕES",
      "•",
      "Tecnologia e Dev: Java (POO), Python,",
      "JavaScript, HTML/CSS.",
    ].join("\n");

    const { resume } = analyze("Vaga JavaScript HTML CSS", pdfLikeResume);
    const resumo = resume.sections.find((s) => s.title === "RESUMO PROFISSIONAL")!;
    const resumoBlocks = layoutSection(resumo);
    expect(resumoBlocks).toEqual([
      { type: "paragraph", text: "Estudante de Análise e Desenvolvimento de Sistemas (Universidade Exemplo) focado na resolução de problemas." },
    ]);

    const exp = resume.sections.find((s) => s.title === "EXPERIÊNCIA PROFISSIONAL")!;
    const expBlocks = layoutSection(exp);
    expect(expBlocks).toHaveLength(1);
    expect(expBlocks[0]).toMatchObject({
      type: "entry",
      title: "Empresa Alfa",
      org: "Divisão Sul (Multinacional)",
      period: "Jul/2023 – Out/2024",
    });

    // Footer and bare bullets must be stripped
    expect(JSON.stringify(resume)).not.toContain("Página 1 de 2");
    const skills = resume.sections.find((s) => s.title === "COMPETÊNCIAS TÉCNICAS")!;
    expect(skills.lines).not.toContain("•");
  });
});
