import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LANG_LABELS_MAP,
  type Language,
  useLanguage,
} from "@/context/LanguageContext";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { speak } from "@/utils/tts";
import { Globe, Info, LogIn, LogOut, ShieldCheck, Volume2 } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";

const LANGUAGES: { value: Language; label: string; nativeLabel: string }[] = [
  { value: "en-US", label: "English", nativeLabel: "English" },
  { value: "hi-IN", label: "Hindi", nativeLabel: "हिन्दी" },
  { value: "pa-IN", label: "Punjabi", nativeLabel: "ਪੰਜਾਬੀ" },
];

function truncatePrincipal(principal: string) {
  return principal.length > 12 ? `${principal.slice(0, 8)}...` : principal;
}

export function Settings() {
  const { language, setLanguage } = useLanguage();
  const { identity, login, clear, isLoggingIn } = useInternetIdentity();

  const handleTestVoice = () => {
    const msgs: Record<Language, string> = {
      "en-US": "Voice reminder is working. Have a great day!",
      "hi-IN": "आवाज़ अनुस्मारक काम कर रहा है। आपका दिन शुभ हो!",
      "pa-IN": "ਅਵਾਜ਼ ਯਾਦ-ਦਿਹਾਨੀ ਕੰਮ ਕਰ ਰਹੀ ਹੈ। ਤੁਹਾਡਾ ਦਿਨ ਚੰਗਾ ਹੋਵੇ!",
    };
    speak(msgs[language], language);
    toast.success(`Testing voice in ${LANG_LABELS_MAP[language]}`);
  };

  return (
    <div className="flex flex-col gap-4 px-4 pt-4 pb-28">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-display text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm">
          Customize your experience
        </p>
      </motion.div>

      {/* Account */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="glass-card rounded-2xl p-5 space-y-4"
        data-ocid="settings.account_card"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold">Account</p>
            <p className="text-muted-foreground text-xs">
              Internet Identity authentication
            </p>
          </div>
        </div>

        {identity ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/40 border border-border/30">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">
                  Principal
                </p>
                <p className="font-mono text-sm text-foreground">
                  {truncatePrincipal(identity.getPrincipal().toString())}
                </p>
              </div>
              <div
                className="w-2 h-2 rounded-full bg-success"
                aria-label="Connected"
              />
            </div>
            <Button
              variant="outline"
              className="w-full h-11 gap-2 border-destructive/30 text-destructive hover:bg-destructive/10"
              onClick={clear}
              data-ocid="settings.signout_button"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        ) : (
          <Button
            className="w-full h-12 gap-2 font-semibold"
            onClick={login}
            disabled={isLoggingIn}
            data-ocid="settings.signin_button"
          >
            <LogIn className="w-4 h-4" />
            {isLoggingIn ? "Signing in..." : "Sign In with Internet Identity"}
          </Button>
        )}
      </motion.div>

      {/* Voice settings */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card rounded-2xl p-5 space-y-5"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center">
            <Globe className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold">Voice Language</p>
            <p className="text-muted-foreground text-xs">
              Language for TTS reminders
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">
            Select Language
          </Label>
          <Select
            value={language}
            onValueChange={(v) => {
              setLanguage(v as Language);
              toast.success(
                `Language set to ${LANG_LABELS_MAP[v as Language]}`,
              );
            }}
          >
            <SelectTrigger
              className="h-12 text-base bg-secondary/50 border-border/50"
              data-ocid="settings.select"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  <span className="flex items-center gap-2">
                    <span>{lang.label}</span>
                    <span className="text-muted-foreground">
                      — {lang.nativeLabel}
                    </span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="outline"
          className="w-full h-12 gap-2 border-primary/30 text-primary hover:bg-primary/10"
          onClick={handleTestVoice}
        >
          <Volume2 className="w-4 h-4" />
          Test Voice
        </Button>
      </motion.div>

      {/* About */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card rounded-2xl p-5 space-y-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center">
            <Info className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold">About</p>
            <p className="text-muted-foreground text-xs">
              Smart Locker Reminder
            </p>
          </div>
        </div>

        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex justify-between">
            <span>Version</span>
            <span className="text-foreground font-medium">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span>Platform</span>
            <span className="text-foreground font-medium">
              Internet Computer
            </span>
          </div>
          <div className="flex justify-between">
            <span>Target User</span>
            <span className="text-foreground font-medium">
              Legender Company
            </span>
          </div>
        </div>
      </motion.div>

      {/* Footer */}
      <div className="text-center text-xs text-muted-foreground pt-2">
        © {new Date().getFullYear()}. Built with love using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          caffeine.ai
        </a>
      </div>
    </div>
  );
}
