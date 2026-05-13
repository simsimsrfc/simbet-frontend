"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { BarChart3, CalendarDays, ChevronRight, Trophy } from "lucide-react";
import type { MatchSummary } from "@/lib/types";
import { api } from "@/lib/api";
import { over25DisplayProbability } from "@/lib/probabilities";
import { Logo } from "@/components/layout/Logo";
import { CountryFlag } from "@/components/ui/CountryFlag";
import { FavoriteButton } from "@/components/favorites/FavoriteButton";

type ResultPick = {
  match: MatchSummary;
  code: "1" | "N" | "2" | "1N" | "N2" | "12";
  label: string;
  confidence: number;
};

type SelectedDay = "today" | "tomorrow";

const TEAM_LOGO_FALLBACK: Record<string, string> = {
  Frosinone: "https://media.api-sports.io/football/teams/512.png",
  Mantova: "https://media.api-sports.io/football/teams/1693.png",
  Lens: "https://media.api-sports.io/football/teams/116.png",
  Nantes: "https://media.api-sports.io/football/teams/83.png",
  "SC Paderborn 07": "https://media.api-sports.io/football/teams/185.png",
  "Karlsruher SC": "https://media.api-sports.io/football/teams/785.png",
  Pescara: "https://media.api-sports.io/football/teams/525.png",
  Spezia: "https://media.api-sports.io/football/teams/515.png",
  "Borussia Dortmund": "https://media.api-sports.io/football/teams/165.png",
  "Eintracht Frankfurt": "https://media.api-sports.io/football/teams/169.png",
  Venezia: "https://media.api-sports.io/football/teams/517.png",
  Palermo: "https://media.api-sports.io/football/teams/522.png",
  Catanzaro: "https://media.api-sports.io/football/teams/1687.png",
  Bari: "https://media.api-sports.io/football/teams/508.png",
  Reggiana: "https://media.api-sports.io/football/teams/880.png",
  Sampdoria: "https://media.api-sports.io/football/teams/498.png",
  "Hull City": "https://media.api-sports.io/football/teams/64.png",
  Millwall: "https://media.api-sports.io/football/teams/58.png",
  "Virtus Entella": "https://media.api-sports.io/football/teams/527.png",
  Carrarese: "https://media.api-sports.io/football/teams/1581.png",
  Torino: "https://media.api-sports.io/football/teams/503.png",
  Monza: "https://media.api-sports.io/football/teams/1579.png",
  Empoli: "https://media.api-sports.io/football/teams/511.png",
  "1. FC Kaiserslautern": "https://media.api-sports.io/football/teams/745.png",
  "Arminia Bielefeld": "https://media.api-sports.io/football/teams/188.png",
  Cesena: "https://media.api-sports.io/football/teams/509.png",
  Padova: "https://media.api-sports.io/football/teams/870.png",
  Sudtirol: "https://media.api-sports.io/football/teams/1578.png",
  "Juve Stabia": "https://media.api-sports.io/football/teams/863.png",
  Osasuna: "https://media.api-sports.io/football/teams/727.png",
  "Standard Liege": "https://media.api-sports.io/football/teams/733.png",
  Villefranche: "https://media.api-sports.io/football/teams/1302.png",
  Ajaccio: "https://media.api-sports.io/football/teams/98.png",
  Avellino: "https://media.api-sports.io/football/teams/528.png",
  Modena: "https://media.api-sports.io/football/teams/899.png",
};

function formatTime(iso: string): string {
  if (!iso) return "--:--";
  try {
    return new Date(iso).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "--:--";
  }
}

function getTeamInitials(name: string): string {
  const words = name
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean)
    .filter((part) => !["fc", "sc", "cf", "ac", "as", "afc", "rc", "club", "football"].includes(part.toLowerCase()))
    .filter((part) => !/^\d+$/.test(part));

  if (words.length >= 2) return `${words[0][0]}${words[1][0]}`.toUpperCase();
  return (words[0] || name).replace(/[^a-zA-Z0-9]/g, "").slice(0, 2).toUpperCase();
}

