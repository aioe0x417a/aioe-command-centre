"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  FileText,
  Search,
  Filter,
  Calendar,
  Download,
  Eye,
  Edit3,
  X,
  Clock,
  Bot,
  Tag,
} from "lucide-react";

type DocType = "report" | "sop" | "audit" | "brief" | "template" | "analysis";

interface Document {
  id: string;
  title: string;
  type: DocType;
  createdAt: string;
  updatedAt: string;
  generatedBy: string;
  size: string;
  preview: string;
  content: string;
}

const documents: Document[] = [
  {
    id: "d1",
    title: "Weekly IT Report — Week 11",
    type: "report",
    createdAt: "15 Mar 2026",
    updatedAt: "15 Mar 2026",
    generatedBy: "claude-opus-4-6",
    size: "4.2 KB",
    preview: "Service uptime: 99.7% across all systems. 20 tickets resolved. Riffa'i onboarding 67% complete.",
    content: "# Weekly IT Report — Week 11\n\n**Period:** 9–15 March 2026\n**Author:** AIOE (auto-generated)\n\n## Executive Summary\n- Service uptime: 99.7% across all systems\n- 20 tickets resolved (8 this week + 12 carried over)\n- Riffa'i onboarding: 67% complete (8/12 checklist items)\n- Invoice pipeline: 14 invoices processed automatically\n- Security: 0 incidents, patching 92% compliant\n\n## Key Metrics\n| Metric | This Week | Last Week | Trend |\n|--------|-----------|-----------|-------|\n| Uptime | 99.7% | 99.5% | ↑ |\n| Tickets Resolved | 20 | 15 | ↑ |\n| Avg Response Time | 1.2h | 1.8h | ↑ |\n| Automation Success | 99.2% | 98.8% | ↑ |\n\n## Highlights\n- Cloudflare Tunnel experienced intermittent degradation (Thursday) — auto-recovered\n- Invoice pipeline hit 100% accuracy for 3rd consecutive week\n- Riffa'i completed L1 support training modules\n\n## Next Week Focus\n- Complete Riffa'i onboarding (remaining 4 items)\n- Firewall rule update for new VPN policy\n- Begin DLP policy configuration in Google Workspace",
  },
  {
    id: "d2",
    title: "Security Vulnerability Report — Entra ID",
    type: "audit",
    createdAt: "14 Mar 2026",
    updatedAt: "14 Mar 2026",
    generatedBy: "claude-opus-4-6",
    size: "6.8 KB",
    preview: "Entra ID conditional access audit. 3 policies active, 2 recommended. Legacy auth protocols detected.",
    content: "# Security Vulnerability Report\n\n**Date:** 14 March 2026\n**Classification:** Internal\n\n## Summary\nAudit of Entra ID conditional access policies and identity security posture.\n\n## Findings\n1. **Legacy Auth Protocols** — RISK: MEDIUM\n   - Basic authentication still enabled for 2 legacy applications\n   - Recommendation: Migrate to modern auth within 30 days\n\n2. **MFA Coverage Gap** — RISK: HIGH\n   - 2/8 users without MFA (Riffa'i pending, Siti suspended)\n   - Recommendation: Enforce MFA for all active accounts\n\n3. **Conditional Access** — STATUS: PARTIAL\n   - 3 policies active, 2 more recommended\n   - Missing: Device compliance requirement, Location-based access",
  },
  {
    id: "d3",
    title: "Daily Briefing — 15 March 2026",
    type: "brief",
    createdAt: "15 Mar 2026",
    updatedAt: "15 Mar 2026",
    generatedBy: "claude-sonnet-4-6",
    size: "2.1 KB",
    preview: "Morning summary: 3 high-priority tickets, 2 automations completed overnight, no security incidents.",
    content: "# Daily Briefing — Saturday, 15 March 2026\n\n## Today's Priority\n- 3 high-priority ClickUp tickets awaiting action\n- FY26/27 budget projections due end of month\n\n## Overnight Activity\n- Invoice pipeline: 3 invoices processed at 02:30\n- KM Gmail sync: 5 emails indexed\n- All heartbeats successful (00:00 – 08:00)\n\n## Calendar\n- No meetings scheduled (Saturday)\n\n## AI News\n- Anthropic released Claude 4.6 model family updates\n- OpenAI announced GPT-5 preview access",
  },
  {
    id: "d4",
    title: "SOP: Google Workspace Account Lifecycle",
    type: "sop",
    createdAt: "10 Mar 2026",
    updatedAt: "12 Mar 2026",
    generatedBy: "claude-sonnet-4-6",
    size: "8.5 KB",
    preview: "Standard operating procedure for joiner/mover/leaver process in Google Workspace.",
    content: "# SOP: Google Workspace Account Lifecycle\n\n## Purpose\nStandardise the creation, modification, and deprovisioning of Google Workspace accounts at MTFA.\n\n## Scope\nAll MTFA staff accounts under mtfa.org domain.\n\n## Joiner Process\n1. Receive approved request from HR\n2. Create account via Google Admin\n3. Assign to correct OU\n4. Apply license (M365 E3 + Google Workspace)\n5. Configure MFA enrollment\n6. Add to relevant groups/DLs\n7. Send welcome email with credentials\n\n## Mover Process\n1. Update OU and group memberships\n2. Review and transfer Drive ownership if needed\n3. Update calendar delegations\n\n## Leaver Process\n1. Suspend account (do not delete immediately)\n2. Transfer Drive files to manager\n3. Remove from all groups\n4. Set auto-reply on email\n5. After 30 days: archive and delete",
  },
  {
    id: "d5",
    title: "IT Board Pack Template — FY26/27",
    type: "template",
    createdAt: "8 Mar 2026",
    updatedAt: "14 Mar 2026",
    generatedBy: "claude-opus-4-6",
    size: "5.3 KB",
    preview: "Monthly IT board pack template with KPIs, project updates, security posture, and budget tracking.",
    content: "# IT Board Pack — [Month] [Year]\n\n## 1. Executive Summary\n[2-3 sentence overview]\n\n## 2. Key Performance Indicators\n| KPI | Target | Actual | Status |\n|-----|--------|--------|--------|\n| Service Uptime | 99.5% | | |\n| Ticket SLA Compliance | 90% | | |\n| Patch Compliance | 95% | | |\n| MFA Coverage | 100% | | |\n\n## 3. Project Updates\n[Active projects with status, timeline, risks]\n\n## 4. Security Posture\n[Score, incidents, compliance checks]\n\n## 5. Budget & Spend\n[Capex/Opex tracking, forecast]\n\n## 6. Team & Capacity\n[Headcount, capacity, key activities]",
  },
  {
    id: "d6",
    title: "SWOT Analysis — MTFA IT Department",
    type: "analysis",
    createdAt: "5 Mar 2026",
    updatedAt: "5 Mar 2026",
    generatedBy: "claude-opus-4-6",
    size: "3.9 KB",
    preview: "Strategic SWOT analysis of IT department capabilities, challenges, and opportunities.",
    content: "# SWOT Analysis — MTFA IT Department\n\n## Strengths\n- Strong automation foundation (n8n, AIOE)\n- Comprehensive tool integration (ClickUp, Google, Entra)\n- Proactive security posture\n\n## Weaknesses\n- Limited headcount vs workload\n- Legacy devices (Win10 EOL)\n- DLP policies not yet configured\n\n## Opportunities\n- FY26/27 budget cycle for strategic investments\n- AI-assisted operations scaling\n- Team expansion (Riffa'i, intern)\n\n## Threats\n- Cybersecurity landscape evolving faster than capacity\n- Staff dependency on key individuals\n- Competing BAU demands vs transformation",
  },
];

