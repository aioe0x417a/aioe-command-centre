"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Users,
  UserPlus,
  UserMinus,
  Shield,
  Key,
  Mail,
  Building2,
  Laptop,
  Search,
  Filter,
  ChevronRight,
  CheckCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";

type Tab = "users" | "access" | "devices";

interface UserAccount {
  name: string;
  email: string;
  department: string;
  status: "active" | "suspended" | "pending";
  lastLogin: string;
  mfaEnabled: boolean;
  licenses: string[];
}

const users: UserAccount[] = [
  { name: "Azzay (Azhar)", email: "azhar@mtfa.org", department: "IT", status: "active", lastLogin: "Just now", mfaEnabled: true, licenses: ["M365 E3", "Google Workspace"] },
  { name: "Masswera", email: "masswera@mtfa.org", department: "IT", status: "active", lastLogin: "2 hours ago", mfaEnabled: true, licenses: ["M365 E3", "Google Workspace"] },
  { name: "Nazmi", email: "nazmi@mtfa.org", department: "IT", status: "active", lastLogin: "1 hour ago", mfaEnabled: true, licenses: ["M365 E3", "Google Workspace"] },
  { name: "Riffa'i", email: "riffai@mtfa.org", department: "IT", status: "pending", lastLogin: "Never", mfaEnabled: false, licenses: ["M365 E3"] },
  { name: "Hakim", email: "hakim@mtfa.org", department: "Finance", status: "active", lastLogin: "30 min ago", mfaEnabled: true, licenses: ["M365 E3", "Google Workspace"] },
  { name: "Nurul", email: "nurul@mtfa.org", department: "HR", status: "active", lastLogin: "4 hours ago", mfaEnabled: true, licenses: ["M365 E3", "Google Workspace"] },
  { name: "Ahmad", email: "ahmad@mtfa.org", department: "Social Services", status: "active", lastLogin: "Yesterday", mfaEnabled: false, licenses: ["M365 E3"] },
  { name: "Siti", email: "siti@mtfa.org", department: "Education", status: "suspended", lastLogin: "2 weeks ago", mfaEnabled: false, licenses: ["M365 E3"] },
];

interface AccessRequest {
  id: string;
  requester: string;
  type: string;
  resource: string;
  status: "pending" | "approved" | "denied";
  date: string;
}

const accessRequests: AccessRequest[] = [
  { id: "AR-001", requester: "Nazmi", type: "Shared Drive", resource: "IT Projects Folder", status: "pending", date: "Today" },
  { id: "AR-002", requester: "Hakim", type: "Application", resource: "ClickUp Workspace", status: "pending", date: "Today" },
  { id: "AR-003", requester: "Masswera", type: "Admin Access", resource: "Entra ID — Group Management", status: "approved", date: "Yesterday" },
  { id: "AR-004", requester: "Nurul", type: "Distribution List", resource: "hr-team@mtfa.org", status: "approved", date: "2 days ago" },
  { id: "AR-005", requester: "Ahmad", type: "VPN", resource: "Remote Access VPN", status: "denied", date: "3 days ago" },
];

interface Device {
  name: string;
  type: string;
  user: string;
  os: string;
  compliance: "compliant" | "non-compliant" | "unknown";
  lastSeen: string;
  encrypted: boolean;
}

const devices: Device[] = [
  { name: "AZZAY-LAPTOP", type: "Laptop", user: "Azzay", os: "Windows 11 Pro", compliance: "compliant", lastSeen: "Online", encrypted: true },
  { name: "MAS-LAPTOP-01", type: "Laptop", user: "Masswera", os: "Windows 11 Pro", compliance: "compliant", lastSeen: "Online", encrypted: true },
  { name: "NAZ-LAPTOP-01", type: "Laptop", user: "Nazmi", os: "Windows 11 Pro", compliance: "compliant", lastSeen: "2 hours ago", encrypted: true },
  { name: "FIN-PC-01", type: "Desktop", user: "Hakim", os: "Windows 11 Pro", compliance: "compliant", lastSeen: "Online", encrypted: true },
  { name: "HR-PC-01", type: "Desktop", user: "Nurul", os: "Windows 10 Pro", compliance: "non-compliant", lastSeen: "4 hours ago", encrypted: false },
  { name: "SS-PC-02", type: "Desktop", user: "Ahmad", os: "Windows 10 Pro", compliance: "non-compliant", lastSeen: "Yesterday", encrypted: false },
  { name: "EDU-PC-01", type: "Desktop", user: "Siti", os: "Windows 10 Pro", compliance: "unknown", lastSeen: "2 weeks ago", encrypted: false },
];

const statusColors = {
  active: "bg-success/10 text-success",
  suspended: "bg-danger/10 text-danger",
  pending: "bg-warning/10 text-warning",
};

