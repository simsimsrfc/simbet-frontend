import type { AnalysisViewConfig } from "./types";
import { confidenceLabel, formatProbability } from "./matchUtils";

export function PrimaryAnalysisCard({ data }: { data: AnalysisViewConfig }) {
  return (
    <section className="rounded-3xl border border-white/[0.08] bg-[rgba(7,16,24,0.82)] p-4 shadow-[0_18px_50px_rgba(0,0,0,0.28)]">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-black tracking-[-0.02em] text-[#F3F6F7]">{data.title}</h2>
        {data.badge && (
          <span className="inline-flex h-6 items-center rounded-full border border-[#35E75A]/20 bg-[#35E75A]/10 px-2.5 text-[10px] font-black uppercase tracking-[0.08em] text-[#DFFFE8]">
            {data.badge}
          </span>
        )}
      </div>
      <div className="rounded-2xl border border-[#35E75A]/24 bg-[radial-gradient(circle_at_0%_0%,rgba(53,231,90,0.14),transparent_45%),rgba(5,12,18,0.74)] p-4 md:p-5">
        {data.available ? (
          <div className="grid gap-4 md:grid-cols-[1fr_130px_150px] md:items-center">
            <div>
              <div className="text-[42px] font-black leading-none tracking-[-0.04em] text-[#35E75A] md:text-[48px]">
                {data.primary}
              </div>
              {data.subPrimary && <div className="mt-1 text-base font-black text-[#35E75A]">{data.subPrimary}</div>}
            </div>
            <Metric label="Probabilité" value={formatProbability(data.probability)} />
            <Metric label="Niveau de confiance" value={confidenceLabel(data.probability)} />
            <p className="text-[15px] font-medium leading-relaxed text-[rgba(243,246,247,0.70)] md:col-span-3">
              {data.shortText}
            </p>
          </div>
        ) : (
          <div className="py-5">
            <div className="text-2xl font-black text-[rgba(243,246,247,0.82)]">Indisponible</div>
            <p className="mt-3 max-w-2xl text-sm font-medium leading-relaxed text-[rgba(243,246,247,0.58)]">
              Cette lecture n'est pas disponible pour ce match avec les données reçues.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-white/10 md:border-l md:pl-6">
      <div className="text-xs font-semibold text-[rgba(243,246,247,0.66)]">{label}</div>
      <div className="mt-1 text-[30px] font-black leading-none text-[#35E75A]">{value}</div>
    </div>
  );
}