const typeConfig: Record<DocType, { color: string; bg: string; label: string }> = {
  report: { color: "text-cyan", bg: "bg-cyan/10", label: "Report" },
  sop: { color: "text-purple", bg: "bg-purple/10", label: "SOP" },
  audit: { color: "text-warning", bg: "bg-warning/10", label: "Audit" },
  brief: { color: "text-success", bg: "bg-success/10", label: "Brief" },
  template: { color: "text-foreground", bg: "bg-surface-hover", label: "Template" },
  analysis: { color: "text-cyan", bg: "bg-cyan/10", label: "Analysis" },
};

export default function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<DocType | "all">("all");
  const [viewingDoc, setViewingDoc] = useState<Document | null>(null);

  const filtered = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.preview.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || doc.type === filterType;
    return matchesSearch && matchesType;
  });

  const typeFilters: (DocType | "all")[] = ["all", "report", "sop", "audit", "brief", "template", "analysis"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Documents</h1>
        <p className="text-sm text-muted">All reports, SOPs, audits, and deliverables generated by AIOE</p>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm focus-within:border-cyan/30">
          <Search className="h-4 w-4 text-muted" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none placeholder:text-muted"
          />
        </div>
        <div className="flex gap-1 overflow-x-auto rounded-lg border border-border bg-surface p-1">
          {typeFilters.map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={cn(
                "whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                filterType === t ? "bg-cyan/10 text-cyan" : "text-muted hover:text-foreground"
              )}
            >
              {t === "all" ? "All" : typeConfig[t].label}
            </button>
          ))}
        </div>
      </div>

      {/* Document grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((doc, i) => {
          const config = typeConfig[doc.type];
          return (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i * 0.04 }}
              className="group rounded-xl border border-border bg-surface p-4 transition-all hover:border-cyan/20"
            >
              <div className="flex items-start justify-between">
                <div className={cn("rounded-lg p-2", config.bg)}>
                  <FileText className={cn("h-4 w-4", config.color)} />
                </div>
                <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", config.bg, config.color)}>
                  {config.label}
                </span>
              </div>
              <h3 className="mt-3 text-sm font-semibold leading-snug">{doc.title}</h3>
              <p className="mt-1.5 text-xs text-muted leading-relaxed line-clamp-2">{doc.preview}</p>
              <div className="mt-3 flex items-center justify-between text-[10px] text-muted">
                <div className="flex items-center gap-1">
                  <Calendar className="h-2.5 w-2.5" />
                  <span>{doc.createdAt}</span>
                </div>
                <span>{doc.size}</span>
              </div>
              <div className="mt-3 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={() => setViewingDoc(doc)}
                  className="flex items-center gap-1 rounded-md bg-cyan/10 px-2 py-1 text-[10px] font-medium text-cyan transition-colors hover:bg-cyan/20"
                >
                  <Eye className="h-3 w-3" /> View
                </button>
                <button className="flex items-center gap-1 rounded-md bg-surface-hover px-2 py-1 text-[10px] font-medium text-muted transition-colors hover:text-foreground">
                  <Edit3 className="h-3 w-3" /> Edit
                </button>
                <button className="flex items-center gap-1 rounded-md bg-surface-hover px-2 py-1 text-[10px] font-medium text-muted transition-colors hover:text-foreground">
                  <Download className="h-3 w-3" /> Export
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Document viewer modal */}
      <AnimatePresence>
        {viewingDoc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            onClick={() => setViewingDoc(null)}
          >
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="relative max-h-[80vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-border bg-surface p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold">{viewingDoc.title}</h2>
                  <div className="mt-1 flex items-center gap-3 text-xs text-muted">
                    <span>{viewingDoc.createdAt}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Bot className="h-3 w-3" /> {viewingDoc.generatedBy}
                    </span>
                    <span>·</span>
                    <span>{viewingDoc.size}</span>
                  </div>
                </div>
                <button
                  onClick={() => setViewingDoc(null)}
                  className="rounded-lg p-2 text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="prose prose-invert prose-sm max-w-none">
                <pre className="whitespace-pre-wrap rounded-lg bg-background p-4 font-mono text-xs leading-relaxed text-foreground">
                  {viewingDoc.content}
                </pre>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