export default function ITOpsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("users");
  const [searchQuery, setSearchQuery] = useState("");

  const tabs = [
    { id: "users" as Tab, label: "User Accounts", icon: Users, count: users.length },
    { id: "access" as Tab, label: "Access Requests", icon: Key, count: accessRequests.filter((r) => r.status === "pending").length },
    { id: "devices" as Tab, label: "Devices", icon: Laptop, count: devices.length },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">IT Operations</h1>
          <p className="text-sm text-muted">User accounts, access management, and device inventory</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-cyan px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-cyan/80">
          <UserPlus className="h-3.5 w-3.5" />
          Onboard User
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border border-border bg-surface p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all",
              activeTab === tab.id
                ? "bg-cyan/10 text-cyan"
                : "text-muted hover:text-foreground"
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[10px]",
                activeTab === tab.id ? "bg-cyan/20" : "bg-surface-hover"
              )}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm focus-within:border-cyan/30">
          <Search className="h-4 w-4 text-muted" />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none placeholder:text-muted"
          />
        </div>
        <button className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-muted transition-colors hover:text-foreground">
          <Filter className="h-4 w-4" />
          Filter
        </button>
      </div>

      {/* Tab content */}
      {activeTab === "users" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl border border-border bg-surface"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted">
                  <th className="px-5 py-3 text-left font-medium">User</th>
                  <th className="px-5 py-3 text-left font-medium">Department</th>
                  <th className="px-5 py-3 text-left font-medium">Status</th>
                  <th className="px-5 py-3 text-left font-medium">MFA</th>
                  <th className="px-5 py-3 text-left font-medium">Last Login</th>
                  <th className="px-5 py-3 text-left font-medium">Licenses</th>
                  <th className="px-5 py-3 text-right font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users
                  .filter(
                    (u) =>
                      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      u.email.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((user) => (
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
                      <td className="px-5 py-3 text-muted">{user.department}</td>
                      <td className="px-5 py-3">
                        <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium capitalize", statusColors[user.status])}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        {user.mfaEnabled ? (
                          <CheckCircle className="h-4 w-4 text-success" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-warning" />
                        )}
                      </td>
                      <td className="px-5 py-3 text-xs text-muted">{user.lastLogin}</td>
                      <td className="px-5 py-3">
                        <div className="flex gap-1">
                          {user.licenses.map((l) => (
                            <span key={l} className="rounded bg-surface-hover px-1.5 py-0.5 text-[10px] text-muted">
                              {l}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <ChevronRight className="h-4 w-4 text-muted" />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {activeTab === "access" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          {accessRequests.map((req) => (
            <div
              key={req.id}
              className="flex items-center justify-between rounded-xl border border-border bg-surface px-5 py-4 transition-colors hover:bg-surface-hover"
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "rounded-lg p-2",
                  req.status === "pending" ? "bg-warning/10" : req.status === "approved" ? "bg-success/10" : "bg-danger/10"
                )}>
                  <Key className={cn(
                    "h-4 w-4",
                    req.status === "pending" ? "text-warning" : req.status === "approved" ? "text-success" : "text-danger"
                  )} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{req.requester}</p>
                    <span className="text-xs text-muted">→</span>
                    <p className="text-sm">{req.resource}</p>
                  </div>
                  <p className="mt-0.5 text-xs text-muted">{req.type} · {req.id} · {req.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {req.status === "pending" ? (
                  <>
                    <button className="rounded-lg bg-success/10 px-3 py-1.5 text-xs font-medium text-success transition-colors hover:bg-success/20">
                      Approve
                    </button>
                    <button className="rounded-lg bg-danger/10 px-3 py-1.5 text-xs font-medium text-danger transition-colors hover:bg-danger/20">
                      Deny
                    </button>
                  </>
                ) : (
                  <span className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-medium capitalize",
                    req.status === "approved" ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
                  )}>
                    {req.status}
                  </span>
                )}
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {activeTab === "devices" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-border bg-surface">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted">
                  <th className="px-5 py-3 text-left font-medium">Device</th>
                  <th className="px-5 py-3 text-left font-medium">User</th>
                  <th className="px-5 py-3 text-left font-medium">OS</th>
                  <th className="px-5 py-3 text-left font-medium">Compliance</th>
                  <th className="px-5 py-3 text-left font-medium">Encrypted</th>
                  <th className="px-5 py-3 text-left font-medium">Last Seen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {devices.map((device) => (
                  <tr key={device.name} className="transition-colors hover:bg-surface-hover">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <Laptop className="h-4 w-4 text-muted" />
                        <span className="font-mono text-xs">{device.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">{device.user}</td>
                    <td className="px-5 py-3 text-xs text-muted">{device.os}</td>
                    <td className="px-5 py-3">
                      <span className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-medium capitalize",
                        device.compliance === "compliant" ? "bg-success/10 text-success" :
                          device.compliance === "non-compliant" ? "bg-danger/10 text-danger" :
                            "bg-warning/10 text-warning"
                      )}>
                        {device.compliance}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {device.encrypted ? (
                        <CheckCircle className="h-4 w-4 text-success" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-danger" />
                      )}
                    </td>
                    <td className="px-5 py-3 text-xs text-muted">{device.lastSeen}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}
