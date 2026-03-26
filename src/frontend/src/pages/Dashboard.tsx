import { EmergencyModal } from "@/components/EmergencyModal";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useLanguage } from "@/context/LanguageContext";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import {
  useAddItem,
  useGetItems,
  useGetLockerStatus,
  useGetSchedule,
  useLockLocker,
  useToggleItem,
  useUnlockLocker,
} from "@/hooks/useQueries";
import { speak } from "@/utils/tts";
import { Lock, LogIn, LogOut, Unlock, Volume2, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

const SEED_ITEMS = ["Car Key", "Wallet", "ID Card", "Phone", "Documents"];

function useCountdown(departureTime: string | null, isEnabled: boolean) {
  const [remaining, setRemaining] = useState<{
    hours: number;
    minutes: number;
    total: number;
  } | null>(null);

  useEffect(() => {
    if (!departureTime || !isEnabled) {
      setRemaining(null);
      return;
    }

    const calc = () => {
      const [h, m] = departureTime.split(":").map(Number);
      const now = new Date();
      const dep = new Date();
      dep.setHours(h, m, 0, 0);
      if (dep <= now) dep.setDate(dep.getDate() + 1);
      const diff = dep.getTime() - now.getTime();
      const totalMin = Math.floor(diff / 60000);
      setRemaining({
        hours: Math.floor(totalMin / 60),
        minutes: totalMin % 60,
        total: totalMin,
      });
    };

    calc();
    const interval = setInterval(calc, 30000);
    return () => clearInterval(interval);
  }, [departureTime, isEnabled]);

  return remaining;
}

export function Dashboard() {
  const { identity, login, isLoggingIn } = useInternetIdentity();
  const { data: items = [], isLoading: itemsLoading } = useGetItems();
  const { data: schedule } = useGetSchedule();
  const { data: isLocked = true, isLoading: lockerLoading } =
    useGetLockerStatus();
  const toggleItem = useToggleItem();
  const unlockLocker = useUnlockLocker();
  const lockLocker = useLockLocker();
  const addItem = useAddItem();
  const { language } = useLanguage();
  const [emergencyOpen, setEmergencyOpen] = useState(false);
  const [seeded, setSeeded] = useState(false);

  // Seed default items on first load (only when authenticated)
  useEffect(() => {
    if (identity && !itemsLoading && items.length === 0 && !seeded) {
      setSeeded(true);
      SEED_ITEMS.forEach((text, i) => {
        addItem.mutate({ text, order: BigInt(i) });
      });
    }
  }, [identity, itemsLoading, items.length, seeded, addItem]);

  const countdown = useCountdown(
    schedule?.departureTime ?? null,
    schedule?.isEnabled ?? false,
  );

  const sortedItems = [...items].sort(
    (a, b) => Number(a.order) - Number(b.order),
  );
  const checkedCount = sortedItems.filter((i) => i.isChecked).length;
  const totalCount = sortedItems.length;
  const allChecked = totalCount > 0 && checkedCount === totalCount;
  const uncheckedItems = sortedItems
    .filter((i) => !i.isChecked)
    .map((i) => i.text);

  const progressPercent =
    totalCount > 0 ? (checkedCount / totalCount) * 100 : 0;

  const handleSpeak = useCallback(() => {
    const dest = schedule?.destinationLabel || "your destination";
    let msg = `You are leaving for ${dest}. Please complete your checklist.`;
    if (uncheckedItems.length > 0) {
      msg += ` You still need to take: ${uncheckedItems.join(", ")}.`;
    } else {
      msg += " All items are checked. You are ready to go!";
    }
    speak(msg, language);
    toast.success("Speaking reminder...");
  }, [schedule, uncheckedItems, language]);

  const handleLeave = () => {
    if (!allChecked) {
      setEmergencyOpen(true);
    } else {
      speak("All items checked. Have a safe journey!", language);
      toast.success("Have a safe journey! 🚗");
    }
  };

  const handleUnlock = async () => {
    if (!allChecked) return;
    try {
      const success = await unlockLocker.mutateAsync();
      if (success) {
        toast.success("Locker unlocked!");
        speak("Locker unlocked. Please collect your items.", language);
      } else {
        toast.error("Failed to unlock locker");
      }
    } catch {
      toast.error("Failed to unlock locker");
    }
  };

  const handleLock = async () => {
    try {
      await lockLocker.mutateAsync();
      toast.success("Locker locked.");
    } catch {
      toast.error("Failed to lock locker");
    }
  };

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const dateStr = now.toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div
      className="flex flex-col gap-4 px-4 pt-4 pb-28"
      data-ocid="dashboard.page"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-between items-start"
      >
        <div>
          <p className="text-muted-foreground text-sm">{dateStr}</p>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            Good Morning
          </h1>
        </div>
        <div className="text-right">
          <p className="font-display text-xl font-semibold text-primary">
            {timeStr}
          </p>
          <p className="text-muted-foreground text-xs">Current Time</p>
        </div>
      </motion.div>

      {/* Sign-in banner (shown when not authenticated) */}
      <AnimatePresence>
        {!identity && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="glass-card rounded-2xl p-4 border border-primary/20 bg-primary/5 flex items-center gap-3"
            data-ocid="dashboard.signin_banner"
          >
            <LogIn className="w-5 h-5 text-primary flex-shrink-0" />
            <p className="flex-1 text-sm text-muted-foreground">
              <span className="text-foreground font-medium">Sign in</span> to
              save your checklist and locker data.
            </p>
            <Button
              size="sm"
              className="h-8 px-3 text-xs font-semibold flex-shrink-0"
              onClick={login}
              disabled={isLoggingIn}
              data-ocid="dashboard.signin_button"
            >
              {isLoggingIn ? "..." : "Sign In"}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Countdown Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="glass-card rounded-2xl p-5 relative overflow-hidden"
        data-ocid="dashboard.countdown"
      >
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider mb-1">
              Departure In
            </p>
            {countdown ? (
              <div className="flex items-baseline gap-1">
                <span className="font-display text-5xl font-bold text-primary tabular-nums">
                  {String(countdown.hours).padStart(2, "0")}
                </span>
                <span className="font-display text-2xl text-muted-foreground font-medium">
                  h
                </span>
                <span className="font-display text-5xl font-bold text-primary tabular-nums ml-1">
                  {String(countdown.minutes).padStart(2, "0")}
                </span>
                <span className="font-display text-2xl text-muted-foreground font-medium">
                  m
                </span>
              </div>
            ) : (
              <p className="font-display text-3xl font-semibold text-muted-foreground">
                {schedule?.isEnabled ? schedule.departureTime : "Not Set"}
              </p>
            )}
            {schedule?.destinationLabel && (
              <p className="text-sm text-muted-foreground mt-1">
                → {schedule.destinationLabel}
              </p>
            )}
          </div>

          {/* Progress ring (SVG) */}
          <div className="relative w-20 h-20" aria-hidden="true">
            <svg
              viewBox="0 0 80 80"
              className="w-full h-full -rotate-90"
              aria-hidden="true"
            >
              <circle
                cx="40"
                cy="40"
                r="32"
                fill="none"
                stroke="oklch(0.22 0.025 248)"
                strokeWidth="6"
              />
              <motion.circle
                cx="40"
                cy="40"
                r="32"
                fill="none"
                stroke="oklch(0.82 0.175 200)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 32}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 32 }}
                animate={{
                  strokeDashoffset:
                    2 * Math.PI * 32 * (1 - progressPercent / 100),
                }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-lg font-bold text-primary">
                {checkedCount}
              </span>
              <span className="text-xs text-muted-foreground">
                /{totalCount}
              </span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
            <span>Tasks Completed</span>
            <span>
              {checkedCount}/{totalCount}
            </span>
          </div>
          <div className="h-2 rounded-full bg-secondary overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            />
          </div>
        </div>
      </motion.div>

      {/* Locker Status Card */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className={`glass-card rounded-2xl p-5 relative overflow-hidden ${
          isLocked ? "" : "glow-green border-success/40"
        }`}
        data-ocid="dashboard.locker_status"
      >
        <div
          className="absolute inset-0 bg-gradient-to-br pointer-events-none"
          style={{
            backgroundImage: isLocked
              ? "radial-gradient(ellipse at top right, oklch(0.82 0.175 200 / 0.04) 0%, transparent 70%)"
              : "radial-gradient(ellipse at top right, oklch(0.74 0.19 145 / 0.08) 0%, transparent 70%)",
          }}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                isLocked
                  ? "bg-primary/10 border border-primary/30"
                  : "bg-success/10 border border-success/30"
              }`}
              animate={isLocked ? {} : { scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            >
              {isLocked ? (
                <Lock className="w-7 h-7 text-primary" />
              ) : (
                <Unlock className="w-7 h-7 text-success" />
              )}
            </motion.div>
            <div>
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
                Locker
              </p>
              <p
                className={`font-display text-2xl font-bold ${
                  isLocked ? "text-primary" : "text-success"
                }`}
              >
                {lockerLoading ? "..." : isLocked ? "LOCKED" : "UNLOCKED"}
              </p>
            </div>
          </div>

          {isLocked ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span tabIndex={-1}>
                    <Button
                      size="sm"
                      className="h-10 px-4 font-semibold text-sm"
                      onClick={handleUnlock}
                      disabled={!allChecked || unlockLocker.isPending}
                      data-ocid="dashboard.unlock_button"
                    >
                      <Zap className="w-4 h-4 mr-1" />
                      Unlock
                    </Button>
                  </span>
                </TooltipTrigger>
                {!allChecked && (
                  <TooltipContent side="left">
                    <p>Complete all tasks first</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="h-10 px-4 font-semibold text-sm border-success/40 text-success hover:bg-success/10"
              onClick={handleLock}
              disabled={lockLocker.isPending}
            >
              <Lock className="w-4 h-4 mr-1" />
              Lock
            </Button>
          )}
        </div>
      </motion.div>

      {/* Checklist */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="glass-card rounded-2xl p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold">
            Today's Checklist
          </h2>
          {allChecked && totalCount > 0 && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-xs font-medium text-success bg-success/10 border border-success/30 px-2.5 py-1 rounded-full"
            >
              All Done ✓
            </motion.span>
          )}
        </div>

        <div className="space-y-2">
          {itemsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-14 rounded-xl bg-secondary/50 animate-pulse"
                />
              ))}
            </div>
          ) : sortedItems.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <CheckSquareIcon className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">
                {identity
                  ? "No tasks yet. Add some in the Tasks tab."
                  : "Sign in to see your tasks."}
              </p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {sortedItems.map((item, index) => (
                <motion.button
                  type="button"
                  key={item.id.toString()}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                    item.isChecked
                      ? "bg-primary/5 border-primary/20"
                      : "bg-secondary/30 border-border/40 hover:border-border/70"
                  }`}
                  onClick={() => toggleItem.mutate(item.id)}
                  data-ocid={`checklist.item.${index + 1}`}
                  aria-label={`${item.isChecked ? "Uncheck" : "Check"} ${item.text}`}
                >
                  {/* Custom large checkbox */}
                  <div
                    className={`task-checkbox w-8 h-8 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      item.isChecked
                        ? "bg-primary border-primary"
                        : "border-border/60 bg-transparent"
                    }`}
                    data-ocid={`checklist.checkbox.${index + 1}`}
                  >
                    <AnimatePresence>
                      {item.isChecked && (
                        <motion.svg
                          aria-hidden="true"
                          initial={{ pathLength: 0, opacity: 0 }}
                          animate={{ pathLength: 1, opacity: 1 }}
                          exit={{ pathLength: 0, opacity: 0 }}
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                        >
                          <motion.path
                            d="M3 8l3.5 3.5L13 4"
                            stroke="oklch(0.08 0.025 250)"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 0.3 }}
                          />
                        </motion.svg>
                      )}
                    </AnimatePresence>
                  </div>
                  <span
                    className={`text-base font-medium text-left ${
                      item.isChecked
                        ? "line-through text-muted-foreground"
                        : "text-foreground"
                    }`}
                  >
                    {item.text}
                  </span>
                </motion.button>
              ))}
            </AnimatePresence>
          )}
        </div>
      </motion.div>

      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="flex flex-col gap-3"
      >
        <Button
          className="h-14 text-base font-semibold gap-2 bg-primary/20 border border-primary/40 text-primary hover:bg-primary/30"
          variant="outline"
          onClick={handleSpeak}
          data-ocid="dashboard.speak_button"
          style={{ borderColor: "oklch(0.82 0.175 200 / 0.4)" }}
        >
          <Volume2 className="w-5 h-5" />
          Speak Reminder
        </Button>

        <Button
          className={`h-14 text-base font-semibold gap-2 ${
            allChecked
              ? "bg-success text-success-foreground hover:bg-success/90"
              : "bg-destructive text-destructive-foreground hover:bg-destructive/90"
          }`}
          onClick={handleLeave}
          data-ocid="dashboard.leave_button"
        >
          <LogOut className="w-5 h-5" />
          {allChecked ? "Leave — Ready!" : "Leave"}
        </Button>
      </motion.div>

      <EmergencyModal
        open={emergencyOpen}
        uncheckedItems={uncheckedItems}
        onGoBack={() => setEmergencyOpen(false)}
        onLeaveAnyway={() => {
          setEmergencyOpen(false);
          toast.warning("Left without completing checklist");
        }}
      />
    </div>
  );
}

// Small helper icon
function CheckSquareIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <polyline points="9 11 12 14 22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}
