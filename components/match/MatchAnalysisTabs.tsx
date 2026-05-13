import Link from "next/link";
import type { MatchAnalysisSource, MatchAnalysisTab, MatchAnalysisView } from "./types";

export function MatchAnalysisTabs({
  fixtureId,
  source,
  tabs,
  activeTab,
}: {
  fixtureId: string;
  source: MatchAnalysisSource;
  tabs: MatchAnalysisTab[];
  activeTab: MatchAnalysisView;
}) {
  const gridClass = tabs.length === 5 ? "md:grid-cols-5" : "md:grid-cols-4";

  return (
    <nav className={`grid overflow-hidden rounded-2xl border border-white/[0.07] bg-[rgba(7,16,24,0.82)] ${gridClass}`}>
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          href={`/match/${fixtureId}?source=${source || "matches"}&tab=${tab.hrefTab || tab.key}`}
          className={`relative flex h-12 items-center justify-center text-sm font-black transition-colors ${
            activeTab === tab.key ? "text-[#35E75A]" : "text-[rgba(243,246,247,0.66)] hover:text-[#F3F6F7]"
          }`}
        >
          {tab.label}
          {activeTab === tab.key && <span className="absolute bottom-0 h-[2px] w-24 rounded-full bg-[#35E75A]" />}
        </Link>
      ))}
    </nav>
  );
}
