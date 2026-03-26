import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { BottomNav, type Tab } from "./components/BottomNav";
import { LanguageProvider } from "./context/LanguageContext";
import { InternetIdentityProvider } from "./hooks/useInternetIdentity";
import { ChecklistManager } from "./pages/ChecklistManager";
import { Dashboard } from "./pages/Dashboard";
import { ScheduleSettings } from "./pages/ScheduleSettings";
import { Settings } from "./pages/Settings";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 10_000,
    },
  },
});

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  return (
    <InternetIdentityProvider>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <div className="hud-bg min-h-dvh">
            {/* Scan line effect */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
              <div
                className="absolute left-0 right-0 h-px opacity-0 scan-line"
                style={{
                  background:
                    "linear-gradient(90deg, transparent 0%, oklch(0.82 0.175 200 / 0.3) 50%, transparent 100%)",
                }}
              />
            </div>

            {/* App container — mobile-first, centered */}
            <div className="max-w-[430px] mx-auto relative">
              {/* Content */}
              <main className="min-h-dvh">
                {activeTab === "dashboard" && <Dashboard />}
                {activeTab === "tasks" && <ChecklistManager />}
                {activeTab === "schedule" && <ScheduleSettings />}
                {activeTab === "settings" && <Settings />}
              </main>
            </div>

            {/* Bottom nav is outside the content container so it spans full width on desktop */}
            <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
          </div>

          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: "oklch(0.15 0.025 245)",
                border: "1px solid oklch(0.22 0.028 248)",
                color: "oklch(0.96 0.008 240)",
              },
            }}
          />
        </LanguageProvider>
      </QueryClientProvider>
    </InternetIdentityProvider>
  );
}
