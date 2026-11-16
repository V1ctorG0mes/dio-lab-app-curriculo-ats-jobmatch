import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Briefcase,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Eraser,
  Eye,
  FileText,
  FlaskConical,
  MapPin,
  Radar as RadarIcon,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  Wallet,
  Zap,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ResumeUpload } from "@/components/app/ResumeUpload";
import { countWords } from "@/lib/ats";
import { draft, loadJobIntoDraft, updateDraft } from "@/lib/draft";
import {
  matchJobsToResume,
  summarizeRadarMatches,
  type JobMatchItem,
  type WorkModel,
} from "@/lib/jobs-radar";
import { readResumeFile } from "@/lib/resume-file";
import { getSampleForNiche, NICHES, type NicheId } from "@/lib/samples";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/radar")({
  head: () => ({
    meta: [
      { title: "Radar de Vagas Compatíveis — JobMatch ATS" },
      {
        name: "description",
        content:
          "Cruze seu currículo com vagas de Tecnologia, Dados, Produto, Negócios e Estágio e otimize com 1 clique para as de maior aderência.",
      },
      { property: "og:title", content: "Radar de Vagas Compatíveis — JobMatch ATS" },
      {
        property: "og:description",
        content: "Matchmaking ético de vagas ordenado pelo seu Score ATS.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RadarPage,
});

const WORK_MODELS: Array<{ id: WorkModel | "all"; label: string }> = [
  { id: "all", label: "Todos modelos" },
  { id: "Remoto", label: "Remoto" },
  { id: "Híbrido", label: "Híbrido" },
  { id: "Presencial", label: "Presencial" },
];

const TIER_STYLES = {
  alta: {
    label: "Alta aderência",
    badge: "bg-success-soft text-success-strong border-success/40",
    score: "text-success-strong",
    ring: "border-success/50 bg-success-soft/60",
  },
  media: {
    label: "Aderência média",
    badge: "bg-primary-soft text-primary-strong border-primary-border",
    score: "text-primary-strong",
    ring: "border-primary-border bg-primary-soft/60",
  },
  baixa: {
    label: "Para desenvolver",
    badge: "bg-muted text-muted-foreground border-border",
    score: "text-muted-foreground",
    ring: "border-border bg-muted/50",
  },
};

function RadarPage() {
  const navigate = useNavigate();
  const [resume, setResume] = useState(draft.resume);
  const [file, setFile] = useState(draft.file);
  const [reading, setReading] = useState(false);
  const [cvPanelOpen, setCvPanelOpen] = useState(() => countWords(draft.resume) < 15);

  const [filterNiche, setFilterNiche] = useState<NicheId | "all">("all");
  const [filterWorkModel, setFilterWorkModel] = useState<WorkModel | "all">("all");
  const [search, setSearch] = useState("");
  const [selectedJob, setSelectedJob] = useState<JobMatchItem | null>(null);

  const hasResume = countWords(resume) >= 15;

  const matches = useMemo(
    () =>
      matchJobsToResume(resume, {
        niche: filterNiche,
        workModel: filterWorkModel,
        search,
      }),
    [resume, filterNiche, filterWorkModel, search],
  );

  const summary = useMemo(() => summarizeRadarMatches(matches), [matches]);

  const handleResumeChange = (text: string) => {
    setResume(text);
    updateDraft({ resume: text });
  };

  const handleFile = async (f: File) => {
    setReading(true);
    try {
      const text = await readResumeFile(f);
      const info = { name: f.name, size: f.size, text };
      setResume(text);
      setFile(info);
      updateDraft({ resume: text, file: info });
      setCvPanelOpen(false);
      toast.success(`Currículo analisado no Radar (${countWords(text)} palavras)`, {
        description: "As vagas abaixo foram ranqueadas pela compatibilidade.",
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
    const keepEdits = file && resume !== file.text;
    setFile(null);
    if (!keepEdits) setResume("");
    updateDraft({ file: null, ...(keepEdits ? {} : { resume: "" }) });
  };

  const loadSampleCv = (nicheId: NicheId) => {
    const sample = getSampleForNiche(nicheId);
    setResume(sample.resume);
    setFile(null);
    setFilterNiche(nicheId);
    updateDraft({ resume: sample.resume, file: null, niche: nicheId });
    setCvPanelOpen(false);
    const label = NICHES.find((n) => n.id === nicheId)?.shortLabel ?? nicheId;
    toast.success(`Currículo exemplo (${label}) carregado no Radar`, {
      description: "Veja o ranking das vagas compatíveis abaixo.",
    });
  };

  const optimizeForJob = (job: JobMatchItem) => {
    loadJobIntoDraft(job.description, job.niche, resume);
    toast.success(`Vaga "${job.title}" carregada no Otimizador!`, {
      description: hasResume
        ? `Match calculado: ${job.score}%. Você já pode baixar o .DOCX ou PDF.`
        : "Cole seu currículo para gerar a versão otimizada.",
    });
    void navigate({ to: "/" });
  };

  return (
    <div className="bg-hero min-h-[calc(100vh-8rem)]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:py-10">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wider text-primary">
              <RadarIcon className="size-4" /> Matchmaking Ético ATS
            </p>
            <h1 className="mt-1 font-display text-3xl font-bold text-foreground sm:text-4xl">
              Radar de Vagas Compatíveis
            </h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Comparamos seu currículo atual com um catálogo de vagas em aberto e ranqueamos as mais
              aderentes — sem inventar competências. Clique em uma vaga para gerar o CV otimizado.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="soft"
              onClick={() => setCvPanelOpen((prev) => !prev)}
              aria-expanded={cvPanelOpen}
            >
              <FileText className="size-4" />
              {hasResume ? "Editar currículo base" : "Enviar currículo"}
              {cvPanelOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
            </Button>
          </div>
        </div>

        {/* Collapsible Resume Input Card */}
        {cvPanelOpen ? (
          <Card className="mt-6 rounded-2xl border-primary-border bg-surface shadow-soft">
            <CardHeader className="flex flex-col gap-3 pb-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div>
                <CardTitle className="font-display text-lg">Seu currículo para o Radar</CardTitle>
                <CardDescription>
                  Envie um arquivo (.pdf, .docx, .txt, .md), cole o texto ou teste com um perfil de
                  exemplo.
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {NICHES.map((n) => (
                  <Button
                    key={n.id}
                    variant="subtle"
                    size="sm"
                    onClick={() => loadSampleCv(n.id)}
                    className="h-8 text-xs"
                  >
                    <FlaskConical className="size-3.5" /> CV {n.shortLabel}
                  </Button>
                ))}
                {resume && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setResume("");
                      setFile(null);
                      updateDraft({ resume: "", file: null });
                    }}
                    aria-label="Limpar currículo"
                  >
                    <Eraser className="size-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ResumeUpload
                file={file}
                loading={reading}
                onFile={handleFile}
                onRemove={removeFile}
              />
              <Textarea
                value={resume}
                onChange={(e) => handleResumeChange(e.target.value)}
                placeholder="Cole aqui o conteúdo do seu currículo ou clique em um dos exemplos acima (ex: CV Tecnologia, CV Dados & BI)..."
                className="min-h-[140px] rounded-xl border-primary-border bg-surface/70 text-sm"
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{countWords(resume)} palavras no currículo base</span>
                {hasResume && (
                  <button
                    type="button"
                    onClick={() => setCvPanelOpen(false)}
                    className="font-medium text-primary hover:underline"
                  >
                    Recolher editor
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-success/40 bg-success-soft/50 px-4 py-3 text-sm">
            <div className="flex items-center gap-2.5 text-success-strong">
              <CheckCircle2 className="size-4 shrink-0" />
              <span>
                Currículo ativo no Radar:{" "}
                <strong>
                  {file ? file.name : `${countWords(resume)} palavras analisadas`}
                </strong>
              </span>
            </div>
            <button
              type="button"
              onClick={() => setCvPanelOpen(true)}
              className="text-xs font-semibold text-primary-strong hover:underline"
            >
              Alterar ou enviar outro arquivo
            </button>
          </div>
        )}

        {/* Alert if resume missing */}
        {!hasResume && (
          <Alert className="mt-5 rounded-2xl border-primary-border bg-primary-soft/60">
            <Sparkles className="size-4 text-primary-strong" />
            <AlertTitle className="font-semibold text-primary-strong">
              Envie seu currículo ou escolha um exemplo para calcular o Match Score
            </AlertTitle>
            <AlertDescription className="text-xs sm:text-sm">
              Sem um currículo preenchido (mínimo 15 palavras), exibimos apenas a vitrine de vagas.
              Clique em <strong>CV Tecnologia</strong> ou <strong>CV Dados & BI</strong> acima para
              ver o ranqueamento instantâneo!
            </AlertDescription>
          </Alert>
        )}

        {/* KPIs */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <RadarKpi
            icon={<Briefcase className="size-5 text-primary" />}
            label="Vagas filtradas"
            value={String(summary.total)}
            hint="Catálogo curado multi-área"
          />
          <RadarKpi
            icon={<Target className="size-5 text-success-strong" />}
            label="Alta aderência (70%+)"
            value={hasResume ? String(summary.highMatchCount) : "—"}
            hint="Prontas para candidatura"
          />
          <RadarKpi
            icon={<Trophy className="size-5 text-success-strong" />}
            label="Maior Match no Radar"
            value={hasResume ? `${summary.bestScore}%` : "—"}
            hint="Melhor oportunidade atual"
          />
          <RadarKpi
            icon={<TrendingUp className="size-5 text-primary" />}
            label="Média de compatibilidade"
            value={hasResume ? `${summary.averageScore}%` : "—"}
            hint="Considerando os filtros ativos"
          />
        </div>

        {/* Filter Bar */}
        <Card className="mt-6 rounded-2xl border-primary-border bg-surface/90 shadow-soft">
          <CardContent className="space-y-4 p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por cargo, empresa, cidade ou tecnologia (ex: React, SQL, SAP)..."
                  className="rounded-xl border-primary-border pl-9"
                />
              </div>
              <div className="flex flex-wrap gap-1.5" role="group" aria-label="Modelo de trabalho">
                {WORK_MODELS.map((wm) => {
                  const active = filterWorkModel === wm.id;
                  return (
                    <button
                      key={wm.id}
                      type="button"
                      onClick={() => setFilterWorkModel(wm.id)}
                      aria-pressed={active}
                      className={cn(
                        "rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors",
                        active
                          ? "bg-primary text-primary-foreground shadow-xs"
                          : "bg-primary-soft/70 text-primary-strong hover:bg-primary-soft",
                      )}
                    >
                      {wm.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filtrar por área">
              <button
                type="button"
                onClick={() => setFilterNiche("all")}
                aria-pressed={filterNiche === "all"}
                className={cn(
                  "rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors",
                  filterNiche === "all"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-primary-soft/70 text-primary-strong hover:bg-primary-soft",
                )}
              >
                Todas as áreas
              </button>
              {NICHES.map((n) => {
                const active = filterNiche === n.id;
                return (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => setFilterNiche(n.id)}
                    aria-pressed={active}
                    className={cn(
                      "rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors",
                      active
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "bg-primary-soft/70 text-primary-strong hover:bg-primary-soft",
                    )}
                  >
                    {n.label}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Ranked Job Cards */}
        <div className="mt-6 space-y-4">
          {matches.length === 0 ? (
            <Card className="rounded-2xl border-primary-border bg-surface text-center shadow-soft">
              <CardContent className="py-12">
                <p className="font-display text-lg font-semibold">
                  Nenhuma vaga encontrada com esses filtros
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Limpe a busca ou troque o filtro de área/modelo para ver mais oportunidades.
                </p>
                <Button
                  variant="soft"
                  className="mt-4"
                  onClick={() => {
                    setFilterNiche("all");
                    setFilterWorkModel("all");
                    setSearch("");
                  }}
                >
                  Limpar filtros
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {matches.map((job) => {
                const tier = TIER_STYLES[job.matchTier];
                const nicheLabel = NICHES.find((n) => n.id === job.niche)?.shortLabel ?? job.niche;
                return (
                  <Card
                    key={job.id}
                    className="flex flex-col justify-between rounded-2xl border-primary-border bg-surface shadow-soft transition-all hover:border-primary/60"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <Badge variant="outline" className="rounded-lg border-primary-border text-xs">
                              {nicheLabel}
                            </Badge>
                            <Badge variant="secondary" className="rounded-lg text-xs">
                              {job.seniority}
                            </Badge>
                            <Badge variant="secondary" className="rounded-lg text-xs">
                              {job.workModel}
                            </Badge>
                          </div>
                          <CardTitle className="pt-1 font-display text-lg leading-snug">
                            {job.title}
                          </CardTitle>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1 font-medium text-foreground/85">
                              <Building2 className="size-3.5 text-primary" /> {job.company}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="size-3.5" /> {job.location}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Wallet className="size-3.5" /> {job.salaryRange}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Clock className="size-3.5" /> há {job.postedDaysAgo}{" "}
                              {job.postedDaysAgo === 1 ? "dia" : "dias"}
                            </span>
                          </div>
                        </div>

                        {/* Score Pill */}
                        <div
                          className={cn(
                            "flex shrink-0 flex-col items-center justify-center rounded-2xl border px-3 py-2 text-center",
                            hasResume ? tier.ring : "border-border bg-muted/40",
                          )}
                        >
                          <span
                            className={cn(
                              "font-display text-2xl font-bold leading-none",
                              hasResume ? tier.score : "text-muted-foreground",
                            )}
                          >
                            {hasResume ? `${job.score}%` : "—"}
                          </span>
                          <span className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                            {hasResume ? tier.label : "Envie CV"}
                          </span>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4 pt-0">
                      {hasResume ? (
                        <div className="space-y-2.5 text-xs">
                          <div>
                            <p className="mb-1 font-semibold text-success-strong">
                              Presentes no seu CV ({job.found.length})
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {job.found.length === 0 ? (
                                <span className="text-muted-foreground">
                                  Nenhuma palavra-chave desta vaga detectada ainda.
                                </span>
                              ) : (
                                <>
                                  {job.found.slice(0, 6).map((kw) => (
                                    <Badge
                                      key={kw}
                                      className="rounded-md bg-success-soft px-2 py-0.5 text-[11px] font-medium text-success-strong hover:bg-success-soft"
                                    >
                                      {kw}
                                    </Badge>
                                  ))}
                                  {job.found.length > 6 && (
                                    <Badge variant="outline" className="rounded-md px-2 py-0.5 text-[11px]">
                                      +{job.found.length - 6}
                                    </Badge>
                                  )}
                                </>
                              )}
                            </div>
                          </div>

                          {job.missing.length > 0 && (
                            <div>
                              <p className="mb-1 font-semibold text-primary-strong">
                                Faltantes na vaga ({job.missing.length})
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {job.missing.slice(0, 5).map((kw) => (
                                  <Badge
                                    key={kw}
                                    variant="secondary"
                                    className="rounded-md bg-primary-soft/70 px-2 py-0.5 text-[11px] font-medium text-primary-strong"
                                  >
                                    {kw}
                                  </Badge>
                                ))}
                                {job.missing.length > 5 && (
                                  <Badge variant="outline" className="rounded-md px-2 py-0.5 text-[11px]">
                                    +{job.missing.length - 5}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {job.keywords.slice(0, 6).map((kw) => (
                            <Badge
                              key={kw}
                              variant="secondary"
                              className="rounded-md bg-primary-soft/60 px-2 py-0.5 text-[11px] text-primary-strong"
                            >
                              {kw}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <Button
                          variant="action"
                          size="sm"
                          className="flex-1"
                          onClick={() => optimizeForJob(job)}
                        >
                          <Zap className="size-4 fill-current" /> Otimizar CV para esta vaga
                        </Button>
                        <Button
                          variant="subtle"
                          size="sm"
                          onClick={() => setSelectedJob(job)}
                        >
                          <Eye className="size-4" /> Ver vaga
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Full Job Details Modal */}
      <Dialog open={!!selectedJob} onOpenChange={(open) => !open && setSelectedJob(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          {selectedJob && (
            <>
              <DialogHeader>
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge variant="outline">{selectedJob.seniority}</Badge>
                  <Badge variant="secondary">{selectedJob.workModel}</Badge>
                  {hasResume && (
                    <Badge className={cn("border", TIER_STYLES[selectedJob.matchTier].badge)}>
                      Match ATS: {selectedJob.score}%
                    </Badge>
                  )}
                </div>
                <DialogTitle className="pt-1 font-display text-xl">{selectedJob.title}</DialogTitle>
                <DialogDescription>
                  {selectedJob.company} • {selectedJob.location} • {selectedJob.salaryRange}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                {hasResume && (
                  <div className="grid gap-3 rounded-xl border border-primary-border bg-primary-soft/40 p-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold text-success-strong">
                        Encontradas ({selectedJob.found.length})
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {selectedJob.found.join(", ") || "Nenhuma"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-primary-strong">
                        Faltantes ({selectedJob.missing.length})
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {selectedJob.missing.join(", ") || "Nenhuma — 100% coberto!"}
                      </p>
                    </div>
                  </div>
                )}

                <pre className="whitespace-pre-wrap rounded-xl border border-border bg-muted/40 p-4 font-sans text-sm leading-relaxed text-foreground">
                  {selectedJob.description}
                </pre>
              </div>

              <DialogFooter>
                <Button variant="ghost" onClick={() => setSelectedJob(null)}>
                  Fechar
                </Button>
                <Button variant="action" onClick={() => optimizeForJob(selectedJob)}>
                  <Zap className="size-4 fill-current" /> Otimizar CV para esta vaga
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RadarKpi({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <Card className="rounded-2xl border-primary-border bg-surface shadow-soft">
      <CardContent className="flex items-start justify-between gap-3 p-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="mt-1 font-display text-2xl font-bold text-foreground">{value}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>
        </div>
        <div className="rounded-xl bg-primary-soft p-2.5">{icon}</div>
      </CardContent>
    </Card>
  );
}