function teamLogo(match: MatchSummary, side: "home" | "away"): string {
  const team = side === "home" ? match.home_team : match.away_team;
  return team.logo || TEAM_LOGO_FALLBACK[team.name] || "";
}

function resultPick(match: MatchSummary): ResultPick | null {
  const selection = match.result_selection;
  if (!selection?.is_result_selection || !selection.pick || !selection.probability) return null;
  return {
    match,
    code: selection.pick,
    label: selection.label,
    confidence: selection.probability,
  };
}

function byResultConfidence(matches: MatchSummary[]): ResultPick[] {
  return matches
    .map(resultPick)
    .filter((pick): pick is ResultPick => Boolean(pick))
    .sort((a, b) => b.confidence - a.confidence);
}

function byOver25(matches: MatchSummary[]): MatchSummary[] {
  return [...matches]
    .filter((match) => Number.isFinite(match.probabilities.over_25))
    .sort((a, b) => b.probabilities.over_25 - a.probabilities.over_25);
}

export function SmartSimClient({ matches, resultMatches, error }: { matches: MatchSummary[]; resultMatches: MatchSummary[]; error: string | null }) {
  const [selectedDay, setSelectedDay] = useState<SelectedDay>("today");
  const [dayMatches, setDayMatches] = useState<MatchSummary[]>(matches);
  const [dayResultMatches, setDayResultMatches] = useState<MatchSummary[]>(resultMatches);
  const [dayError, setDayError] = useState<string | null>(error);
  const [resultVisible, setResultVisible] = useState(5);
  const [over25Visible, setOver25Visible] = useState(5);

  useEffect(() => {
    let cancelled = false;

    async function loadSmartSelections() {
      try {
        const [smartData, allData] = await Promise.all([
          api.smartSelections(0, selectedDay),
          api.matchesByDay(selectedDay),
        ]);
        if (!cancelled) {
          setDayMatches(smartData.matches);
          setDayResultMatches(allData.matches);
          setDayError(null);
          setResultVisible(5);
          setOver25Visible(5);
        }
      } catch (e) {
        if (!cancelled) {
          setDayMatches([]);
          setDayResultMatches([]);
          setDayError((e as Error).message);
        }
      }
    }

    loadSmartSelections();

    return () => {
      cancelled = true;
    };
  }, [selectedDay]);

  const label = selectedDay === "today" ? "Sélections du jour" : "Sélections de demain";
  const resultPicks = byResultConfidence(dayResultMatches);
  const over25Picks = byOver25(dayMatches);
  const visibleResultPicks = resultPicks.slice(0, resultVisible);
  const visibleOver25Picks = over25Picks.slice(0, over25Visible);

  return (
    <div className="space-y-5">
      <SmartHero selectedDay={selectedDay} onSelectDay={setSelectedDay} />

      {dayError && (
        <div className="rounded-2xl border border-danger/30 bg-danger/10 p-4 font-mono text-sm text-danger">
          {dayError}
        </div>
      )}

      {!dayError && (
        <>
          <p className="text-sm font-semibold text-[rgba(243,246,247,0.50)]">{label}</p>
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            <SelectionPanel
              icon={<Trophy size={22} />}
              title="Avis résultat du match"
              subtitle="Les avis les plus convaincants sur l'issue du match."
            >
              {resultPicks.length > 0 ? (
                <div className="space-y-2.5">
                  {visibleResultPicks.map((pick) => (
                    <ResultRow key={pick.match.fixture_id} pick={pick} />
                  ))}
                  {visibleResultPicks.length < resultPicks.length && (
                    <SeeMoreButton onClick={() => setResultVisible((value) => value + 5)} remaining={resultPicks.length - visibleResultPicks.length} />
                  )}
                </div>
              ) : (
                <PanelMessage>
                  {selectedDay === "today"
                    ? "Aucun avis résultat disponible aujourd'hui."
                    : "Aucun avis résultat disponible demain."}
                </PanelMessage>
              )}
            </SelectionPanel>

            <SelectionPanel
              icon={<BarChart3 size={22} />}
              title="+2,5 buts"
              subtitle="Les rencontres au profil offensif le plus intéressant."
            >
              {over25Picks.length > 0 ? (
                <div className="space-y-2.5">
                  {visibleOver25Picks.map((match) => (
                    <Over25Row key={match.fixture_id} match={match} />
                  ))}
                  {visibleOver25Picks.length < over25Picks.length && (
                    <SeeMoreButton onClick={() => setOver25Visible((value) => value + 5)} remaining={over25Picks.length - visibleOver25Picks.length} />
                  )}
                </div>
              ) : (
                <PanelMessage>
                  {selectedDay === "today"
                    ? "Aucun avis +2,5 disponible aujourd'hui."
                    : "Aucun avis +2,5 disponible demain."}
                </PanelMessage>
              )}
            </SelectionPanel>
          </div>
        </>
      )}

      <p className="text-center text-xs font-medium text-[rgba(243,246,247,0.42)]">
        Les avis affichés sont issus d'une lecture statistique et ne garantissent aucun résultat.
      </p>
    </div>
  );
}

