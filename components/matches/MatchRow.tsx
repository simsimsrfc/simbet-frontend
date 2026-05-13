import Image from "next/image";
import Link from "next/link";
import { Clock, ChevronRight, Sparkles, Trophy } from "lucide-react";
import type { MatchSummary } from "@/lib/types";
import { over25DisplayProbability } from "@/lib/probabilities";
import { StatPill } from "@/components/ui/StatPill";

function fmtTime(iso: string): string {
  if (!iso) return "—";
  try { return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }); }
  catch { return "—"; }
}

function getTeamInitials(name: string): string {
  const exceptions: Record<string, string> = {
    "SC Paderborn 07": "PB",
    "Karlsruher SC": "KS",
    "1. FC Kaiserslautern": "KL",
    "Borussia Dortmund": "BD",
    "Eintracht Frankfurt": "EF",
    "Arminia Bielefeld": "AB",
    Lens: "LE",
    Nantes: "NA",
  };
  if (exceptions[name]) return exceptions[name];

  const ignored = new Set(["fc", "sc", "cf", "ac", "as", "afc", "rc", "hnk", "club", "football"]);
  const rawParts = name
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((part) => part && !/^\d+$/.test(part) && !["07", "1"].includes(part));
  const meaningful = rawParts
    .filter((part) => part.length > 1)
    .filter((part) => !ignored.has(part.toLowerCase()));

  if (meaningful.length >= 2) {
    return `${meaningful[0][0] || ""}${meaningful[1][0] || ""}`.toUpperCase();
  }

  const word = (meaningful[0] || rawParts[0] || name).replace(/[^a-zA-Z0-9]/g, "");
  return word.slice(0, 2).toUpperCase();
}

export function MatchRow({ match: m }: { match: MatchSummary }) {
  const winnerLabel =
    m.predicted_winner === "home" ? "Home" :
    m.predicted_winner === "away" ? "Away" :
    m.predicted_winner === "draw" ? "Draw" : null;

  return (
    <Link
      href={`/match/${m.fixture_id}`}
      className="group grid h-[92px] grid-cols-[72px_minmax(360px,1fr)_260px_118px_30px] items-center gap-[14px] rounded-[22px] border border-[rgba(130,170,150,0.14)] bg-[rgba(10,18,24,0.70)] p-[12px_14px] shadow-[0_12px_32px_rgba(0,0,0,0.18)] transition-all duration-200 hover:-translate-y-px hover:border-brand/25 hover:bg-[rgba(10,18,24,0.84)] max-[1280px]:grid-cols-[72px_minmax(320px,1fr)_240px_110px_30px] max-[1100px]:h-auto max-[1100px]:grid-cols-[70px_minmax(0,1fr)_32px]"
    >
      <TimeBadge date={m.date} />
      <div className="grid min-w-0 grid-cols-[minmax(140px,1fr)_34px_minmax(140px,1fr)] items-center gap-3 max-[1100px]:col-start-2">
        <TeamIdentity name={m.home_team.name} logo={m.home_team.logo} side="home" />
        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(130,170,150,0.16)] bg-white/[0.025] text-[9px] font-extrabold uppercase tracking-[0.14em] text-fg/50">VS</span>
        <TeamIdentity name={m.away_team.name} logo={m.away_team.logo} side="away" />
      </div>
      <div className="flex items-center gap-2 max-[1100px]:col-start-2 max-[1100px]:row-start-2">
        <StatPill label="+2.5" value={over25DisplayProbability(m)} size="sm" />
        <StatPill label="+1.5" value={m.probabilities.over_15} size="sm" />
        <StatPill label="BTTS" value={m.probabilities.btts} size="sm" />
      </div>
      <div className="flex min-w-[118px] justify-end max-[1100px]:col-start-2 max-[1100px]:row-start-3 max-[1100px]:justify-start">
        <SignalBadge isSmart={m.is_smart_bet} winnerLabel={winnerLabel} winnerProba={m.winner_proba} />
      </div>
      <ChevronRight size={18} className="flex w-8 justify-center text-fg/35 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-fg/70 max-[1100px]:col-start-3 max-[1100px]:row-span-3" />
    </Link>
  );
}

function TimeBadge({ date }: { date: string }) {
  return (
    <div className="inline-flex h-[60px] w-[60px] shrink-0 flex-col items-center justify-center gap-1 rounded-[16px] border border-[rgba(130,170,150,0.16)] bg-white/[0.028]">
      <Clock size={12} className="text-brand/75" />
      <span className="font-mono text-[14px] font-extrabold leading-none tracking-[0.04em] text-fg">{fmtTime(date)}</span>
    </div>
  );
}

function TeamIdentity({
  name,
  logo,
  side,
}: {
  name: string;
  logo: string;
  side: "home" | "away";
}) {
  const badge = logo ? (
    <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full border border-[rgba(130,170,150,0.16)] bg-white/[0.035] text-[11px] font-extrabold tracking-[0.04em] text-fg">
      <Image
        src={logo}
        alt=""
        width={34}
        height={34}
        unoptimized
        className="max-h-[34px] max-w-[34px] rounded-full object-contain"
      />
    </span>
  ) : (
    <TeamPlaceholder name={name} />
  );

  return (
    <div className={`flex min-w-0 items-center gap-3 ${side === "home" ? "justify-end" : "justify-start"}`}>
      {side === "home" && (
        <>
          <span className="block max-w-[300px] whitespace-normal text-right text-lg font-extrabold leading-[1.08] tracking-[-0.035em] text-fg max-[1280px]:text-base">
            {name}
          </span>
          {badge}
        </>
      )}
      {side === "away" && (
        <>
          {badge}
          <span className="block max-w-[300px] whitespace-normal text-left text-lg font-extrabold leading-[1.08] tracking-[-0.035em] text-fg max-[1280px]:text-base">
            {name}
          </span>
        </>
      )}
    </div>
  );
}

function TeamPlaceholder({ name }: { name: string }) {
  return (
    <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full border border-[rgba(130,170,150,0.16)] bg-[rgba(255,255,255,0.035)] text-[10px] font-bold tracking-[0.04em] text-fg/85">
      {getTeamInitials(name)}
    </div>
  );
}

function SignalBadge({
  isSmart,
  winnerLabel,
  winnerProba,
}: {
  isSmart: boolean;
  winnerLabel: string | null;
  winnerProba: number;
}) {
  if (isSmart) {
    return (
      <span className="flex h-8 min-w-[104px] items-center justify-center gap-1.5 rounded-full bg-[#D8AC2F] px-3 text-[10px] font-black uppercase tracking-[0.08em] text-[#050B0E] shadow-[0_8px_22px_rgba(216,172,47,0.14)]">
        <Sparkles size={12} strokeWidth={2.5} /> Smart Sim
      </span>
    );
  }

  if (!winnerLabel) return <span className="text-xs font-bold text-fg-muted">Analyse</span>;

  return (
    <span className="flex h-8 max-w-[116px] items-center justify-center gap-1.5 overflow-hidden whitespace-nowrap rounded-full border border-[rgba(130,170,150,0.14)] bg-white/[0.028] px-2.5 text-xs font-bold text-fg/80">
      <Trophy size={12} className="shrink-0 text-brand/80" />
      <span className="text-fg">{winnerLabel}</span>
      <span className="text-brand">{Math.round(winnerProba * 100)}%</span>
    </span>
  );
}
