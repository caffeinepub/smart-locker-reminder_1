import { CheckSquare, Clock, LayoutDashboard, Settings } from "lucide-react";
import { motion } from "motion/react";

export type Tab = "dashboard" | "tasks" | "schedule" | "settings";

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const tabs: { id: Tab; label: string; icon: React.ReactNode; ocid: string }[] =
  [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={22} />,
      ocid: "nav.dashboard_link",
    },
    {
      id: "tasks",
      label: "Tasks",
      icon: <CheckSquare size={22} />,
      ocid: "nav.tasks_link",
    },
    {
      id: "schedule",
      label: "Schedule",
      icon: <Clock size={22} />,
      ocid: "nav.schedule_link",
    },
    {
      id: "settings",
      label: "Settings",
      icon: <Settings size={22} />,
      ocid: "nav.settings_link",
    },
  ];

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40">
      <div className="max-w-[430px] mx-auto">
        <div className="glass-card border-t border-border/40 pb-safe">
          <div className="flex items-stretch">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  type="button"
                  key={tab.id}
                  className="flex-1 flex flex-col items-center justify-center gap-1 pt-3 pb-2 relative transition-colors"
                  onClick={() => onTabChange(tab.id)}
                  data-ocid={tab.ocid}
                  aria-label={tab.label}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute inset-x-3 top-0 h-0.5 rounded-full bg-primary"
                    />
                  )}
                  <motion.span
                    animate={{
                      color: isActive
                        ? "oklch(0.82 0.175 200)"
                        : "oklch(0.55 0.015 248)",
                      scale: isActive ? 1.1 : 1,
                    }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center justify-center"
                  >
                    {tab.icon}
                  </motion.span>
                  <span
                    className="text-[10px] font-medium"
                    style={{
                      color: isActive
                        ? "oklch(0.82 0.175 200)"
                        : "oklch(0.55 0.015 248)",
                    }}
                  >
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
