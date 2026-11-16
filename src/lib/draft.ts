import type { UploadedFileInfo } from "@/components/app/ResumeUpload";
import { analyze, type AnalysisResult } from "./ats";
import type { NicheId } from "./samples";

export type OptimizerDraft = {
  niche: NicheId;
  job: string;
  resume: string;
  result: AnalysisResult | null;
  file: (UploadedFileInfo & { text: string }) | null;
};

export const draft: OptimizerDraft = {
  niche: "tech",
  job: "",
  resume: "",
  result: null,
  file: null,
};

export function updateDraft(next: Partial<OptimizerDraft>) {
  Object.assign(draft, next);
}

/**
 * Loads a job from the Radar directly into the Optimizer draft and computes
 * its ATS analysis immediately when a resume is present.
 */
export function loadJobIntoDraft(jobDescription: string, niche: NicheId, resumeText?: string) {
  const effectiveResume = resumeText !== undefined ? resumeText : draft.resume;
  const hasEnoughResume = effectiveResume.trim().split(/\s+/).filter(Boolean).length >= 15;
  const result = hasEnoughResume ? analyze(jobDescription, effectiveResume, niche) : null;

  updateDraft({
    niche,
    job: jobDescription,
    resume: effectiveResume,
    result,
  });

  return result;
}
