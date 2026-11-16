import { describe, expect, it } from "vitest";
import { analyze, buildXRayText, normalize } from "./ats";
import { SEED_HISTORY, summarize } from "./history";
import {
  getSampleForNiche,
  NICHES,
  SAMPLE_JOB_FRONTEND,
  SAMPLE_JOB_INTERN,
  SAMPLE_RESUME_FRONTEND,
  SAMPLE_RESUME_INTERN,
} from "./samples";

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
      { ...SEED_HISTORY[0]!, score: 60 },
      { ...SEED_HISTORY[1]!, score: 90, title: "Tech Lead" },
    ]);
    expect(s.total).toBe(2);
    expect(s.average).toBe(75);
    expect(s.best?.title).toBe("Tech Lead");
  });
});

describe("Writing quality, X-Ray and Niche support", () => {
  it("measures action verbs and impact metrics while ignoring calendar years", () => {
    const r = analyze(SAMPLE_JOB_FRONTEND, SAMPLE_RESUME_FRONTEND);
    expect(r.quality.totalBullets).toBe(6);
    expect(r.quality.actionVerbBullets).toBe(6);
    expect(r.quality.actionVerbRate).toBe(100);
    expect(r.quality.detectedMetrics).toContain("18%");
    expect(r.quality.detectedMetrics).toContain("4 anos");
    expect(r.quality.detectedMetrics).not.toContain("2022");
    expect(r.quality.detectedMetrics).not.toContain("2019");
  });

  it("builds structured ATS X-Ray text with matched keywords and sections", () => {
    const r = analyze(SAMPLE_JOB_FRONTEND, SAMPLE_RESUME_FRONTEND);
    const xray = buildXRayText(r);
    expect(xray).toContain("[CABEÇALHO_DETECTADO]");
    expect(xray).toContain("MARINA COSTA");
    expect(xray).toContain("[HARD_SKILLS_MATCHED");
    expect(xray).toContain("[SEÇÕES_LINEARIZADAS");
    expect(xray).toContain("[SEÇÃO: EXPERIÊNCIA PROFISSIONAL]");
  });

  it("places education and projects first for the internship niche and provides samples for all niches", () => {
    const intern = analyze(SAMPLE_JOB_INTERN, SAMPLE_RESUME_INTERN, "estagio");
    const titles = intern.resume.sections.map((s) => s.title);
    expect(titles.indexOf("FORMAÇÃO ACADÊMICA")).toBeLessThan(titles.indexOf("COMPETÊNCIAS TÉCNICAS"));
    expect(titles.indexOf("PROJETOS")).toBeLessThan(titles.indexOf("COMPETÊNCIAS TÉCNICAS"));

    for (const niche of NICHES) {
      const sample = getSampleForNiche(niche.id);
      expect(sample.job.length).toBeGreaterThan(50);
      expect(sample.resume.length).toBeGreaterThan(50);
    }
  });
});
