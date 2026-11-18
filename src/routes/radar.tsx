import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Eye,
  FileText,
  Radar as RadarIcon,
  Search,
  Target,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { analyze, countWords } from "@/lib/ats";
import { loadJobIntoDraft, useOptimizerDraft } from "@/lib/draft";
import {
  generateJobRecommendations,
  hasRadarInputs,
  summarizeRadarMatches,
  type JobMatchItem,
} from "@/lib/jobs-radar";
import { NICHES, type NicheId } from "@/lib/samples";

export const Route = createFileRoute("/radar")({
  head: () => ({
    meta: [
      { title: "Radar de Cargos Compatíveis — JobMatch ATS" },
      {
        name: "description",
        content:
          "Indicações de cargos baseadas na vaga e no currículo do Otimizador, com competências encontradas e lacunas reais.",
      },
      { property: "og:title", content: "Radar de Cargos Compatíveis — JobMatch ATS" },
      {
        property: "og:description",
        content:
          "Descubra cargos compatíveis com seu currículo e seu objetivo profissional, sem vagas fictícias anunciadas como reais.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RadarPage,
});

const TIERS = {
  alta: { label: "Alta compatibilidade", variant: "success" as const },
  media: { label: "Compatibilidade parcial", variant: "lavender" as const },
  baixa: { label: "Mais lacunas", variant: "secondary" as const },
};

function RadarPage() {
  const navigate = useNavigate();
  const base = useOptimizerDraft();
  const [area, setArea] = useState<NicheId | "all">("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<JobMatchItem | null>(null);
  const ready = hasRadarInputs(base.job, base.resume);
  const reference = useMemo(
    () => (ready ? analyze(base.job, base.resume, base.niche) : null),
    [ready, base.job, base.resume, base.niche],
  );
  const allMatches = useMemo(
    () => generateJobRecommendations(base.job, base.resume, base.niche),
    [base.job, base.resume, base.niche],
  );
  const matches = useMemo(
    () => generateJobRecommendations(base.job, base.resume, base.niche, { niche: area, search }),
    [base.job, base.resume, base.niche, area, search],
  );
  const summary = summarizeRadarMatches(allMatches);
  const resetFilters = () => {
    setArea("all");
    setSearch("");
  };
  const optimize = (role: JobMatchItem) => {
    loadJobIntoDraft(role.description, role.niche, base.resume);
    toast.success("Cargo carregado no Otimizador", {
      description: "Seu currículo foi mantido e a análise foi recalculada.",
    });
    void navigate({ to: "/" });
  };

  return (
    <div className="bg-hero min-h-[calc(100vh-8rem)]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold text-primary">
              <RadarIcon className="size-4" /> JobMatch ATS
            </p>
            <h1 className="mt-1 font-display text-3xl font-bold sm:text-4xl">
              Radar de Vagas Compatíveis
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Indicações de cargos · Não são anúncios de vagas abertas
            </p>
          </div>
          <Button variant="soft" asChild>
            <Link to="/">
              <ArrowLeft /> Voltar ao Otimizador
            </Link>
          </Button>
        </div>

        {!ready ? (
          <section className="mt-10 border-y border-primary-border py-12 text-center">
            <RadarIcon className="mx-auto size-12 text-primary" />
            <h2 className="mt-5 font-display text-2xl font-bold">
              Seu Radar ainda não tem uma base
            </h2>
            <div className="mx-auto mt-4 max-w-lg space-y-2 text-sm text-muted-foreground">
              <p className="flex items-center justify-center gap-2">
                <Briefcase className="size-4" /> Vaga de referência:{" "}
                {countWords(base.job) >= 15 ? "preenchida" : "pendente"}
              </p>
              <p className="flex items-center justify-center gap-2">
                <FileText className="size-4" /> Currículo no Otimizador:{" "}
                {countWords(base.resume) >= 15 ? "preenchido" : "pendente"}
              </p>
            </div>
            <Button variant="action" className="mt-6" asChild>
              <Link to="/">
                Preencher no Otimizador <ArrowRight />
              </Link>
            </Button>
          </section>
        ) : (
          <>
            <section className="mt-6 grid gap-4 border-y border-primary-border py-5 sm:grid-cols-2">
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-xs font-semibold text-primary">
                  <Briefcase className="size-4" /> VAGA DE REFERÊNCIA
                </p>
                <h2 className="mt-2 break-words font-semibold">{reference?.jobTitle}</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  {NICHES.find((n) => n.id === base.niche)?.label}
                </p>
              </div>
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-xs font-semibold text-success-strong">
                  <CheckCircle2 className="size-4" /> CURRÍCULO DO OTIMIZADOR
                </p>
                <p className="mt-2 break-words font-semibold">
                  {base.file?.name ?? reference?.resume.name}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {countWords(base.resume)} palavras · Conteúdo original preservado
                </p>
              </div>
            </section>

            <section
              className="mt-6 grid grid-cols-3 gap-3 border-b border-primary-border pb-6"
              aria-label="Resumo do Radar"
            >
              {[
                { label: "Cargos indicados", value: summary.total },
                { label: "Alta compatibilidade", value: summary.highMatchCount },
                { label: "Melhor cobertura", value: `${summary.bestScore}%` },
              ].map((stat) => (
                <div key={stat.label} className="min-w-0">
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="mt-1 font-display text-2xl font-bold text-primary-strong">
                    {stat.value}
                  </p>
                </div>
              ))}
            </section>

            <section className="mt-6 space-y-3" aria-label="Filtros de cargos">
              <div className="relative max-w-xl">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  aria-label="Buscar cargo ou competência"
                  placeholder="Buscar cargo ou competência"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-surface pl-9"
                />
              </div>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por área">
                <Button
                  size="sm"
                  variant={area === "all" ? "default" : "soft"}
                  aria-pressed={area === "all"}
                  onClick={() => setArea("all")}
                >
                  Todas as áreas
                </Button>
                {NICHES.map((n) => (
                  <Button
                    key={n.id}
                    size="sm"
                    variant={area === n.id ? "default" : "soft"}
                    aria-pressed={area === n.id}
                    onClick={() => setArea(n.id)}
                  >
                    {n.shortLabel}
                  </Button>
                ))}
              </div>
            </section>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display text-xl font-bold">
                {matches.length} {matches.length === 1 ? "indicação" : "indicações"} para seu perfil
              </h2>
              <span className="text-xs text-muted-foreground">
                Cobertura do currículo + proximidade com a vaga
              </span>
            </div>
            {matches.length ? (
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                {matches.map((role) => (
                  <Card
                    key={role.id}
                    className="flex flex-col rounded-lg border-primary-border bg-surface shadow-soft"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">
                          {NICHES.find((n) => n.id === role.niche)?.shortLabel}
                        </Badge>
                        <Badge variant={role.source === "referencia" ? "lavender" : "secondary"}>
                          {role.source === "referencia"
                            ? "Sua vaga de referência"
                            : "Cargo sugerido"}
                        </Badge>
                      </div>
                      <CardTitle className="break-words font-display text-lg leading-snug">
                        {role.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-1 flex-col gap-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-display text-3xl font-bold tabular-nums text-success-strong">
                          {role.score}%
                        </span>
                        <div>
                          <Badge variant={TIERS[role.matchTier].variant}>
                            {TIERS[role.matchTier].label}
                          </Badge>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {role.found.length} de {role.keywords.length} competências no currículo
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="mb-2 text-xs font-semibold text-success-strong">
                          Você já possui
                        </p>
                        <KeywordList terms={role.found} kind="found" />
                      </div>
                      <div>
                        <p className="mb-2 text-xs font-semibold text-primary-strong">
                          Não identificadas no currículo ({role.missing.length})
                        </p>
                        <KeywordList terms={role.missing} kind="missing" />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        <Target className="mr-1 inline size-3.5" />{" "}
                        {role.sharedWithReference.length} competências em comum com a vaga de
                        referência
                      </p>
                      <div className="mt-auto flex flex-wrap gap-2 pt-2">
                        <Button variant="action" size="sm" onClick={() => optimize(role)}>
                          <Zap /> Otimizar para este cargo
                        </Button>
                        <Button
                          variant="subtle"
                          size="sm"
                          onClick={() => setSelected(role)}
                          aria-label={`Ver detalhes de ${role.title}`}
                        >
                          <Eye /> Ver detalhes
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <section className="py-12 text-center">
                <h3 className="font-display text-lg font-semibold">
                  {allMatches.length
                    ? "Nenhum cargo com estes filtros"
                    : "Ainda não encontramos indicações suficientes"}
                </h3>
                <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
                  {allMatches.length
                    ? "Nenhuma indicação compatível corresponde à sua busca."
                    : "Os perfis disponíveis não têm competências suficientes em comum com seu currículo. Nenhuma qualificação foi presumida."}
                </p>
                {allMatches.length ? (
                  <Button variant="soft" className="mt-4" onClick={resetFilters}>
                    Limpar filtros
                  </Button>
                ) : (
                  <Button variant="soft" className="mt-4" asChild>
                    <Link to="/">
                      Revisar vaga e currículo <ArrowRight />
                    </Link>
                  </Button>
                )}
              </section>
            )}
          </>
        )}
      </div>
      <Dialog
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="break-words font-display">{selected.title}</DialogTitle>
                <DialogDescription>
                  {selected.source === "referencia"
                    ? "Vaga informada por você no Otimizador."
                    : "Perfil ilustrativo de cargo, não um anúncio de contratação."}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm font-semibold">
                  {selected.score}% de cobertura · {selected.found.length} de{" "}
                  {selected.keywords.length} competências
                </p>
                <div>
                  <p className="mb-2 text-sm font-semibold text-success-strong">
                    Encontradas no currículo
                  </p>
                  <KeywordList terms={selected.found} kind="found" all />
                </div>
                <div>
                  <p className="mb-2 text-sm font-semibold text-primary-strong">
                    Não identificadas — inclua apenas se você possui
                  </p>
                  <KeywordList terms={selected.missing} kind="missing" all />
                </div>
                <div className="border-t border-border pt-4">
                  <h3 className="mb-2 text-sm font-semibold">
                    {selected.source === "referencia"
                      ? "Descrição informada"
                      : "Responsabilidades e requisitos de referência"}
                  </h3>
                  <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-muted-foreground">
                    {selected.description}
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setSelected(null)}>
                  Fechar
                </Button>
                <Button variant="action" onClick={() => optimize(selected)}>
                  <Zap /> Otimizar para este cargo
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function KeywordList({
  terms,
  kind,
  all = false,
}: {
  terms: string[];
  kind: "found" | "missing";
  all?: boolean;
}) {
  const shown = all ? terms : terms.slice(0, 6);
  return (
    <div className="flex flex-wrap gap-1.5">
      {shown.map((term) => (
        <Badge
          key={term}
          variant={kind === "found" ? "success" : "lavender"}
          className="max-w-full whitespace-normal break-words"
        >
          {term}
        </Badge>
      ))}
      {!all && terms.length > shown.length && (
        <Badge variant="outline">+{terms.length - shown.length}</Badge>
      )}
      {!terms.length && (
        <span className="text-xs text-muted-foreground">
          {kind === "found" ? "Nenhuma identificada" : "Nenhuma lacuna identificada"}
        </span>
      )}
    </div>
  );
}
