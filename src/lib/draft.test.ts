import { afterEach, describe, expect, it } from "vitest";
import { draft, loadJobIntoDraft, updateDraft } from "./draft";
import { SAMPLE_JOB_FRONTEND, SAMPLE_RESUME_FRONTEND } from "./samples";

afterEach(() => updateDraft({ job: "", resume: "", result: null, file: null, niche: "tech" }));
describe("Fluxo Otimizador → Radar → Otimizador", () => {
  it("mantém o currículo e arquivo ao escolher um cargo e recalcula a análise", () => {
    const file = { name: "meu-curriculo.txt", size: 200, text: SAMPLE_RESUME_FRONTEND };
    updateDraft({ resume: SAMPLE_RESUME_FRONTEND, file });
    const result = loadJobIntoDraft(SAMPLE_JOB_FRONTEND, "tech");
    expect(draft.resume).toBe(SAMPLE_RESUME_FRONTEND);
    expect(draft.file).toEqual(file);
    expect(draft.job).toBe(SAMPLE_JOB_FRONTEND);
    expect(result?.jobTitle).toContain("Frontend");
    expect(draft.result).toBe(result);
  });
  it("descarta a análise antiga quando o currículo ou vaga muda", () => {
    loadJobIntoDraft(SAMPLE_JOB_FRONTEND, "tech", SAMPLE_RESUME_FRONTEND);
    expect(draft.result).not.toBeNull();
    updateDraft({ resume: "Outro currículo" });
    expect(draft.result).toBeNull();
    loadJobIntoDraft(SAMPLE_JOB_FRONTEND, "tech", SAMPLE_RESUME_FRONTEND);
    updateDraft({ job: "Outra vaga" });
    expect(draft.result).toBeNull();
  });
});
