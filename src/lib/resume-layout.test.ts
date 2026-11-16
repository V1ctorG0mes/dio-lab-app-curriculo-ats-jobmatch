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
});
