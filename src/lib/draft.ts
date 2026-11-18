import type { UploadedFileInfo } from "@/components/app/ResumeUpload";
import { useSyncExternalStore } from "react";
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

const emptySnapshot = { ...draft };
let snapshot = { ...draft };
const listeners = new Set<() => void>();

export function updateDraft(next: Partial<OptimizerDraft>) {
  const inputsChanged =
    (next.job !== undefined && next.job !== draft.job) ||
    (next.resume !== undefined && next.resume !== draft.resume);
  Object.assign(draft, next, inputsChanged && next.result === undefined ? { result: null } : {});
  snapshot = { ...draft };
  listeners.forEach((listener) => listener());
}

export function useOptimizerDraft() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    () => snapshot,
    () => emptySnapshot,
  );
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
