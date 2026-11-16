import { Link } from "@tanstack/react-router";
import { LayoutDashboard, Lightbulb, Moon, ShieldCheck, Sparkles, Sun } from "lucide-react";
import { Logo } from "./Logo";
import { AtsTipsDialog } from "./AtsTipsDialog";
import { toggleTheme, useTheme } from "@/lib/theme";

const navItem =
  "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-primary-soft hover:text-primary-strong";
const navActive = "bg-primary-soft text-primary-strong ring-1 ring-primary-border";

export function SiteHeader() {
  const theme = useTheme();
  const isDark = theme === "dark";

  return (
    <header className="sticky top-0 z-40 border-b border-primary-border/70 bg-surface/90 backdrop-blur">
      <div className="bg-primary-soft text-primary-strong">
        <p className="mx-auto flex max-w-7xl items-start gap-2 px-4 py-2 text-xs sm:items-center sm:text-sm">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 sm:mt-0" />
          <span>
            <strong className="font-semibold">Garantia Ética:</strong> Este app alinha palavras-chave
            e formatação para sistemas ATS, mas NUNCA inventa experiências que você não possui.
          </span>
        </p>
      </div>
      <nav className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link to="/" aria-label="JobMatch ATS — início">
          <Logo />
        </Link>
        <div className="flex items-center gap-1 overflow-x-auto">
          <Link
            to="/"
            className={navItem}
            activeProps={{ className: navActive }}
            activeOptions={{ exact: true }}
          >
            <Sparkles className="size-4" />
            <span>Otimizador ATS</span>
          </Link>
          <Link to="/dashboard" className={navItem} activeProps={{ className: navActive }}>
            <LayoutDashboard className="size-4" />
            <span>
              Dashboard<span className="hidden sm:inline"> & Histórico</span>
            </span>
          </Link>
          <AtsTipsDialog>
            <button type="button" className={navItem}>
              <Lightbulb className="size-4" />
              <span>Dicas ATS</span>
            </button>
          </AtsTipsDialog>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
            title={isDark ? "Modo claro" : "Modo escuro"}
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl border border-primary-border/70 bg-primary-soft/60 text-primary-strong transition-colors hover:bg-primary-soft"
          >
            {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
        </div>
      </nav>
    </header>
  );
}
