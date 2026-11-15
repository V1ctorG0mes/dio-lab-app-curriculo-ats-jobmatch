import { useSyncExternalStore } from "react";
import { analyze, type OptimizedResume } from "./ats";
import {
  SAMPLE_JOB_DATA,
  SAMPLE_JOB_FRONTEND,
  SAMPLE_JOB_PM,
  SAMPLE_RESUME_DATA,
  SAMPLE_RESUME_FRONTEND,
  SAMPLE_RESUME_PM,
} from "./samples";

export type HistoryEntry = {
  id: string;
  title: string;
  company: string;
  createdAt: string;
  initialScore: number;
  score: number;
  found: string[];
  missing: string[];
  resume: OptimizedResume;
  plainText: string;
};

export const HISTORY_KEY = "jobmatch-ats:history:v1";

function seed(id: string, title: string, createdAt: string, jd: string, cv: string): HistoryEntry {
  const r = analyze(jd, cv);
  return {
    id,
    title,
    company: r.company,
    createdAt,
    initialScore: r.initialScore,
    score: r.score,
    found: r.found,
    missing: r.missing,
    resume: r.resume,
    plainText: r.plainText,
  };
}

/** Example analyses shown on first visit so the dashboard is never empty. */
export const SEED_HISTORY: HistoryEntry[] = [
  seed("seed-pm", "Product Manager", "2026-11-12T12:00:00.000Z", SAMPLE_JOB_PM, SAMPLE_RESUME_PM),
  seed(
    "seed-data",
    "Analista de Dados",
    "2026-11-08T12:00:00.000Z",
    SAMPLE_JOB_DATA,
    SAMPLE_RESUME_DATA,
  ),
  seed(
    "seed-frontend",
    "Dev Frontend React",
    "2026-11-03T12:00:00.000Z",
    SAMPLE_JOB_FRONTEND,
    SAMPLE_RESUME_FRONTEND,
  ),
];

const listeners = new Set<() => void>();
let cachedRaw: string | null | undefined;
let cachedValue: HistoryEntry[] = SEED_HISTORY;

function read(): HistoryEntry[] {
  const raw = window.localStorage.getItem(HISTORY_KEY);
  if (raw === cachedRaw) return cachedValue;
  cachedRaw = raw;
  if (raw === null) {
    cachedValue = SEED_HISTORY;
  } else {
    try {
      const parsed = JSON.parse(raw);
      cachedValue = Array.isArray(parsed) ? parsed : SEED_HISTORY;
    } catch {
      cachedValue = SEED_HISTORY;
    }
  }
  return cachedValue;
}

function write(next: HistoryEntry[]) {
  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => e.key === HISTORY_KEY && listener();
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useHistory(): HistoryEntry[] {
  return useSyncExternalStore(subscribe, read, () => SEED_HISTORY);
}

export function addHistoryEntry(entry: Omit<HistoryEntry, "id" | "createdAt">): HistoryEntry {
  const full: HistoryEntry = {
    ...entry,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  write([full, ...read()]);
  return full;
}

export function removeHistoryEntry(id: string) {
  write(read().filter((e) => e.id !== id));
}

export function summarize(entries: HistoryEntry[]) {
  if (!entries.length) return { total: 0, average: 0, best: null as HistoryEntry | null };
  const average = Math.round(entries.reduce((s, e) => s + e.score, 0) / entries.length);
  const best = entries.reduce((a, b) => (b.score > a.score ? b : a));
  return { total: entries.length, average, best };
}
