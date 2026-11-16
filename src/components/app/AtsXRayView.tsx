import { Bot, Copy, Cpu } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { buildXRayText, normalize, type AnalysisResult } from "@/lib/ats";

function highlightMatchedKeywords(text: string, found: string[]) {
  if (!found.length || !text) return text;
  const escaped = found
    .slice()
    .sort((a, b) => b.length - a.length)
    .map((k) => k.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&"));
  const re = new RegExp(`(${escaped.join("|")})`, "gi");
  const foundSet = new Set(found.map(normalize));
  const parts = text.split(re);

  return parts.map((part, i) =>
    foundSet.has(normalize(part)) ? (
      <mark key={i} className="rounded bg-lime-500/20 px-1 py-0.5 font-semibold text-lime-300">
        {part}
      </mark>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

export function AtsXRayView({ result }: { result: AnalysisResult }) {
  const copyXRay = async () => {
    try {
      await navigator.clipboard.writeText(buildXRayText(result));
      toast.success("Saída estruturada copiada", {
        description: "Árvore de dados extraída no formato do parser ATS.",
      });
    } catch {
      toast.error("Não foi possível copiar automaticamente.");
    }
  };

  return (
    <div className="space-y-3">
      <Alert className="rounded-xl border-primary-border bg-primary-soft text-primary-strong [&>svg]:text-primary">
        <Bot className="size-4" />
        <AlertTitle>Como o robô do RH enxerga seu currículo</AlertTitle>
        <AlertDescription className="text-primary-strong/85">
          Esta visão simula o texto bruto e a árvore de dados que sistemas ATS (Gupy, Workday, Taleo)
          extraem na leitura sequencial. Tabelas, gráficos e colunas duplas seriam perdidos antes desta etapa.
        </AlertDescription>
      </Alert>

      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950 text-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 bg-slate-900/80 px-4 py-2.5">
          <div className="flex items-center gap-2 font-mono text-xs text-slate-300">
            <Cpu className="size-3.5 text-lime-400" />
            <span>ATS_PARSER_STREAM</span>
            <span className="rounded bg-violet-500/20 px-1.5 py-0.5 text-[10px] text-violet-300">
              {result.niche.toUpperCase()}
            </span>
            <span className="rounded bg-lime-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-lime-300">
              MATCH {result.score}%
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={copyXRay}
            className="h-7 px-2.5 font-mono text-xs text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            <Copy className="mr-1.5 size-3.5" /> Copiar Saída Estruturada
          </Button>
        </div>

        <div className="max-h-[520px] space-y-4 overflow-auto p-4 font-mono text-xs leading-relaxed">
          <div>
            <p className="font-semibold text-violet-400">[CABEÇALHO DETECTADO]</p>
            <div className="mt-1 space-y-0.5 pl-3 text-slate-300">
              <p>
                <span className="text-slate-500">NOME: </span>
                <span className="font-semibold text-white">{result.resume.name.toUpperCase()}</span>
              </p>
              <p>
                <span className="text-slate-500">CONTATOS: </span>
                <span>{result.resume.contact.join(" | ") || "NÃO DETECTADO"}</span>
              </p>
            </div>
          </div>

          <div>
            <p className="font-semibold text-violet-400">
              [HARD SKILLS INDEXADAS ({result.found.length}/{result.keywords.length})]
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1.5 pl-3">
              {result.found.length ? (
                result.found.map((k) => (
                  <span
                    key={k}
                    className="rounded border border-lime-500/30 bg-lime-500/15 px-2 py-0.5 text-[11px] font-medium text-lime-300"
                  >
                    + {k}
                  </span>
                ))
              ) : (
                <span className="text-slate-500">(nenhuma keyword da vaga pontuada)</span>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <p className="font-semibold text-violet-400">
              [SEÇÕES LINEARIZADAS ({result.resume.sections.length})]
            </p>
            {result.resume.sections.map((section) => (
              <div key={section.title} className="border-l border-slate-800 pl-3">
                <p className="font-semibold text-violet-300">[SEÇÃO: {section.title}]</p>
                <div className="mt-1 space-y-1 text-slate-300">
                  {section.lines.map((line, i) =>
                    line === "" ? (
                      <div key={i} className="h-1" />
                    ) : (
                      <p key={i} className="whitespace-pre-wrap">
                        {highlightMatchedKeywords(line, result.found)}
                      </p>
                    ),
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
