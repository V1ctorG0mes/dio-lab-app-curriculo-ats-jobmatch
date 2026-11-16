import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  BarChart3,
  BookmarkPlus,
  Bot,
  Briefcase,
  CheckCircle2,
  Code2,
  Copy,
  Eraser,
  FileDown,
  FileText,
  FlaskConical,
  Gauge,
  GraduationCap,
  Info,
  Printer,
  Rocket,
  ScanSearch,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScoreRing } from "@/components/app/ScoreRing";
import { PrintableResume, ResumeSheet } from "@/components/app/ResumeSheet";
import { AtsXRayView } from "@/components/app/AtsXRayView";
import { analyze, countWords, type AnalysisResult } from "@/lib/ats";
import { addHistoryEntry } from "@/lib/history";
import { readResumeFile } from "@/lib/resume-file";
import { downloadResumeDocx } from "@/lib/resume-docx";
import { ResumeUpload, type UploadedFileInfo } from "@/components/app/ResumeUpload";
import { NICHES, getSampleForNiche, type NicheId } from "@/lib/samples";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Otimizador ATS — JobMatch ATS" },
      {
        name: "description",
        content:
          "Compare seu currículo com a vaga, veja o score de match e gere uma versão amigável para robôs ATS — sem inventar experiências.",
      },
      { property: "og:title", content: "Otimizador ATS — JobMatch ATS" },
      {
        property: "og:description",
        content: "Score de match, palavras-chave faltantes e currículo limpo em A4 para sistemas ATS.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OptimizerPage,
});

// Keeps the inputs while navigating between pages (client-only, in memory).
const draft: {
  niche: NicheId;
  job: string;
  resume: string;
  result: AnalysisResult | null;
  file: (UploadedFileInfo & { text: string }) | null;
} = {
  niche: "tech",
  job: "",
  resume: "",
  result: null,
  file: null,
};

const NICHE_ICONS: Record<NicheId, ReactNode> = {
  tech: <Code2 className="size-3.5" />,
  dados: <BarChart3 className="size-3.5" />,
  produto: <Rocket className="size-3.5" />,
  negocios: <Briefcase className="size-3.5" />,
  estagio: <GraduationCap className="size-3.5" />,
};

