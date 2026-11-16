import { useRef, useState, type DragEvent } from "react";
import { FileText, Loader2, RefreshCw, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ACCEPT_ATTR, formatFileSize } from "@/lib/resume-file";

export type UploadedFileInfo = { name: string; size: number };

export function ResumeUpload(props: {
  file: UploadedFileInfo | null;
  loading: boolean;
  onFile: (file: File) => void;
  onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const depth = useRef(0);

  const pick = () => inputRef.current?.click();

  const dragHandlers = {
    onDragEnter: (e: DragEvent) => {
      e.preventDefault();
      depth.current += 1;
      setDragging(true);
    },
    onDragOver: (e: DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
    },
    onDragLeave: (e: DragEvent) => {
      e.preventDefault();
      depth.current = Math.max(0, depth.current - 1);
      if (depth.current === 0) setDragging(false);
    },
    onDrop: (e: DragEvent) => {
      e.preventDefault();
      depth.current = 0;
      setDragging(false);
      const f = e.dataTransfer.files?.[0];
      if (f && !props.loading) props.onFile(f);
    },
  };

  const hiddenInput = (
    <input
      ref={inputRef}
      type="file"
      accept={ACCEPT_ATTR}
      className="sr-only"
      tabIndex={-1}
      aria-label="Arquivo do currículo"
      onChange={(e) => {
        const f = e.target.files?.[0];
        if (f) props.onFile(f);
        e.target.value = "";
      }}
    />
  );

  if (props.file && !props.loading) {
    return (
      <div
        {...dragHandlers}
        className={cn(
          "flex items-center gap-3 rounded-xl border border-dashed px-3 py-2.5 transition-colors",
          dragging ? "border-success bg-success-soft" : "border-primary-border bg-primary-soft/60",
        )}
      >
        {hiddenInput}
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-surface text-primary shadow-soft">
          <FileText className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground" title={props.file.name}>
            {props.file.name}
          </p>
          <p className="text-xs text-muted-foreground">
            {dragging ? "Solte para substituir" : `${formatFileSize(props.file.size)} · texto extraído abaixo`}
          </p>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={pick} className="shrink-0">
          <RefreshCw /> Trocar
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={props.onRemove}
          aria-label="Remover arquivo"
          className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
        >
          <X />
        </Button>
      </div>
    );
  }

  return (
    <div
      {...dragHandlers}
      role="button"
      tabIndex={0}
      aria-label="Enviar arquivo do currículo"
      onClick={() => !props.loading && pick()}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && !props.loading) {
          e.preventDefault();
          pick();
        }
      }}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-5 text-center transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary",
        dragging
          ? "scale-[1.01] border-success bg-success-soft"
          : "border-primary-border bg-primary-soft/40 hover:bg-primary-soft",
        props.loading && "cursor-wait opacity-80",
      )}
    >
      {hiddenInput}
      <span
        className={cn(
          "grid size-10 place-items-center rounded-xl transition-colors",
          dragging ? "bg-success text-success-foreground" : "bg-surface text-primary shadow-soft",
        )}
      >
        {props.loading ? <Loader2 className="size-5 animate-spin" /> : <Upload className="size-5" />}
      </span>
      <div>
        <p className="text-sm font-semibold text-foreground">
          {props.loading
            ? "Lendo arquivo…"
            : dragging
              ? "Solte o arquivo aqui"
              : "Arraste seu currículo ou"}
        </p>
        <p className="text-xs text-muted-foreground">.txt, .md, .docx ou .pdf · até 10 MB · lido só no seu navegador</p>
      </div>
      {!props.loading && !dragging && (
        <Button
          type="button"
          variant="subtle"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            pick();
          }}
        >
          <Upload /> Selecionar Arquivo
        </Button>
      )}
    </div>
  );
}