function SeeMoreButton({ onClick, remaining }: { onClick: () => void; remaining: number }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-11 w-full items-center justify-center rounded-2xl border border-[rgba(53,231,90,0.18)] bg-[rgba(53,231,90,0.06)] text-sm font-extrabold text-[#35E75A] transition-colors hover:bg-[rgba(53,231,90,0.10)]"
    >
      Voir plus ({remaining})
    </button>
  );
}

function SmartHero({
  selectedDay,
  onSelectDay,
}: {
  selectedDay: SelectedDay;
  onSelectDay: (day: SelectedDay) => void;
}) {
  return (
    <header className="relative isolate min-h-[330px] overflow-hidden rounded-[32px] border border-[rgba(53,231,90,0.14)] bg-[#07131c] px-10 py-9 shadow-[0_14px_40px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.04)]">
      <img
        src="/stadium-night.jpg"
        alt=""
        className="absolute inset-0 -z-30 h-full w-full object-cover object-center"
      />
      <div className="pointer-events-none absolute inset-0 -z-20 bg-[linear-gradient(90deg,rgba(5,12,18,0.88)_0%,rgba(5,12,18,0.68)_36%,rgba(5,12,18,0.36)_62%,rgba(5,12,18,0.20)_100%)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_72%_78%,rgba(52,231,90,0.16),transparent_30%),radial-gradient(circle_at_82%_18%,rgba(73,181,255,0.10),transparent_26%)]" />

      <div className="relative max-w-[780px]">
        <div className="mb-5 flex items-center">
          <Logo className="h-auto w-[210px] object-contain" />
        </div>
        <span className="mb-5 inline-flex h-[34px] w-fit items-center rounded-full border border-[rgba(53,231,90,0.28)] bg-[rgba(5,11,18,0.36)] px-4 text-xs font-extrabold uppercase tracking-[0.22em] text-brand">
          Smart Sim
        </span>
        <h1 className="text-5xl font-extrabold leading-[0.95] tracking-[-0.06em] text-white md:text-6xl lg:text-[64px]">
          Sélections Smart Sim
        </h1>
        <p className="mt-5 max-w-[760px] text-lg leading-[1.55] text-[rgba(220,230,235,0.72)] md:text-[20px]">
          Nos avis du jour, organisés en deux lectures simples : résultat du match et plus de 2,5 buts.
        </p>
      </div>

      <DateSelector selectedDay={selectedDay} onSelectDay={onSelectDay} />
    </header>
  );
}

