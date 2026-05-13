import { Sidebar } from "@/components/layout/Sidebar";
import { createSupabaseServer } from "@/lib/supabase/server";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-[#050B12]">
      <Sidebar userEmail={user?.email ?? null} />
      <main className="min-h-screen bg-[#03080A] lg:ml-[260px]">
        <div className="mx-auto max-w-[1460px] px-9 pb-12 pt-8">{children}</div>
      </main>
    </div>
  );
}
