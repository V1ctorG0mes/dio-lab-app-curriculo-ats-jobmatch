import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, type ReactNode } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { BarChart3, Copy, Eye, FileSearch, Plus, Printer, Target, Trash2, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { PrintableResume, ResumeSheet } from "@/components/app/ResumeSheet";
import { removeHistoryEntry, summarize, useHistory, type HistoryEntry } from "@/lib/history";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard & Histórico — JobMatch ATS" },
      {
        name: "description",
        content:
          "Acompanhe quantas vagas você analisou, seu score médio de compatibilidade e a evolução antes e depois da otimização ATS.",
      },
      { property: "og:title", content: "Dashboard & Histórico — JobMatch ATS" },
      {
        property: "og:description",
        content: "Métricas de match e histórico dos currículos otimizados para ATS.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardPage,
});

const chartConfig = {
  inicial: { label: "Nota inicial", color: "var(--primary-border)" },
  otimizada: { label: "Após otimização ATS", color: "var(--success)" },
} satisfies ChartConfig;

function DashboardPage() {
  const history = useHistory();
  const stats = summarize(history);
  const [viewing, setViewing] = useState<HistoryEntry | null>(null);
  const [deleting, setDeleting] = useState<HistoryEntry | null>(null);

  const chartData = useMemo(
    () =>
      [...history]
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
        .slice(-8)
        .map((e) => ({
          vaga: e.title.length > 18 ? `${e.title.slice(0, 17)}…` : e.title,
          inicial: e.initialScore,
          otimizada: e.score,
        })),
    [history],
  );

  return (
    <div className="bg-hero">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              Dashboard & Histórico
            </p>
            <h1 className="mt-1 font-display text-3xl font-bold text-foreground sm:text-4xl">
              Sua evolução nas candidaturas
            </h1>
          </div>
          <Button variant="action" asChild>
            <Link to="/">
              <Plus /> Nova análise
            </Link>
          </Button>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <KpiCard
            icon={<FileSearch className="size-5" />}
            label="Total de análises feitas"
            value={String(stats.total)}
            hint={stats.total === 1 ? "vaga analisada" : "vagas analisadas"}
          />
          <KpiCard
            icon={<Target className="size-5" />}
            label="Score médio de compatibilidade"
            value={`${stats.average}%`}
            hint="após otimização ATS"
            highlight
          />
          <KpiCard
            icon={<Trophy className="size-5" />}
            label="Maior match atingido"
            value={stats.best ? `${stats.best.score}%` : "—"}
            hint={stats.best ? stats.best.title : "nenhuma análise ainda"}
          />
        </div>

        <Card className="mt-6 rounded-2xl border-primary-border shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display text-lg">
              <BarChart3 className="size-5 text-primary" /> Antes vs. depois da otimização
            </CardTitle>
            <CardDescription>Nota do currículo original comparada à versão ATS.</CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length ? (
              <ChartContainer config={chartConfig} className="aspect-auto h-[280px] w-full">
                <BarChart data={chartData} barGap={4}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="vaga" tickLine={false} axisLine={false} tickMargin={10} />
                  <YAxis domain={[0, 100]} tickLine={false} axisLine={false} width={32} unit="%" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="inicial" fill="var(--color-inicial)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="otimizada" fill="var(--color-otimizada)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ChartContainer>
            ) : (
              <p className="py-12 text-center text-sm text-muted-foreground">
                Salve uma análise para ver o gráfico.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="mt-6 overflow-hidden rounded-2xl border-primary-border shadow-soft">
          <CardHeader>
            <CardTitle className="font-display text-lg">Histórico de vagas analisadas</CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-2">
            {history.length ? (
              <Table>
                <TableHeader>
                  <TableRow className="bg-primary-soft/60 hover:bg-primary-soft/60">
                    <TableHead className="pl-6">Cargo / Vaga</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Score de match</TableHead>
                    <TableHead className="pr-6 text-right">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="pl-6 font-medium text-foreground">{e.title}</TableCell>
                      <TableCell className="text-muted-foreground">{e.company}</TableCell>
                      <TableCell className="tabular-nums text-muted-foreground">
                        {format(new Date(e.createdAt), "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell>
                        <Badge variant={e.score >= 75 ? "success" : "lavender"} className="tabular-nums">
                          {e.score}%
                        </Badge>
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="soft" size="sm" onClick={() => setViewing(e)}>
                            <Eye />
                            <span className="hidden md:inline">Ver Currículo Otimizado</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Excluir ${e.title}`}
                            onClick={() => setDeleting(e)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="px-6 py-12 text-center">
                <p className="text-sm text-muted-foreground">Nenhuma análise salva ainda.</p>
                <Button variant="action" asChild className="mt-4">
                  <Link to="/">Fazer primeira análise</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ResumeDialog entry={viewing} onClose={() => setViewing(null)} />

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir esta análise?</AlertDialogTitle>
            <AlertDialogDescription>
              "{deleting?.title}" será removida do seu histórico neste navegador.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleting) removeHistoryEntry(deleting.id);
                toast.success("Análise excluída");
                setDeleting(null);
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function KpiCard(props: {
  icon: ReactNode;
  label: string;
  value: string;
  hint: string;
  highlight?: boolean;
}) {
  return (
    <Card
      className={
        props.highlight
          ? "rounded-2xl border-success bg-success-soft shadow-soft"
          : "rounded-2xl border-primary-border shadow-soft"
      }
    >
      <CardContent className="flex items-start gap-4 p-5">
        <span
          className={
            props.highlight
              ? "grid size-10 place-items-center rounded-xl bg-success text-success-foreground"
              : "grid size-10 place-items-center rounded-xl bg-primary-soft text-primary"
          }
        >
          {props.icon}
        </span>
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{props.label}</p>
          <p
            className={
              props.highlight
                ? "font-display text-3xl font-bold text-success-strong"
                : "font-display text-3xl font-bold text-foreground"
            }
          >
            {props.value}
          </p>
          <p className="truncate text-xs text-muted-foreground">{props.hint}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function ResumeDialog({ entry, onClose }: { entry: HistoryEntry | null; onClose: () => void }) {
  const copy = async () => {
    if (!entry) return;
    try {
      await navigator.clipboard.writeText(entry.plainText);
      toast.success("Texto copiado");
    } catch {
      toast.error("Não foi possível copiar automaticamente.");
    }
  };
  return (
    <Dialog open={!!entry} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92vh] max-w-4xl overflow-hidden rounded-2xl p-0">
        {entry && (
          <>
            <DialogHeader className="border-b border-border px-6 pt-6 pb-4">
              <DialogTitle className="font-display text-xl">{entry.title}</DialogTitle>
              <DialogDescription className="flex flex-wrap items-center gap-2">
                <span>{entry.company}</span>
                <Badge variant={entry.score >= 75 ? "success" : "lavender"}>{entry.score}% match</Badge>
                <span className="text-xs">antes: {entry.initialScore}%</span>
              </DialogDescription>
              <div className="flex gap-2 pt-2">
                <Button variant="subtle" size="sm" onClick={copy}>
                  <Copy /> Copiar Texto
                </Button>
                <Button variant="subtle" size="sm" onClick={() => window.print()}>
                  <Printer /> Imprimir / Salvar PDF
                </Button>
              </div>
            </DialogHeader>
            <div className="max-h-[calc(92vh-170px)] overflow-auto bg-muted p-4 sm:p-6">
              <ResumeSheet resume={entry.resume} />
            </div>
            <PrintableResume resume={entry.resume} />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