function DateSelector({
  selectedDay,
  onSelectDay,
}: {
  selectedDay: SelectedDay;
  onSelectDay: (day: SelectedDay) => void;
}) {
  return (
    <div className="absolute bottom-6 right-6 flex h-11 items-center gap-1 rounded-full border border-white/10 bg-[rgba(4,11,17,0.72)] p-1 backdrop-blur-xl max-sm:static max-sm:mt-7 max-sm:w-fit">
      <CalendarDays size={16} className="ml-2 text-[#35E75A]" />
      {[
        { value: "today" as const, label: "Aujourd'hui" },
        { value: "tomorrow" as const, label: "Demain" },
      ].map((item) => {
        const active = selectedDay === item.value;
        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onSelectDay(item.value)}
            className={`h-9 rounded-full border px-4 text-[13px] font-extrabold transition-colors ${
              active
                ? "border-[rgba(53,231,90,0.28)] bg-[rgba(53,231,90,0.18)] text-[#35E75A]"
                : "border-transparent bg-transparent text-[rgba(243,246,247,0.62)] hover:bg-white/[0.04] hover:text-[#F3F6F7]"
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

function SelectionPanel({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-[26px] border border-[rgba(53,231,90,0.14)] bg-[rgba(7,16,24,0.82)] p-[22px] shadow-[0_18px_50px_rgba(0,0,0,0.24)] backdrop-blur-xl">
      <div className="mb-4 flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-[rgba(53,231,90,0.24)] bg-[rgba(53,231,90,0.10)] text-[#35E75A]">
          {icon}
        </div>
        <div className="min-w-0">
          <h2 className="text-[25px] font-extrabold leading-tight tracking-[-0.04em] text-[#F3F6F7]">
            {title}
          </h2>
          <p className="mt-1 text-sm leading-snug text-[rgba(243,246,247,0.64)]">{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function ResultRow({ pick }: { pick: ResultPick }) {
  return (
    <SelectionRow match={pick.match} source="smart-result" analysisType="smart-result">
      <div className="flex w-[112px] shrink-0 flex-col items-center justify-center rounded-[14px] border border-[rgba(53,231,90,0.22)] bg-[rgba(53,231,90,0.09)] px-2 py-2 text-center">
        <div className="text-3xl font-black leading-none text-[#35E75A]">{pick.code}</div>
        <div className="mt-1 text-[11px] font-bold leading-tight text-[#DFFFE8]">{pick.label}</div>
        <div className="mt-1 text-[11px] font-semibold text-[rgba(243,246,247,0.64)]">
          Confiance <span className="font-black text-[#35E75A]">{Math.round(pick.confidence * 100)}%</span>
        </div>
      </div>
    </SelectionRow>
  );
}

function Over25Row({ match }: { match: MatchSummary }) {
  return (
    <SelectionRow match={match} source="smart-over25" analysisType="smart-over25">
      <div className="flex w-[112px] shrink-0 flex-col items-center justify-center rounded-[14px] border border-[rgba(53,231,90,0.22)] bg-[rgba(53,231,90,0.09)] px-2 py-2 text-center">
        <div className="rounded-lg border border-[rgba(53,231,90,0.22)] bg-[rgba(53,231,90,0.08)] px-3 py-1 text-2xl font-black leading-none text-[#35E75A]">
          +2.5
        </div>
        <div className="mt-2 text-[11px] font-semibold text-[rgba(243,246,247,0.64)]">Probabilité</div>
        <div className="text-lg font-black leading-none text-[#35E75A]">
          {Math.round(over25DisplayProbability(match) * 100)}%
        </div>
        <SmartBadge />
      </div>
    </SelectionRow>
  );
}

function SelectionRow({
  match,
  source,
  tab,
  analysisType,
  children,
}: {
  match: MatchSummary;
  source: "matches" | "smart-over25" | "smart-result";
  tab?: "result";
  analysisType: "result" | "smart-over25" | "smart-result";
  children: ReactNode;
}) {
  const href = source === "matches"
    ? `/match/${match.fixture_id}?source=matches&tab=${tab || "result"}`
    : `/match/${match.fixture_id}?source=${source}`;

  return (
    <Link
      href={href}
      className="group grid min-h-[92px] grid-cols-[minmax(0,1fr)_112px_40px_18px] items-center gap-3 overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(5,12,18,0.70)] p-3.5 transition-all hover:border-[rgba(53,231,90,0.20)] hover:bg-[rgba(8,18,25,0.78)] max-[640px]:grid-cols-[1fr_40px_18px]"
    >
      <div className="min-w-0">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <CountryFlag country={match.league.country} league={match.league.name} flag={match.league.flag} />
            <span className="truncate text-[11px] font-extrabold uppercase tracking-[0.08em] text-[rgba(243,246,247,0.72)]">
              {match.league.name || "Ligue"}
            </span>
          </div>
          <span className="shrink-0 font-mono text-sm font-bold text-[rgba(243,246,247,0.72)]">
            {formatTime(match.date)}
          </span>
        </div>
        <MatchTeams match={match} />
      </div>
      <div className="max-[640px]:row-start-2">{children}</div>
      <FavoriteButton
        match={match}
        source={source}
        tab={tab || "recommendations"}
        analysisType={analysisType}
      />
      <ChevronRight size={16} className="justify-self-center text-[rgba(243,246,247,0.34)] transition-all group-hover:translate-x-0.5 group-hover:text-[rgba(243,246,247,0.70)] max-[640px]:row-span-2" />
    </Link>
  );
}

function MatchTeams({ match }: { match: MatchSummary }) {
  return (
    <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_30px_minmax(0,1fr)] items-center gap-2">
      <TeamSide name={match.home_team.name} logo={teamLogo(match, "home")} align="right" />
      <span className="mx-auto flex h-7 w-7 items-center justify-center rounded-full border border-[rgba(255,255,255,0.10)] bg-[rgba(255,255,255,0.04)] text-[10px] font-extrabold text-[rgba(243,246,247,0.62)]">
        VS
      </span>
      <TeamSide name={match.away_team.name} logo={teamLogo(match, "away")} align="left" />
    </div>
  );
}

function TeamSide({ name, logo, align }: { name: string; logo: string; align: "left" | "right" }) {
  return (
    <div className={`flex min-w-0 items-center gap-2 ${align === "right" ? "justify-end" : "justify-start"}`}>
      {align === "right" && (
        <span className="min-w-0 truncate text-right text-[14px] font-bold text-[#F3F6F7]">{name}</span>
      )}
      <TeamLogo name={name} logo={logo} />
      {align === "left" && (
        <span className="min-w-0 truncate text-left text-[14px] font-bold text-[#F3F6F7]">{name}</span>
      )}
    </div>
  );
}

function TeamLogo({ name, logo }: { name: string; logo: string }) {
  if (logo) {
    return <img src={logo} alt={name} className="h-8 w-8 shrink-0 object-contain" />;
  }

  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[rgba(255,255,255,0.10)] bg-[rgba(255,255,255,0.06)] text-[10px] font-extrabold tracking-[0.04em] text-[rgba(243,246,247,0.88)]">
      {getTeamInitials(name)}
    </span>
  );
}

function SmartBadge() {
  return (
    <span className="mt-1.5 inline-flex h-5 items-center rounded-full border border-[rgba(53,231,90,0.18)] bg-[rgba(53,231,90,0.08)] px-2 text-[9px] font-extrabold uppercase tracking-[0.08em] text-[#DFFFE8]">
      Smart Sim
    </span>
  );
}

function PanelMessage({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(5,12,18,0.58)] px-4 py-6 text-sm font-medium text-[rgba(243,246,247,0.58)]">
      {children}
    </div>
  );
}
