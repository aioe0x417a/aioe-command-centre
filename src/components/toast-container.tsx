"use client";

import { useToasts } from "@/lib/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { CheckCircle, AlertTriangle, XCircle, Info, X } from "lucide-react";

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const colors = {
  success: "border-success/30 bg-success/10 text-success",
  error: "border-danger/30 bg-danger/10 text-danger",
  warning: "border-warning/30 bg-warning/10 text-warning",
  info: "border-cyan/30 bg-cyan/10 text-cyan",
};

export function ToastContainer() {
  const { toasts, removeToast } = useToasts();

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = icons[toast.type];
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg backdrop-blur-sm",
                colors[toast.type]
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <p className="text-sm font-medium text-foreground">{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className="ml-2 shrink-0 rounded p-0.5 text-muted transition-colors hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
