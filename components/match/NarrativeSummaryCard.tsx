import { MessageCircle } from "lucide-react";

export function NarrativeSummaryCard({ title, text }: { title: string; text: string }) {
  return (
    <section className="rounded-3xl border border-white/[0.08] bg-[rgba(7,16,24,0.82)] p-4 shadow-[0_18px_50px_rgba(0,0,0,0.28)] xl:col-span-2">
      <div className="mb-2 flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#35E75A]/10 text-[#35E75A]">
          <MessageCircle size={18} />
        </span>
        <h2 className="text-lg font-black tracking-[-0.02em] text-[#F3F6F7]">{title}</h2>
      </div>
      <p className="text-[15px] font-medium leading-relaxed text-[rgba(243,246,247,0.72)]">{text}</p>
    </section>
  );
}
