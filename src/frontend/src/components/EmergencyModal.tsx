import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { speak } from "@/utils/tts";
import { AlertTriangle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";

interface EmergencyModalProps {
  open: boolean;
  uncheckedItems: string[];
  onGoBack: () => void;
  onLeaveAnyway: () => void;
}

export function EmergencyModal({
  open,
  uncheckedItems,
  onGoBack,
  onLeaveAnyway,
}: EmergencyModalProps) {
  const { language } = useLanguage();

  useEffect(() => {
    if (open && uncheckedItems.length > 0) {
      const msg = `Warning! You have not completed your checklist. Please take all essential items. Missing items: ${uncheckedItems.join(", ")}`;
      setTimeout(() => speak(msg, language), 400);
    }
  }, [open, uncheckedItems, language]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          data-ocid="emergency.dialog"
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onGoBack}
          />

          {/* Modal */}
          <motion.div
            className="relative z-10 w-full max-w-[430px] mx-auto glass-card rounded-t-3xl sm:rounded-3xl p-6 glow-red"
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Warning header */}
            <div className="flex flex-col items-center gap-3 mb-6">
              <motion.div
                className="w-16 h-16 rounded-full bg-destructive/20 border border-destructive/50 flex items-center justify-center"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
              >
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </motion.div>
              <h2 className="font-display text-2xl font-bold text-destructive text-center">
                CHECKLIST INCOMPLETE
              </h2>
              <p className="text-muted-foreground text-center text-sm">
                You haven't checked off these essential items:
              </p>
            </div>

            {/* Unchecked items */}
            <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 mb-6 space-y-2">
              {uncheckedItems.map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                  <span className="font-medium text-foreground">{item}</span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 h-14 text-base font-semibold border-border/60"
                onClick={onGoBack}
                data-ocid="emergency.cancel_button"
              >
                Go Back
              </Button>
              <Button
                className="flex-1 h-14 text-base font-semibold bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                onClick={onLeaveAnyway}
                data-ocid="emergency.confirm_button"
              >
                Leave Anyway
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
