import { describe, expect, it } from "vitest";
import { analyze, normalize } from "./ats";
import { SEED_HISTORY, summarize } from "./history";
import { SAMPLE_JOB_FRONTEND, SAMPLE_RESUME_FRONTEND } from "./samples";

describe("ATS analysis", () => {
  const result = analyze(SAMPLE_JOB_FRONTEND, SAMPLE_RESUME_FRONTEND);

  it("never adds missing keywords to the optimized resume (ethical guarantee)", () => {
    const text = normalize(result.plainText);
    expect(result.missing.length).toBeGreaterThan(0);
    for (const k of result.missing) {
      expect(text.includes(normalize(k))).toBe(false);
    }
  });

  it("counts a skill written with a different spelling as found (ReactJS → React)", () => {
    const r = analyze(
      "Vaga: Frontend\nRequisitos: React e TypeScript",
      "Ana\nana@email.com\n\nExperiência\n- Apps em ReactJS e TS",
    );
    expect(r.found).toEqual(["React", "TypeScript"]);
    expect(r.missing).toEqual([]);
  });

  it("optimized score is never lower than the original score", () => {
    expect(result.score).toBeGreaterThanOrEqual(result.initialScore);
  });

  it("removes emojis, tables and markdown from the ATS version", () => {
    expect(result.plainText).not.toMatch(/\p{Extended_Pictographic}|\*\*|^\s*\|/mu);
    expect(result.plainText).toContain("EXPERIÊNCIA PROFISSIONAL");
    expect(result.plainText).toContain("FORMAÇÃO ACADÊMICA");
  });

  it("reads job title and company from the description", () => {
    expect(result.jobTitle).toBe("Desenvolvedor(a) Frontend React Pleno");
    expect(result.company).toBe("Nuvem Pay");
  });
});

describe("History", () => {
  it("starts with 3 example analyses", () => {
    expect(SEED_HISTORY.map((e) => e.title)).toEqual([
      "Product Manager",
      "Analista de Dados",
      "Dev Frontend React",
    ]);
  });

  it("summarizes total, average and best score", () => {
    const s = summarize([
      { ...SEED_HISTORY[0], score: 60 },
      { ...SEED_HISTORY[1], score: 90, title: "Tech Lead" },
    ]);
    expect(s.total).toBe(2);
    expect(s.average).toBe(75);
    expect(s.best?.title).toBe("Tech Lead");
  });
});
