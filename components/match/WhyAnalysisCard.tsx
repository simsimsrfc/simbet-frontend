import type { AnalysisSignal } from "./types";

export function WhyAnalysisCard({ title, signals }: { title: string; signals: AnalysisSignal[] }) {
  return (
    <section className="rounded-3xl border border-white/[0.08] bg-[rgba(7,16,24,0.82)] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.28)]">
      <h2 className="mb-5 text-xl font-black tracking-[-0.02em] text-[#F3F6F7]">{title}</h2>
      <div className="space-y-4">
        {signals.map((signal) => (
          <div key={signal.title} className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#35E75A]/10 text-[#35E75A]">
              {signal.icon}
            </div>
            <div>
              <div className="text-sm font-black text-[#F3F6F7]">{signal.title}</div>
              <div className="mt-1 text-sm font-medium leading-snug text-[rgba(243,246,247,0.62)]">{signal.text}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
