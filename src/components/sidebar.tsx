"use client";

import { cn } from "@/lib/utils";
import { useIsMobile } from "@/lib/use-mobile";
import {
  LayoutDashboard,
  ScrollText,
  MessageSquare,
  ListTodo,
  StickyNote,
  FileText,
  Server,
  Shield,
  Users,
  Settings,
  Zap,
  Activity,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface NavItem {
  icon: typeof LayoutDashboard;
  label: string;
  href: string;
  badge?: number;
  badgeColor?: string;
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: ScrollText, label: "Activity", href: "/activity" },
  { icon: MessageSquare, label: "Chat", href: "/chat" },
  { icon: ListTodo, label: "Tasks", href: "/tasks", badge: 4, badgeColor: "bg-cyan" },
  { icon: StickyNote, label: "Notes", href: "/notes", badge: 2, badgeColor: "bg-warning" },
  { icon: FileText, label: "Documents", href: "/documents" },
  { icon: Server, label: "Services", href: "/services", badge: 1, badgeColor: "bg-danger" },
  { icon: Activity, label: "Monitoring", href: "/monitoring" },
  { icon: Users, label: "IT Ops", href: "/it-ops" },
  { icon: Shield, label: "Security", href: "/security", badge: 3, badgeColor: "bg-danger" },
  { icon: Zap, label: "Automations", href: "/automations" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const isMobile = useIsMobile();

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Mobile: hamburger button (rendered in top bar area)
  if (isMobile) {
    return (
      <>
        {/* Hamburger button */}
        <button
          onClick={() => setMobileOpen(true)}
          className="fixed left-4 top-4 z-50 rounded-lg border border-border bg-surface p-2 text-muted transition-colors hover:text-foreground md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Mobile overlay */}
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
                onClick={() => setMobileOpen(false)}
              />
              <motion.aside
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="fixed left-0 top-0 z-50 flex h-screen w-[280px] flex-col border-r border-border bg-surface"
              >
                {/* Header */}
                <div className="flex h-16 items-center justify-between border-b border-border px-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan/10">
                      <Zap className="h-4 w-4 text-cyan" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold tracking-wider text-cyan glow-cyan-text">
                        AIOE
                      </span>
                      <span className="text-[10px] tracking-widest text-muted uppercase">
                        Command Centre
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg p-1.5 text-muted hover:text-foreground"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Nav */}
                <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-4">
                  {navItems.map((item) => {
                    const isActive =
                      item.href === "/"
                        ? pathname === "/"
                        : pathname.startsWith(item.href);
                    return (
                      <Link
                        key={item.label}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-150",
                          isActive
                            ? "bg-cyan/10 text-cyan"
                            : "text-muted hover:bg-surface-hover hover:text-foreground"
                        )}
                      >
                        <item.icon className={cn("h-4 w-4", isActive ? "text-cyan" : "text-muted")} />
                        <span className="flex-1">{item.label}</span>
                        {item.badge && item.badge > 0 && (
                          <span className={cn("rounded-full px-1.5 py-0.5 text-[9px] font-bold text-background", item.badgeColor || "bg-cyan")}>
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </nav>
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </>
    );
  }

  // Desktop sidebar
  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="hidden md:flex h-screen flex-col border-r border-border bg-surface"
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-border px-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan/10">
          <Zap className="h-4 w-4 text-cyan" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col overflow-hidden"
            >
              <span className="text-sm font-bold tracking-wider text-cyan glow-cyan-text">
                AIOE
              </span>
              <span className="text-[10px] tracking-widest text-muted uppercase">
                Command Centre
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-4">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-150",
                isActive
                  ? "bg-cyan/10 text-cyan"
                  : "text-muted hover:bg-surface-hover hover:text-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-colors",
                  isActive ? "text-cyan" : "text-muted group-hover:text-foreground"
                )}
              />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="flex-1 overflow-hidden whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {!collapsed && item.badge && item.badge > 0 && (
                <span className={cn("rounded-full px-1.5 py-0.5 text-[9px] font-bold text-background", item.badgeColor || "bg-cyan")}>
                  {item.badge}
                </span>
              )}
              {collapsed && item.badge && item.badge > 0 && (
                <span className={cn("absolute right-1 top-1 h-2 w-2 rounded-full", item.badgeColor || "bg-cyan")} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-border p-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center justify-center rounded-lg py-2 text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>
    </motion.aside>
  );
}
