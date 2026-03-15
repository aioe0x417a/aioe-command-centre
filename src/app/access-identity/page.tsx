"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useApi } from "@/lib/use-api";
import { toast } from "@/lib/use-toast";
import { ListSkeleton } from "@/components/skeleton";
import {
  Users,
  UserPlus,
  Key,
  Laptop,
  Search,
  Filter,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

type Tab = "users" | "access" | "devices";

interface GwsUser {
  email: string;
  name: string;
  suspended: boolean;
  isAdmin: boolean;
  lastLoginTime: string;
  orgUnitPath: string;
  creationTime: string;
}

interface Device {
  id: string;
  name: string;
  user: string;
  user_email: string;
  os: string;
  compliance: string;
  last_sync: string;
  model: string;
  manufacturer: string;
  enrolled: string;
  ownership: string;
}

interface Approval {
  id: string;
  type: string;
  title: string;
  description: string;
  requester: string;
  status: string;
  created_at: string;
  responded_at: string | null;
  response_note: string | null;
}

function formatDate(iso: string) {
  if (!iso) return "Never";
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)} days ago`;
  return d.toLocaleDateString("en-SG", { day: "numeric", month: "short", year: "numeric" });
}

export default function ITOpsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("users");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: gwsData, loading: usersLoading, refresh: refreshUsers } = useApi<{ users?: GwsUser[] } | GwsUser[]>("/api/v1/users/gws", { refreshInterval: 60000 });
  const { data: devicesData, loading: devicesLoading, refresh: refreshDevices } = useApi<{ devices?: Device[] } | Device[]>("/api/v1/devices", { refreshInterval: 60000 });
  const { data: approvalsData, loading: approvalsLoading, refresh: refreshApprovals } = useApi<Approval[]>("/api/v1/approvals", { refreshInterval: 30000 });

  const users: GwsUser[] = Array.isArray(gwsData) ? gwsData : (gwsData as { users?: GwsUser[] })?.users || [];
  const devices: Device[] = Array.isArray(devicesData) ? devicesData : (devicesData as { devices?: Device[] })?.devices || [];
  const approvals: Approval[] = Array.isArray(approvalsData) ? approvalsData : [];

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDevices = devices.filter(
    (d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.user.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingApprovals = approvals.filter((a) => a.status === "pending");

  const tabs = [
    { id: "users" as Tab, label: "User Accounts", icon: Users, count: users.length },
    { id: "access" as Tab, label: "Access Requests", icon: Key, count: pendingApprovals.length },
    { id: "devices" as Tab, label: "Devices", icon: Laptop, count: devices.length },
  ];

  const handleApproval = async (id: string, action: "approve" | "deny") => {
    try {
      const res = await fetch(`/api/proxy?path=${encodeURIComponent(`/api/v1/approvals/${id}/respond`)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        toast(`Request ${action}d`, "success");
        refreshApprovals();
      } else {
        toast(`Failed to ${action}`, "error");
      }
    } catch {
      toast("API error", "error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Access & Identity</h1>
          <p className="text-sm text-muted">User accounts, access management, and device inventory</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { refreshUsers(); refreshDevices(); toast("Refreshing...", "info"); }}
            className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm transition-colors hover:border-cyan/30"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Sync
          </button>
          <button className="flex items-center gap-2 rounded-lg bg-cyan px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-cyan/80">
            <UserPlus className="h-3.5 w-3.5" />
            Onboard User
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border border-border bg-surface p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all",
              activeTab === tab.id ? "bg-cyan/10 text-cyan" : "text-muted hover:text-foreground"
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
            <span className={cn("rounded-full px-1.5 py-0.5 text-[10px]", activeTab === tab.id ? "bg-cyan/20" : "bg-surface-hover")}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm focus-within:border-cyan/30">
        <Search className="h-4 w-4 text-muted" />
        <input
          type="text"
          placeholder={`Search ${activeTab}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-transparent outline-none placeholder:text-muted"
        />
      </div>

      {/* Users tab */}
      {activeTab === "users" && (
        usersLoading ? <ListSkeleton rows={8} /> : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-border bg-surface">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-muted">
                    <th className="px-5 py-3 text-left font-medium">User</th>
                    <th className="px-5 py-3 text-left font-medium">Status</th>
                    <th className="px-5 py-3 text-left font-medium">Admin</th>
                    <th className="px-5 py-3 text-left font-medium">Last Login</th>
                    <th className="px-5 py-3 text-left font-medium">OU</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredUsers.map((user) => (
                    <tr key={user.email} className="transition-colors hover:bg-surface-hover">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple/15 text-xs font-bold text-purple">
                            {user.name[0]}
                          </div>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-xs text-muted">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-medium",
                          user.suspended ? "bg-danger/10 text-danger" : "bg-success/10 text-success"
                        )}>
                          {user.suspended ? "Suspended" : "Active"}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        {user.isAdmin ? <CheckCircle className="h-4 w-4 text-cyan" /> : <span className="text-muted">—</span>}
                      </td>
                      <td className="px-5 py-3 text-xs text-muted">{formatDate(user.lastLoginTime)}</td>
                      <td className="px-5 py-3 text-xs text-muted">{user.orgUnitPath}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t border-border px-5 py-3 text-xs text-muted">
              {users.length} users · {users.filter((u) => !u.suspended).length} active · {users.filter((u) => u.suspended).length} suspended
            </div>
          </motion.div>
        )
      )}

      {/* Access requests tab */}
      {activeTab === "access" && (
        approvalsLoading ? <ListSkeleton rows={4} /> : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            {approvals.length === 0 ? (
              <div className="rounded-xl border border-border bg-surface p-12 text-center">
                <Key className="mx-auto h-8 w-8 text-muted" />
                <p className="mt-3 text-sm text-muted">No access requests in the queue</p>
              </div>
            ) : (
              approvals.map((req) => (
                <div key={req.id} className="flex items-center justify-between rounded-xl border border-border bg-surface px-5 py-4 transition-colors hover:bg-surface-hover">
                  <div className="flex items-center gap-4">
                    <div className={cn("rounded-lg p-2", req.status === "pending" ? "bg-warning/10" : req.status === "approved" ? "bg-success/10" : "bg-danger/10")}>
                      <Key className={cn("h-4 w-4", req.status === "pending" ? "text-warning" : req.status === "approved" ? "text-success" : "text-danger")} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{req.title}</p>
                      <p className="mt-0.5 text-xs text-muted">{req.type} · {req.requester || "Unknown"} · {formatDate(req.created_at)}</p>
                    </div>
                  </div>
                  {req.status === "pending" ? (
                    <div className="flex gap-2">
                      <button onClick={() => handleApproval(req.id, "approve")} className="rounded-lg bg-success/10 px-3 py-1.5 text-xs font-medium text-success hover:bg-success/20">Approve</button>
                      <button onClick={() => handleApproval(req.id, "deny")} className="rounded-lg bg-danger/10 px-3 py-1.5 text-xs font-medium text-danger hover:bg-danger/20">Deny</button>
                    </div>
                  ) : (
                    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium capitalize", req.status === "approved" ? "bg-success/10 text-success" : "bg-danger/10 text-danger")}>{req.status}</span>
                  )}
                </div>
              ))
            )}
          </motion.div>
        )
      )}

      {/* Devices tab */}
      {activeTab === "devices" && (
        devicesLoading ? <ListSkeleton rows={8} /> : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-border bg-surface">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-muted">
                    <th className="px-5 py-3 text-left font-medium">Device</th>
                    <th className="px-5 py-3 text-left font-medium">User</th>
                    <th className="px-5 py-3 text-left font-medium">OS</th>
                    <th className="px-5 py-3 text-left font-medium">Compliance</th>
                    <th className="px-5 py-3 text-left font-medium">Last Sync</th>
                    <th className="px-5 py-3 text-left font-medium">Ownership</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredDevices.map((device) => (
                    <tr key={device.id} className="transition-colors hover:bg-surface-hover">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <Laptop className="h-4 w-4 text-muted" />
                          <div>
                            <p className="font-mono text-xs">{device.name}</p>
                            <p className="text-[10px] text-muted">{device.manufacturer} {device.model}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-xs">{device.user}</td>
                      <td className="px-5 py-3 text-xs text-muted">{device.os}</td>
                      <td className="px-5 py-3">
                        <span className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-medium capitalize",
                          device.compliance === "compliant" ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
                        )}>
                          {device.compliance}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs text-muted">{formatDate(device.last_sync)}</td>
                      <td className="px-5 py-3">
                        <span className="rounded bg-surface-hover px-1.5 py-0.5 text-[10px] capitalize text-muted">{device.ownership}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t border-border px-5 py-3 text-xs text-muted">
              {devices.length} devices · {devices.filter((d) => d.compliance === "compliant").length} compliant · {devices.filter((d) => d.compliance !== "compliant").length} non-compliant
            </div>
          </motion.div>
        )
      )}
    </div>
  );
}