function OptimizerPage() {
  const [niche, setNiche] = useState<NicheId>(draft.niche);
  const [job, setJob] = useState(draft.job);
  const [resume, setResume] = useState(draft.resume);
  const [result, setResult] = useState<AnalysisResult | null>(draft.result);
  const [saveOpen, setSaveOpen] = useState(false);
  const [file, setFile] = useState(draft.file);
  const [reading, setReading] = useState(false);
  const [downloadingDocx, setDownloadingDocx] = useState(false);

  const update = (next: Partial<typeof draft>) => Object.assign(draft, next);

  const selectNiche = (nextNiche: NicheId) => {
    setNiche(nextNiche);
    if (result && countWords(job) >= 15 && countWords(resume) >= 15) {
      const updatedResult = analyze(job, resume, nextNiche);
      setResult(updatedResult);
      update({ niche: nextNiche, result: updatedResult });
    } else {
      update({ niche: nextNiche });
    }
  };

  const loadExample = () => {
    const sample = getSampleForNiche(niche);
    const nicheInfo = NICHES.find((n) => n.id === niche);
    setJob(sample.job);
    setResume(sample.resume);
    setResult(null);
    setFile(null);
    update({ job: sample.job, resume: sample.resume, result: null, file: null });
    toast.success(`Exemplo de ${nicheInfo?.shortLabel ?? "teste"} carregado`, {
      description: "Agora clique em Analisar Match.",
    });
  };

  const clearAll = () => {
    setJob("");
    setResume("");
    setResult(null);
    setFile(null);
    update({ job: "", resume: "", result: null, file: null });
  };

  const handleFile = async (f: File) => {
    setReading(true);
    try {
      const text = await readResumeFile(f);
      const info = { name: f.name, size: f.size, text };
      setResume(text);
      setFile(info);
      update({ resume: text, file: info });
      const n = countWords(text);
      toast.success(`Currículo carregado com sucesso (${n} ${n === 1 ? "palavra lida" : "palavras lidas"})`, {
        description: "Revise o texto abaixo antes de analisar.",
      });
    } catch (err) {
      toast.error("Não foi possível ler o arquivo", {
        description: err instanceof Error ? err.message : "Tente outro arquivo ou cole o texto.",
      });
    } finally {
      setReading(false);
    }
  };

  const removeFile = () => {
    // Only clear the text if the user hasn't edited what came from the file.
    const keepEdits = file && resume !== file.text;
    setFile(null);
    if (!keepEdits) setResume("");
    update({ file: null, ...(keepEdits ? {} : { resume: "" }) });
  };

  const tooShort = countWords(job) < 15 || countWords(resume) < 15;

  const runAnalysis = () => {
    const r = analyze(job, resume, niche);
    setResult(r);
    update({ result: r });
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      requestAnimationFrame(() =>
        document.getElementById("resultado")?.scrollIntoView({ behavior: "smooth" }),
      );
    }
  };

  const copyText = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.plainText);
      toast.success("Texto copiado", { description: "Cole direto no formulário da vaga." });
    } catch {
      toast.error("Não foi possível copiar automaticamente.");
    }
  };

  const exportDocx = async () => {
    if (!result || downloadingDocx) return;
    setDownloadingDocx(true);
    try {
      const fileName = await downloadResumeDocx(result.resume);
      toast.success("Download do arquivo Word (.docx) iniciado!", {
        description: `${fileName} salvo em formato coluna única compatível com ATS.`,
      });
    } catch {
      toast.error("Não foi possível gerar o arquivo .docx.");
    } finally {
      setDownloadingDocx(false);
    }
  };

  const activeNiche = NICHES.find((n) => n.id === niche)!;

  return (
    <div className="bg-hero">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              Otimizador ATS
            </p>
            <h1 className="mt-1 font-display text-3xl font-bold text-foreground sm:text-4xl">
              Seu currículo, do jeito que o robô lê.
            </h1>
            <p className="mt-2 max-w-xl text-muted-foreground">
              Cole a vaga e o seu currículo. Mostramos o match, o que falta e geramos uma versão
              limpa para ATS.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="soft" onClick={loadExample}>
              <FlaskConical /> Carregar Exemplo de Teste
            </Button>
            {(job || resume) && (
              <Button variant="ghost" onClick={clearAll} aria-label="Limpar campos">
                <Eraser />
              </Button>
            )}
          </div>
        </div>

        {/* Niche / Area Selector */}
        <div className="mt-6 flex flex-col gap-2 rounded-2xl border border-primary-border/80 bg-surface/90 p-3 shadow-soft sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Área profissional">
            {NICHES.map((n) => {
              const selected = n.id === niche;
              return (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => selectNiche(n.id)}
                  aria-pressed={selected}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors",
                    selected
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "bg-primary-soft/70 text-primary-strong hover:bg-primary-soft",
                  )}
                >
                  {NICHE_ICONS[n.id]}
                  {n.label}
                </button>
              );
            })}
          </div>
          <p className="px-1 text-xs text-muted-foreground">{activeNiche.description}</p>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Inputs */}
          <div className="space-y-5">
            <InputCard
              icon={<Briefcase className="size-4" />}
              title="Descrição da vaga"
              description="Cole o texto completo da vaga (requisitos e diferenciais)."
              value={job}
              placeholder={"Vaga: Desenvolvedor(a) Frontend\nEmpresa: ...\n\nRequisitos..."}
              onChange={(v) => {
                setJob(v);
                update({ job: v });
              }}
            />
            <InputCard
              icon={<FileText className="size-4" />}
              title="Seu currículo atual"
              description="Envie um arquivo ou cole o texto (Word, LinkedIn, markdown)."
              value={resume}
              placeholder={"Ou cole/digite aqui:\n\nSeu Nome\nemail | telefone\n\nExperiência Profissional\n..."}
              top={
                <ResumeUpload
                  file={file}
                  loading={reading}
                  onFile={handleFile}
                  onRemove={removeFile}
                />
              }
              onChange={(v) => {
                setResume(v);
                update({ resume: v });
              }}
            />
            <Button
              variant="action"
              size="xl"
              className="w-full"
              disabled={tooShort}
              onClick={runAnalysis}
            >
              <Zap className="fill-current" /> Analisar Match & Otimizar para ATS
            </Button>
            {tooShort && (job || resume) && (
              <p className="text-center text-xs text-muted-foreground">
                Escreva pelo menos 15 palavras em cada campo para analisar.
              </p>
            )}
          </div>

          {/* Results */}
          <div id="resultado" className="space-y-5 scroll-mt-32">
            {result ? (
              <>
                <DiagnosisCard result={result} />
                <Card className="animate-rise overflow-hidden rounded-2xl border-primary-border shadow-soft">
                  <CardHeader className="flex flex-col gap-3 pb-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div>
                      <CardTitle className="font-display text-lg">Currículo otimizado</CardTitle>
                      <CardDescription>Mesmo conteúdo, formato que o ATS entende.</CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="subtle" size="sm" onClick={copyText}>
                        <Copy /> Copiar Texto
                      </Button>
                      <Button
                        variant="subtle"
                        size="sm"
                        disabled={downloadingDocx}
                        onClick={exportDocx}
                      >
                        <FileDown /> {downloadingDocx ? "Gerando .DOCX..." : "Baixar .DOCX"}
                      </Button>
                      <Button variant="subtle" size="sm" onClick={() => window.print()}>
                        <Printer /> Imprimir / Salvar PDF
                      </Button>
                      <Button variant="action" size="sm" onClick={() => setSaveOpen(true)}>
                        <BookmarkPlus /> Salvar no Dashboard
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="preview">
                      <TabsList className="mb-3 flex-wrap rounded-xl bg-primary-soft">
                        <TabsTrigger value="preview" className="rounded-lg">
                          Pré-visualização A4
                        </TabsTrigger>
                        <TabsTrigger value="text" className="rounded-lg">
                          Texto puro
                        </TabsTrigger>
                        <TabsTrigger value="xray" className="rounded-lg">
                          <Bot className="mr-1.5 size-3.5" /> Visão Raio-X do Robô
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value="preview">
                        <div className="max-h-[760px] overflow-auto rounded-xl bg-muted p-3 sm:p-5">
                          <ResumeSheet resume={result.resume} />
                        </div>
                      </TabsContent>
                      <TabsContent value="text">
                        <Textarea
                          readOnly
                          value={result.plainText}
                          className="min-h-[560px] rounded-xl font-mono text-xs leading-relaxed"
                        />
                        <p className="mt-2 text-xs text-muted-foreground">
                          Ideal para colar em formulários como Gupy, Kenoby e LinkedIn.
                        </p>
                      </TabsContent>
                      <TabsContent value="xray">
                        <AtsXRayView result={result} />
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
                <PrintableResume resume={result.resume} />
                <SaveDialog open={saveOpen} onOpenChange={setSaveOpen} result={result} />
              </>
            ) : (
              <EmptyResult />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InputCard(props: {
  icon: ReactNode;
  title: string;
  description: string;
  value: string;
  placeholder: string;
  onChange: (v: string) => void;
  top?: ReactNode;
}) {
  const words = countWords(props.value);
  return (
    <Card className="rounded-2xl border-primary-border/80 shadow-soft">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-base">
            <span className="grid size-7 place-items-center rounded-lg bg-primary-soft text-primary">
              {props.icon}
            </span>
            {props.title}
          </CardTitle>
          <CardDescription>{props.description}</CardDescription>
        </div>
        <Badge variant={words ? "lavender" : "outline"} className="shrink-0 tabular-nums">
          {words} {words === 1 ? "palavra" : "palavras"}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        {props.top}
        <Textarea
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
          placeholder={props.placeholder}
          className="min-h-[240px] resize-y rounded-xl border-input bg-background text-sm leading-relaxed focus-visible:ring-primary"
        />
      </CardContent>
    </Card>
  );
}

function DiagnosisCard({ result }: { result: AnalysisResult }) {
  const gain = result.score - result.initialScore;
  return (
    <Card className="animate-rise rounded-2xl border-primary-border shadow-soft">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <ScanSearch className="size-5 text-primary" /> Diagnóstico
        </CardTitle>
        <CardDescription>
          {result.jobTitle} · {result.company}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center gap-6 sm:flex-row">
          <ScoreRing value={result.score} />
          <div className="w-full flex-1 space-y-3">
            <div>
              <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                <span>Antes (currículo original)</span>
                <span className="tabular-nums">{result.initialScore}%</span>
              </div>
              <Progress value={result.initialScore} className="h-2 bg-primary-soft [&>div]:bg-primary-border" />
            </div>
            <div>
              <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                <span>Depois (otimizado para ATS)</span>
                <span className="font-semibold tabular-nums text-success-strong">{result.score}%</span>
              </div>
              <Progress value={result.score} className="h-2 bg-success-soft [&>div]:bg-success" />
            </div>
            {gain > 0 && (
              <p className="flex items-center gap-1.5 text-sm font-medium text-success-strong">
                <TrendingUp className="size-4" /> +{gain} pontos só com formatação e termos da vaga
              </p>
            )}
          </div>
        </div>

        <div>
          <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-foreground">
            <CheckCircle2 className="size-4 text-success-strong" /> Encontradas no seu currículo (
            {result.found.length})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {result.found.length ? (
              result.found.map((k) => (
                <Badge key={k} variant="success">
                  {k}
                </Badge>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">Nenhuma ainda.</span>
            )}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold text-foreground">
            Faltantes ({result.missing.length})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {result.missing.length ? (
              result.missing.map((k) => (
                <Tooltip key={k}>
                  <TooltipTrigger asChild>
                    <Badge variant="lavender" className="cursor-help">
                      {k}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>Adicione só se você realmente tem essa experiência.</TooltipContent>
                </Tooltip>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">Nada faltando. 🎯</span>
            )}
          </div>
        </div>

        {/* Action Verbs & Impact Metrics */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-primary-border/70 bg-primary-soft/40 p-3.5">
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <Target className="size-3.5 text-primary" /> Verbos de Ação
              </span>
              <Badge variant={result.quality.actionVerbRate >= 60 ? "success" : "lavender"} className="tabular-nums">
                {result.quality.actionVerbRate}%
              </Badge>
            </div>
            <Progress
              value={result.quality.actionVerbRate}
              className="mt-2 h-1.5 bg-primary-soft [&>div]:bg-primary"
            />
            <p className="mt-2 text-[11px] text-muted-foreground">
              {result.quality.totalBullets > 0
                ? `${result.quality.actionVerbBullets} de ${result.quality.totalBullets} tópicos iniciam com verbo forte.`
                : "Adicione tópicos (- ) nas experiências para medir verbos de ação."}
            </p>
          </div>

          <div className="rounded-xl border border-primary-border/70 bg-primary-soft/40 p-3.5">
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <Gauge className="size-3.5 text-success-strong" /> Métricas de Impacto
              </span>
              <Badge
                variant={result.quality.impactMetricsCount >= 2 ? "success" : "lavender"}
                className="tabular-nums"
              >
                {result.quality.impactMetricsCount}{" "}
                {result.quality.impactMetricsCount === 1 ? "métrica" : "métricas"}
              </Badge>
            </div>
            {result.quality.detectedMetrics.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-1">
                {result.quality.detectedMetrics.slice(0, 5).map((m) => (
                  <span
                    key={m}
                    className="rounded-md bg-success-soft px-1.5 py-0.5 text-[10px] font-semibold text-success-strong"
                  >
                    {m}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-[11px] text-muted-foreground">
                Nenhuma métrica numérica detectada ainda.
              </p>
            )}
            {result.quality.impactMetricsCount < 2 && (
              <p className="mt-2 text-[11px] text-primary-strong">
                Dica ATS: inclua números, porcentagens (%) ou prazos nos resultados.
              </p>
            )}
          </div>
        </div>

        {result.missing.length > 0 && (
          <Alert className="rounded-xl border-primary-border bg-primary-soft text-primary-strong [&>svg]:text-primary">
            <Info className="size-4" />
            <AlertTitle>Não adicionamos as palavras faltantes</AlertTitle>
            <AlertDescription className="text-primary-strong/80">
              Se você tem experiência com algum desses itens, inclua no seu currículo original com
              um exemplo real e analise de novo.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

function EmptyResult() {
  const steps = [
    "Cole a descrição da vaga",
    "Cole seu currículo atual",
    "Veja o match e copie a versão ATS",
  ];
  return (
    <Card className="flex h-full min-h-[420px] flex-col items-center justify-center rounded-2xl border-dashed border-primary-border bg-surface/70 p-8 text-center shadow-none">
      <div className="grid size-16 place-items-center rounded-2xl bg-primary-soft text-primary">
        <ScanSearch className="size-8" />
      </div>
      <h2 className="mt-4 font-display text-xl font-bold text-foreground">
        O resultado aparece aqui
      </h2>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Sem cadastro e sem enviar nada para servidores: tudo roda no seu navegador.
      </p>
      <ol className="mt-6 space-y-2 text-left">
        {steps.map((s, i) => (
          <li key={s} className="flex items-center gap-3 text-sm text-foreground">
            <span className="grid size-6 place-items-center rounded-full bg-success-soft text-xs font-bold text-success-strong">
              {i + 1}
            </span>
            {s}
          </li>
        ))}
      </ol>
    </Card>
  );
}

function SaveDialog({
  open,
  onOpenChange,
  result,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  result: AnalysisResult;
}) {
  const [title, setTitle] = useState(result.jobTitle);
  const [company, setCompany] = useState(result.company);
  const navigate = useNavigate();
  const [prevResult, setPrevResult] = useState(result);
  if (prevResult !== result) {
    setPrevResult(result);
    setTitle(result.jobTitle);
    setCompany(result.company);
  }

  const save = () => {
    addHistoryEntry({
      title: title.trim() || "Vaga sem título",
      company: company.trim() || "Não informada",
      initialScore: result.initialScore,
      score: result.score,
      found: result.found,
      missing: result.missing,
      resume: result.resume,
      plainText: result.plainText,
    });
    onOpenChange(false);
    toast.success("Análise salva no Dashboard", {
      action: { label: "Ver", onClick: () => navigate({ to: "/dashboard" }) },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display">Salvar no Dashboard</DialogTitle>
          <DialogDescription>Confira o nome da vaga e da empresa.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="save-title">Cargo / Vaga</Label>
            <Input id="save-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="save-company">Empresa</Label>
            <Input id="save-company" value={company} onChange={(e) => setCompany(e.target.value)} />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button variant="action" onClick={save}>
            <BookmarkPlus /> Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
