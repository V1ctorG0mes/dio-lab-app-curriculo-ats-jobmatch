import { describe, expect, it } from "vitest";
import { analyze } from "./ats";
import {
  generateJobRecommendations,
  hasRadarInputs,
  RADAR_PROFILES,
  summarizeRadarMatches,
} from "./jobs-radar";
import {
  SAMPLE_JOB_FRONTEND,
  SAMPLE_JOB_DATA,
  SAMPLE_RESUME_FRONTEND,
  SAMPLE_RESUME_DATA,
} from "./samples";

describe("Radar baseado no Otimizador", () => {
  it("exige vaga e currículo com pelo menos 15 palavras", () => {
    expect(hasRadarInputs(SAMPLE_JOB_FRONTEND, "curto")).toBe(false);
    expect(hasRadarInputs("curto", SAMPLE_RESUME_FRONTEND)).toBe(false);
    expect(generateJobRecommendations("", SAMPLE_RESUME_FRONTEND, "tech")).toEqual([]);
    expect(generateJobRecommendations(SAMPLE_JOB_FRONTEND, "", "tech")).toEqual([]);
    expect(
      hasRadarInputs(Array(15).fill("vaga").join(" "), Array(15).fill("currículo").join(" ")),
    ).toBe(true);
  });
  it("gera sugestões e inclui a vaga fornecida como referência", () => {
    const results = generateJobRecommendations(SAMPLE_JOB_FRONTEND, SAMPLE_RESUME_FRONTEND, "tech");
    expect(results.find((r) => r.id === "vaga-referencia")?.description).toBe(SAMPLE_JOB_FRONTEND);
    expect(results.some((r) => r.source === "perfil" && r.title.includes("React"))).toBe(true);
    expect(new Set(RADAR_PROFILES.map((r) => r.niche)).size).toBe(5);
  });
  it("calcula cobertura somente pelas competências, sem bônus de formatação", () => {
    for (const r of generateJobRecommendations(
      SAMPLE_JOB_FRONTEND,
      SAMPLE_RESUME_FRONTEND,
      "tech",
    )) {
      expect(r.score).toBe(Math.round((100 * r.found.length) / r.keywords.length));
      expect(r.found).toEqual(analyze(r.description, SAMPLE_RESUME_FRONTEND, r.niche).found);
    }
  });
  it("usa a vaga de referência para mudar a relevância e o ranking", () => {
    const front = generateJobRecommendations(SAMPLE_JOB_FRONTEND, SAMPLE_RESUME_FRONTEND, "tech");
    const data = generateJobRecommendations(SAMPLE_JOB_DATA, SAMPLE_RESUME_FRONTEND, "dados");
    const a = front.find((r) => r.id === "tech-react-pleno");
    const b = data.find((r) => r.id === "tech-react-pleno");
    expect(a).toBeDefined();
    expect(b).toBeDefined();
    expect(a?.referenceScore).not.toBe(b?.referenceScore);
    expect(a?.rankScore).not.toBe(b?.rankScore);
  });
  it("muda as indicações ao alterar o currículo", () => {
    const front = generateJobRecommendations(SAMPLE_JOB_FRONTEND, SAMPLE_RESUME_FRONTEND, "tech");
    const data = generateJobRecommendations(SAMPLE_JOB_DATA, SAMPLE_RESUME_DATA, "dados");
    expect(front[0]?.niche).toBe("tech");
    expect(data[0]?.niche).toBe("dados");
    expect(front.map((r) => [r.id, r.score])).not.toEqual(data.map((r) => [r.id, r.score]));
  });
  it("não exibe sugestões sem evidência suficiente", () => {
    const unrelated =
      "Sou profissional de confeitaria especializada em bolos doces festas sobremesas massas recheios coberturas decoração artesanal culinária";
    expect(generateJobRecommendations(SAMPLE_JOB_FRONTEND, unrelated, "tech")).toEqual([]);
  });
  it("filtra sugestões sem fabricar novos resultados", () => {
    const results = generateJobRecommendations(
      SAMPLE_JOB_FRONTEND,
      SAMPLE_RESUME_FRONTEND,
      "tech",
      { niche: "tech", search: "React" },
    );
    expect(results.length).toBeGreaterThan(0);
    expect(
      results.every((r) => r.niche === "tech" && `${r.title} ${r.description}`.includes("React")),
    ).toBe(true);
    expect(
      generateJobRecommendations(SAMPLE_JOB_FRONTEND, SAMPLE_RESUME_FRONTEND, "tech", {
        search: "zzzzzzz",
      }),
    ).toEqual([]);
  });
  it("ordena pela combinação de cobertura e proximidade e resume os resultados", () => {
    const results = generateJobRecommendations(SAMPLE_JOB_FRONTEND, SAMPLE_RESUME_FRONTEND, "tech");
    results.forEach((r, i) => {
      expect(r.rankScore).toBe(Math.round(0.8 * r.score + 0.2 * r.referenceScore));
      if (i > 0) expect(results[i - 1]?.rankScore).toBeGreaterThanOrEqual(r.rankScore);
    });
    expect(summarizeRadarMatches(results).total).toBe(results.length);
    expect(summarizeRadarMatches([]).bestScore).toBe(0);
  });
});
