import { FileText } from "lucide-react";

export function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <span className="relative grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-soft">
        <FileText className="size-5" strokeWidth={2.2} />
        <span className="absolute -right-1 -bottom-1 size-3.5 rounded-full border-2 border-surface bg-success" />
      </span>
      <span className="font-display text-lg font-bold tracking-tight text-foreground">
        JobMatch <span className="text-primary">ATS</span>
      </span>
    </span>
  );
}
