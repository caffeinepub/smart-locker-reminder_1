import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useGetSchedule, useSetSchedule } from "@/hooks/useQueries";
import { Clock, MapPin, Save } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function ScheduleSettings() {
  const { data: schedule, isLoading } = useGetSchedule();
  const setSchedule = useSetSchedule();

  const [departureTime, setDepartureTime] = useState("08:30");
  const [destinationLabel, setDestinationLabel] = useState("Legender Company");
  const [isEnabled, setIsEnabled] = useState(true);

  useEffect(() => {
    if (schedule) {
      setDepartureTime(schedule.departureTime);
      setDestinationLabel(schedule.destinationLabel);
      setIsEnabled(schedule.isEnabled);
    }
  }, [schedule]);

  const handleSave = async () => {
    try {
      await setSchedule.mutateAsync({
        departureTime,
        destinationLabel,
        isEnabled,
      });
      toast.success("Schedule saved!");
    } catch {
      toast.error("Failed to save schedule");
    }
  };

  return (
    <div className="flex flex-col gap-4 px-4 pt-4 pb-28">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-display text-2xl font-bold">Schedule</h1>
        <p className="text-muted-foreground text-sm">
          Set your daily departure time
        </p>
      </motion.div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 rounded-2xl bg-secondary/50 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-5 space-y-6"
        >
          {/* Enable toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">Daily Reminder</p>
              <p className="text-muted-foreground text-sm">
                Enable countdown & alerts
              </p>
            </div>
            <Switch
              checked={isEnabled}
              onCheckedChange={setIsEnabled}
              data-ocid="schedule.toggle"
            />
          </div>

          <div className="h-px bg-border/40" />

          {/* Departure time */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              Departure Time
            </Label>
            <Input
              type="time"
              value={departureTime}
              onChange={(e) => setDepartureTime(e.target.value)}
              className="h-14 text-xl font-display font-semibold bg-secondary/50 border-border/50 focus:border-primary/60"
              disabled={!isEnabled}
              data-ocid="schedule.input"
            />
            <p className="text-xs text-muted-foreground">
              Time you plan to leave every day
            </p>
          </div>

          {/* Destination */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              Destination
            </Label>
            <Input
              value={destinationLabel}
              onChange={(e) => setDestinationLabel(e.target.value)}
              placeholder="e.g. Legender Company"
              className="h-12 text-base bg-secondary/50 border-border/50 focus:border-primary/60"
              disabled={!isEnabled}
            />
            <p className="text-xs text-muted-foreground">
              Used in voice reminders
            </p>
          </div>

          {/* Preview */}
          {isEnabled && destinationLabel && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-primary/5 border border-primary/20 rounded-xl p-4"
            >
              <p className="text-xs font-medium text-primary uppercase tracking-wider mb-1">
                Voice Preview
              </p>
              <p className="text-sm text-muted-foreground italic">
                "You are leaving for {destinationLabel}. Please complete your
                checklist."
              </p>
            </motion.div>
          )}

          {/* Save */}
          <Button
            className="w-full h-14 text-base font-semibold gap-2"
            onClick={handleSave}
            disabled={setSchedule.isPending}
            data-ocid="schedule.save_button"
          >
            <Save className="w-5 h-5" />
            {setSchedule.isPending ? "Saving..." : "Save Schedule"}
          </Button>
        </motion.div>
      )}

      {/* Info cards */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="glass-card rounded-2xl p-5 space-y-3"
      >
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          How It Works
        </p>
        {[
          { icon: "⏰", text: "Countdown timer shows time until departure" },
          { icon: "🔔", text: "Speak Reminder reads unchecked items aloud" },
          { icon: "🔐", text: "Locker unlocks only when all tasks are done" },
        ].map((item) => (
          <div key={item.text} className="flex items-start gap-3">
            <span className="text-lg">{item.icon}</span>
            <p className="text-sm text-muted-foreground">{item.text}</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
