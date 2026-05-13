import { ReactNode, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { initTheme } from "@/lib/theme";

export function AppShell({ children }: { children: ReactNode }) {
  useEffect(() => { initTheme(); }, []);
  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 px-4 lg:px-8 py-6 lg:py-8 bg-gradient-hero">
          <div className="mx-auto max-w-[1500px] animate-fade-in-up">{children}</div>
        </main>
      </div>
    </div>
  );
}
