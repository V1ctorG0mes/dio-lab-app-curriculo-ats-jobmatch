import { describe, expect, it } from "vitest";
import { matchJobsToResume, RADAR_JOBS, summarizeRadarMatches } from "./jobs-radar";
import {
  SAMPLE_RESUME_BUSINESS,
  SAMPLE_RESUME_DATA,
  SAMPLE_RESUME_FRONTEND,
  SAMPLE_RESUME_INTERN,
  SAMPLE_RESUME_PM,
} from "./samples";

describe("Radar de Vagas Compatíveis", () => {
  it("contém vagas curadas para todos os 5 nichos", () => {
    const niches = new Set(RADAR_JOBS.map((j) => j.niche));
    expect(niches).toEqual(new Set(["tech", "dados", "produto", "negocios", "estagio"]));
    expect(RADAR_JOBS.length).toBeGreaterThanOrEqual(15);
  });

  it("ranqueia vagas de Frontend React no topo para o currículo de Marina Costa", () => {
    const matches = matchJobsToResume(SAMPLE_RESUME_FRONTEND);
    expect(matches[0]?.niche).toBe("tech");
    expect(matches[0]?.title).toContain("React");
    expect(matches[0]?.score).toBeGreaterThanOrEqual(70);
    expect(matches[0]?.matchTier).toBe("alta");
    // Ensure descending sort order
    for (let i = 1; i < matches.length; i++) {
      expect(matches[i - 1]!.score).toBeGreaterThanOrEqual(matches[i]!.score);
    }
  });

  it("identifica alta compatibilidade nas respectivas áreas para Dados, Produto, Negócios e Estágio", () => {
    const dataTop = matchJobsToResume(SAMPLE_RESUME_DATA)[0];
    const pmTop = matchJobsToResume(SAMPLE_RESUME_PM)[0];
    const businessTop = matchJobsToResume(SAMPLE_RESUME_BUSINESS)[0];
    const internTop = matchJobsToResume(SAMPLE_RESUME_INTERN)[0];

    expect(dataTop?.niche).toBe("dados");
    expect(pmTop?.niche).toBe("produto");
    expect(businessTop?.niche).toBe("negocios");
    expect(internTop?.niche).toBe("estagio");
  });

  it("filtra corretamente por nicho, modelo de trabalho e termo de busca", () => {
    const remoteTech = matchJobsToResume(SAMPLE_RESUME_FRONTEND, {
      niche: "tech",
      workModel: "Remoto",
      search: "React",
    });
    expect(remoteTech.length).toBeGreaterThan(0);
    for (const job of remoteTech) {
      expect(job.niche).toBe("tech");
      expect(job.workModel).toBe("Remoto");
      expect(`${job.title} ${job.description}`.toLowerCase()).toContain("react");
    }
  });

  it("lida graciosamente com currículo vazio ou muito curto", () => {
    const matches = matchJobsToResume("curto");
    expect(matches.length).toBe(RADAR_JOBS.length);
    expect(matches.every((m) => m.score === 0 && m.found.length === 0)).toBe(true);
    const summary = summarizeRadarMatches(matches);
    expect(summary.bestScore).toBe(0);
    expect(summary.highMatchCount).toBe(0);
  });

  it("calcula corretamente o resumo estatístico dos matches", () => {
    const matches = matchJobsToResume(SAMPLE_RESUME_FRONTEND);
    const summary = summarizeRadarMatches(matches);
    expect(summary.total).toBe(matches.length);
    expect(summary.bestScore).toBe(matches[0]?.score);
    expect(summary.highMatchCount).toBeGreaterThanOrEqual(1);
    expect(summary.averageScore).toBeGreaterThan(0);
  });
});
