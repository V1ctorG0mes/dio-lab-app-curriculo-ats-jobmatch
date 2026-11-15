import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { OptimizedResume } from "@/lib/ats";
import { cn } from "@/lib/utils";

/** Clean, single-column A4 sheet — the layout ATS parsers read best. */
export function ResumeSheet({ resume, className }: { resume: OptimizedResume; className?: string }) {
  return (
    <article
      className={cn(
        "resume-sheet mx-auto w-full max-w-[794px] bg-paper px-10 py-10 font-resume text-[13px] leading-relaxed text-paper-foreground shadow-paper ring-1 ring-border sm:px-14 sm:py-12",
        className,
      )}
      style={{ minHeight: "min(1123px, 140vw)" }}
    >
      <header className="border-b border-paper-foreground/20 pb-3">
        <h2 className="font-resume text-2xl font-bold uppercase tracking-normal">{resume.name}</h2>
        {resume.contact.length > 0 && (
          <p className="mt-1 text-[12px]">{resume.contact.join(" | ")}</p>
        )}
      </header>
      {resume.sections.map((s) => (
        <section key={s.title} className="mt-4">
          <h3 className="mb-1.5 border-b border-paper-foreground/15 pb-0.5 font-resume text-[13px] font-bold uppercase tracking-wide">
            {s.title}
          </h3>
          <div className="space-y-0.5">
            {s.lines.map((line, i) =>
              line === "" ? (
                <div key={i} className="h-2" />
              ) : line.startsWith("- ") ? (
                <p key={i} className="pl-4 -indent-3">
                  • {line.slice(2)}
                </p>
              ) : (
                <p key={i}>{line}</p>
              ),
            )}
          </div>
        </section>
      ))}
    </article>
  );
}

/** Mounts a copy of the resume directly under <body> so print CSS can show only it. */
export function PrintableResume({ resume }: { resume: OptimizedResume }) {
  const [host, setHost] = useState<HTMLElement | null>(null);
  useEffect(() => {
    const el = document.createElement("div");
    el.className = "print-root";
    document.body.appendChild(el);
    setHost(el);
    return () => {
      document.body.removeChild(el);
    };
  }, []);
  return host ? createPortal(<ResumeSheet resume={resume} />, host) : null;
}
