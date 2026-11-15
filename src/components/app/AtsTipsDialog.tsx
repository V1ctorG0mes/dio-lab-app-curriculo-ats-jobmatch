import { Lightbulb } from "lucide-react";
import type { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const TIPS = [
  {
    title: "Use as palavras exatas da vaga",
    body: "Se a vaga pede \"React\" e você escreveu \"ReactJS\", repita o termo da vaga. Só vale para o que você realmente sabe fazer.",
  },
  {
    title: "Títulos de seção padrão",
    body: "Resumo Profissional, Experiência Profissional, Formação Acadêmica, Competências. Títulos criativos confundem o robô.",
  },
  {
    title: "Nada de tabelas, colunas ou ícones",
    body: "Emojis, gráficos de habilidade e layouts em duas colunas costumam ser lidos fora de ordem ou ignorados.",
  },
  {
    title: "Envie PDF com texto selecionável",
    body: "Nunca envie imagem ou escaneado. Se o formulário tiver campo de texto (como na Gupy), cole a versão em texto puro.",
  },
  {
    title: "Nunca invente experiências",
    body: "O ATS só abre a porta. Quem decide é uma pessoa — e ela vai checar tudo na entrevista.",
  },
];

export function AtsTipsDialog({ children }: { children: ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-xl">
            <Lightbulb className="size-5 text-primary" />5 mandamentos para passar pelo robô
          </DialogTitle>
          <DialogDescription>
            Regras simples que a maioria dos sistemas ATS segue.
          </DialogDescription>
        </DialogHeader>
        <ol className="space-y-3">
          {TIPS.map((tip, i) => (
            <li
              key={tip.title}
              className="flex gap-3 rounded-xl border border-primary-border bg-primary-soft/60 p-3"
            >
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-success font-display text-sm font-bold text-success-foreground">
                {i + 1}
              </span>
              <div>
                <p className="font-semibold text-foreground">{tip.title}</p>
                <p className="text-sm text-muted-foreground">{tip.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </DialogContent>
    </Dialog>
  );
}
