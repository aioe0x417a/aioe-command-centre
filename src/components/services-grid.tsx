"use client";

import { cn } from "@/lib/utils";
import { useApi } from "@/lib/use-api";
import { motion } from "framer-motion";

interface ApiService {
  name: string;
  slug: string;
  running: boolean;
  pids: number[];
}

export function ServicesGrid() {
  const { data: services } = useApi<ApiService[]>("/api/v1/services", { refreshInterval: 15000 });

  const displayServices = services || [];
  const onlineCount = displayServices.filter((s) => s.running).length;
  const offlineCount = displayServices.filter((s) => !s.running).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="rounded-xl border border-border bg-surface"
    >
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h3 className="text-sm font-semibold tracking-wide">Services</h3>
        <div className="flex items-center gap-1.5 text-xs text-muted">
          <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
          <span>{onlineCount} online</span>
          {offlineCount > 0 && (
            <>
              <span className="text-border">·</span>
              <span>{offlineCount} offline</span>
            </>
          )}
        </div>
      </div>
      <div className="divide-y divide-border">
        {displayServices.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-muted">Loading services...</div>
        ) : (
          displayServices.map((service, i) => (
            <motion.div
              key={service.slug}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
              className="flex items-center justify-between px-5 py-3 transition-colors hover:bg-surface-hover"
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "h-2 w-2 rounded-full",
                    service.running ? "bg-success animate-pulse" : "bg-danger"
                  )}
                />
                <span className="text-sm">{service.name}</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted">
                <span className={cn("font-medium", service.running ? "text-success" : "text-danger")}>
                  {service.running ? "Online" : "Offline"}
                </span>
                {service.pids.length > 0 && (
                  <span className="font-mono text-[10px]">PID {service.pids[0]}</span>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}
