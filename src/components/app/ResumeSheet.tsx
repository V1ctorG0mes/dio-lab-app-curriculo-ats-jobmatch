import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { OptimizedResume } from "@/lib/ats";
import { cn } from "@/lib/utils";
import {
  layoutSection,
  highlightBullet,
  type LayoutBlock,
} from "@/lib/resume-layout";

function BulletText({ text }: { text: string }) {
  const runs = highlightBullet(text);
  return (
    <>
      {runs.map((r, i) =>
        r.strong ? (
          <strong key={i} className="font-semibold text-slate-900">
            {r.text}
          </strong>
        ) : (
          <span key={i}>{r.text}</span>
        ),
      )}
    </>
  );
}

function SectionBlock({ block }: { block: LayoutBlock }) {
  if (block.type === "paragraph") {
    return <p className="text-[13px] leading-relaxed text-slate-700">{block.text}</p>;
  }

  if (block.type === "skills") {
    return (
      <div className="space-y-1.5 text-[13px] text-slate-700">
        {block.rows.map((row, idx) => (
          <p key={idx} className="leading-snug">
            {row.label ? (
              <strong className="font-semibold text-slate-900">{row.label}: </strong>
            ) : null}
            <span>{row.value}</span>
          </p>
        ))}
      </div>
    );
  }

  if (block.type === "bullets") {
    return (
      <ul className="space-y-1 pl-4 text-[13px] leading-relaxed text-slate-700 list-disc">
        {block.items.map((item, idx) => (
          <li key={idx} className="pl-1">
            <BulletText text={item} />
          </li>
        ))}
      </ul>
    );
  }

  if (block.type === "entry") {
    return (
      <div className="resume-entry break-inside-avoid space-y-1.5">
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-0.5 sm:gap-2">
          <div className="text-[13px] text-slate-800">
            <span className="font-bold text-slate-900">{block.title}</span>
            {block.org && (
              <>
                <span className="text-slate-400 mx-1.5 font-normal">—</span>
                <span className="font-medium text-slate-700">{block.org}</span>
              </>
            )}
          </div>
          {block.period && (
            <span className="text-[12px] font-medium text-slate-500 whitespace-nowrap tracking-tight">
              {block.period}
            </span>
          )}
        </div>

        {block.notes.length > 0 && (
          <div className="space-y-1 text-[12.5px]">
            {block.notes.map((note, idx) => {
              const isSubtitle = idx === 0 && note.length <= 95 && !/[.!?]$/.test(note);
              return (
                <p
                  key={idx}
                  className={isSubtitle ? "font-semibold text-violet-700" : "text-slate-600 leading-relaxed"}
                >
                  {note}
                </p>
              );
            })}
          </div>
        )}

        {block.bullets.length > 0 && (
          <ul className="space-y-1 pl-4 text-[12.5px] leading-relaxed text-slate-700 list-disc">
            {block.bullets.map((bullet, idx) => (
              <li key={idx} className="pl-1">
                <BulletText text={bullet} />
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  return null;
}

/** Clean, executive single-column A4 sheet — aesthetic for recruiters and 100% readable for ATS. */
export function ResumeSheet({ resume, className }: { resume: OptimizedResume; className?: string }) {
  return (
    <article
      className={cn(
        "resume-sheet mx-auto w-full max-w-[794px] bg-white px-8 py-7 sm:px-10 sm:py-9 font-resume text-[12.5px] leading-normal text-slate-800 shadow-md ring-1 ring-slate-200/80 rounded-sm print:rounded-none print:shadow-none print:ring-0 print:p-0",
        className,
      )}
      style={{ minHeight: "min(1123px, 140vw)" }}
    >
      {/* Header: Bold name + contact line separated by • */}
      <header className="border-b border-slate-200 pb-3 mb-3.5 text-center sm:text-left">
        <h2 className="font-resume text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 uppercase">
          {resume.name}
        </h2>
        {resume.contact.length > 0 && (
          <p className="mt-1 text-[12px] text-slate-600 tracking-normal font-normal">
            {resume.contact.join(" • ")}
          </p>
        )}
      </header>

      {/* Sections: Violet uppercase title with thin line and subtle accent bar */}
      <div className="space-y-3.5">
        {resume.sections.map((section) => {
          const blocks = layoutSection(section);
          return (
            <section key={section.title} className="resume-section space-y-1.5">
              <div className="relative border-b border-slate-200 pb-1 flex items-center justify-between">
                <h3 className="font-resume text-[11.5px] font-bold uppercase tracking-wider text-violet-700 flex items-center gap-2">
                  <span className="inline-block w-1.5 h-3 bg-violet-600 rounded-xs" aria-hidden="true" />
                  {section.title}
                </h3>
              </div>
              <div className="space-y-2 pt-0.5">
                {blocks.map((block, idx) => (
                  <SectionBlock key={idx} block={block} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
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
