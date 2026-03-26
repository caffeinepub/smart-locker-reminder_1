import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import {
  useAddItem,
  useGetItems,
  useRemoveItem,
  useResetAllChecks,
} from "@/hooks/useQueries";
import { LogIn, Plus, RotateCcw, ShieldCheck, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

export function ChecklistManager() {
  const { identity, login, isLoggingIn } = useInternetIdentity();
  const { data: items = [], isLoading } = useGetItems();
  const addItem = useAddItem();
  const removeItem = useRemoveItem();
  const resetAll = useResetAllChecks();
  const [newText, setNewText] = useState("");

  const sortedItems = [...items].sort(
    (a, b) => Number(a.order) - Number(b.order),
  );

  const handleAdd = async () => {
    const text = newText.trim();
    if (!text) return;
    const maxOrder =
      sortedItems.length > 0
        ? Number(sortedItems[sortedItems.length - 1].order) + 1
        : 0;
    try {
      await addItem.mutateAsync({ text, order: BigInt(maxOrder) });
      setNewText("");
      toast.success(`"${text}" added`);
    } catch {
      toast.error("Failed to add item");
    }
  };

  const handleRemove = async (id: bigint, text: string) => {
    try {
      await removeItem.mutateAsync(id);
      toast.success(`"${text}" removed`);
    } catch {
      toast.error("Failed to remove item");
    }
  };

  const handleReset = async () => {
    try {
      await resetAll.mutateAsync();
      toast.success("All tasks reset for new day");
    } catch {
      toast.error("Failed to reset tasks");
    }
  };

  return (
    <div className="flex flex-col gap-4 px-4 pt-4 pb-28">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="font-display text-2xl font-bold">Task Manager</h1>
          <p className="text-muted-foreground text-sm">
            {identity
              ? `${items.length} items in checklist`
              : "Sign in to manage tasks"}
          </p>
        </div>
        {identity && (
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-1.5 text-warning border-warning/30 hover:bg-warning/10"
            onClick={handleReset}
            disabled={resetAll.isPending}
            data-ocid="checklist.reset_button"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset All
          </Button>
        )}
      </motion.div>

      {!identity ? (
        /* Login prompt */
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-8 flex flex-col items-center gap-5 text-center"
          data-ocid="checklist.login_panel"
        >
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center">
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>
          <div>
            <p className="font-display text-xl font-bold mb-1">
              Sign In Required
            </p>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Sign in to manage your checklist, add essential items, and keep
              your data secure on the blockchain.
            </p>
          </div>
          <Button
            className="h-12 px-8 gap-2 font-semibold text-base"
            onClick={login}
            disabled={isLoggingIn}
            data-ocid="checklist.login_button"
          >
            <LogIn className="w-4 h-4" />
            {isLoggingIn ? "Signing in..." : "Sign In"}
          </Button>
          <p className="text-xs text-muted-foreground">
            Secured by Internet Identity — no password needed.
          </p>
        </motion.div>
      ) : (
        <>
          {/* Add new item */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-2xl p-4"
          >
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Add New Item
            </p>
            <div className="flex gap-2">
              <Input
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                placeholder="e.g. Laptop Charger"
                className="flex-1 h-12 text-base bg-secondary/50 border-border/50 focus:border-primary/60"
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                data-ocid="checklist.input"
              />
              <Button
                className="h-12 w-12 p-0 flex-shrink-0"
                onClick={handleAdd}
                disabled={!newText.trim() || addItem.isPending}
                data-ocid="checklist.add_button"
              >
                <Plus className="w-5 h-5" />
              </Button>
            </div>
          </motion.div>

          {/* Items list */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass-card rounded-2xl p-4"
          >
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              All Tasks
            </p>

            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-14 rounded-xl bg-secondary/50 animate-pulse"
                  />
                ))}
              </div>
            ) : sortedItems.length === 0 ? (
              <div
                className="py-10 text-center"
                data-ocid="checklist.empty_state"
              >
                <p className="text-muted-foreground text-sm">
                  No tasks yet. Add your first essential item above.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <AnimatePresence mode="popLayout">
                  {sortedItems.map((item, index) => (
                    <motion.div
                      key={item.id.toString()}
                      layout
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0, scale: 0.95 }}
                      transition={{ duration: 0.25 }}
                      className="flex items-center gap-3 p-3.5 rounded-xl bg-secondary/30 border border-border/30"
                      data-ocid={`checklist.item.${index + 1}`}
                    >
                      <div
                        className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                          item.isChecked
                            ? "bg-success"
                            : "bg-muted-foreground/40"
                        }`}
                      />
                      <span
                        className={`flex-1 text-base font-medium ${
                          item.isChecked
                            ? "line-through text-muted-foreground"
                            : "text-foreground"
                        }`}
                      >
                        {item.text}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-10 h-10 text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                        onClick={() => handleRemove(item.id, item.text)}
                        disabled={removeItem.isPending}
                        data-ocid={`checklist.delete_button.${index + 1}`}
                        aria-label={`Remove ${item.text}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>

          {/* Info */}
          <p className="text-center text-xs text-muted-foreground px-4">
            Reset All unchecks all tasks for a fresh start each day.
          </p>
        </>
      )}
    </div>
  );
}
