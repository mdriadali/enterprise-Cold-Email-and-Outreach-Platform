"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  Brain,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Contact,
  Database,
  Download,
  FileText,
  Globe,
  KeyRound,
  MailCheck,
  RefreshCw,
  Send,
  Server,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Avatar } from "@repo/ui/avatar";
import { useNotification } from "@repo/ui/notification-provider";
import { cn } from "@repo/ui/utils";
import {
  getAdminStats,
  type AdminStatsData,
} from "../../../src/actions/admin/stats";

const formatCount = (value: number): string => value.toLocaleString("en-US");

const formatCompact = (value: number): string =>
  value >= 1_000_000 ? `${(value / 1_000_000).toFixed(2)}M` : formatCount(value);

const formatBytes = (value: number): string =>
  value >= 1024 ? `${(value / 1024).toFixed(2)} KB` : `${value} B`;

const getInitials = (value: string): string =>
  value
    .split(/[-_]/)
    .map((part) => part.charAt(0))
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase();

interface MetricCellProps {
  icon: typeof Users;
  name: string;
  title: string;
  value: string;
  valueDetail?: string;
  extra?: string;
  foot?: string;
  footIcon?: typeof CheckCircle2;
  outlined?: boolean;
  body?: React.ReactNode;
}

function MetricCell({
  icon: Icon,
  name,
  title,
  value,
  valueDetail,
  extra,
  foot,
  footIcon: FootIcon,
  outlined,
  body,
}: MetricCellProps) {
  return (
    <section
      className={cn(
        "flex flex-col justify-between gap-4 rounded-xl border p-5",
        outlined
          ? "border-[#c3c6d7] bg-[#f3f3fe]"
          : "border-[#c3c6d7] bg-white"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg",
              outlined ? "bg-white" : "bg-[#e7e7f3]"
            )}
          >
            <Icon className="h-[18px] w-[18px] text-[#004ac6]" strokeWidth={2.2} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-medium uppercase tracking-wide text-[#434655]">
              {name}
            </p>
            <p className="truncate text-base font-semibold text-[#191b23]">{title}</p>
          </div>
        </div>
        <span
          className={cn(
            "rounded-full border border-[#c3c6d7] bg-white px-2.5 py-1 text-xs font-semibold text-[#004ac6]",
            outlined ? "bg-[#191b23] border-[#191b23] text-white" : ""
          )}
        >
          {extra ?? "Live"}
        </span>
      </div>

      {body}

      <div>
        <p className="text-[28px] font-bold leading-none tracking-tight text-[#191b23]">
          {value}
        </p>
        {valueDetail ? (
          <p className="mt-1 font-mono text-xs font-medium text-[#737686]">
            {valueDetail}
          </p>
        ) : null}
      </div>

      <div
        className={cn(
          "flex items-center justify-between gap-2 border-t border-[#c3c6d7] pt-3",
          outlined ? "border-[#c3c6d7]" : "border-[#e7e7f3]"
        )}
      >
        <span className="text-xs text-[#434655]">{foot ?? `Total (live)`}</span>
        <span className="flex items-center gap-1.5 text-xs font-medium text-[#006a63]">
          {FootIcon ? <FootIcon className="h-3.5 w-3.5" /> : null}
          {FootIcon ? "Healthy" : "Live"}
        </span>
      </div>
    </section>
  );
}

const DISPATCH_BARS = [
  62, 74, 58, 80, 66, 90, 52, 76, 68, 84, 57, 88, 71, 93, 64, 86,
];

const CLUSTER_NODES = [
  { id: "node-iad-089a", region: "us-east-1", ip: "198.51.100.12", load: 28, cpu: "42%", color: "text-[#006a63]", bar: "bg-[#11b49a]" },
  { id: "node-dub-014f", region: "eu-west-1", ip: "203.0.113.45", load: 19, cpu: "36%", color: "text-[#004ac6]", bar: "bg-[#4565ff]" },
  { id: "node-syd-033b", region: "ap-southeast-1", ip: "192.0.2.78", load: 12, cpu: "21%", color: "text-[#79747e]", bar: "bg-[#b59df3]" },
] as const;

const TELEMETRY_COUNTERS = [
  { name: "Redis Backlog", value: "1.2K", unit: "jobs" },
  { name: "Deliverability", value: "98.6%", unit: "OK" },
  { name: "Active Workers", value: "14", unit: "online" },
] as const;

export default function AdminStatsPage() {
  const { notify } = useNotification();

  const [stats, setStats] = useState<AdminStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [payloadOpen, setPayloadOpen] = useState(true);

  const loadStats = useCallback(
    async (silent: boolean) => {
      if (!silent) setLoading(true);
      setError(false);

      const result = await getAdminStats();
      if (result.status === "success") {
        setStats(result.data);
      } else {
        setError(true);
        notify({
          tone: "error",
          title: "Stats unavailable",
          message: result.message,
        });
      }

      if (!silent) setLoading(false);
    },
    [notify]
  );

  useEffect(() => {
    void loadStats(false);
  }, [loadStats]);

  const jsonPayload = useMemo(
    () => (stats ? JSON.stringify(stats, null, 2) : ""),
    [stats]
  );

  const payloadBytes = useMemo(
    () => new TextEncoder().encode(jsonPayload).length,
    [jsonPayload]
  );

  const payloadRows = useMemo(
    () =>
      stats
        ? (Object.entries(stats) as [string, number][])
        : [],
    [stats]
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadStats(true);
    setRefreshing(false);
    notify({
      tone: "success",
      title: "Fleet stats refreshed",
      message: "Latest aggregate counters pulled from the telemetry hub.",
    });
  };

  const handleExportJson = () => {
    if (!jsonPayload) return;
    const blob = new Blob([jsonPayload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "admin-stats-telemetry.json";
    anchor.click();
    URL.revokeObjectURL(url);
    notify({
      tone: "success",
      title: "Telemetry exported",
      message: "admin-stats-telemetry.json downloaded.",
    });
  };

  const handleSoc2Report = () => {
    notify({
      tone: "info",
      title: "SOC2 metric report",
      message: "The SOC2 metric export is not wired yet.",
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#faf8ff]">
        <div className="flex items-center gap-3 text-[#737686]">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span className="text-sm">Loading platform-wide statistics...</span>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#faf8ff]">
        <div className="max-w-sm rounded-xl border border-[#ffdad6] bg-[#ffdad6] p-6 text-center">
          <Server className="mx-auto h-8 w-8 text-[#93000a]" />
          <h2 className="mt-3 text-base font-semibold text-[#93000a]">
            Could not load platform statistics
          </h2>
          <button
            onClick={() => void loadStats(false)}
            className="mt-4 rounded-lg bg-[#191b23] px-4 py-2 text-sm font-medium text-white"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#faf8ff] p-8">
      <div className="mx-auto max-w-[1440px] space-y-8">
        <nav className="flex flex-wrap items-center justify-between gap-3">
          <ol className="flex flex-wrap items-center gap-2 text-sm text-[#737686]">
            <li>
              <Link
                href="/admin"
                className="font-medium text-[#191b23] hover:opacity-70"
              >
                Admin Console
              </Link>
            </li>
            <li className="flex items-center gap-2">
              <ChevronRight className="h-4 w-4 text-[#9aa0b1]" />
              <span>Overview</span>
            </li>
            <li className="flex items-center gap-2">
              <ChevronRight className="h-4 w-4 text-[#9aa0b1]" />
              <Link
                href="/admin/stats"
                className="font-medium text-[#004ac6] hover:opacity-70"
              >
                Global Telemetry &amp; Fleet Statistics
              </Link>
            </li>
          </ol>

          <div className="flex items-center gap-2 rounded-full border border-[#c3c6d7] bg-white px-3 py-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#11b49a] opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#006a63]" />
            </span>
            <span className="font-mono text-xs text-[#434655]">
              Cluster Telemetry Live: node-iad-089a
            </span>
          </div>
        </nav>

        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#191b23]">
                Platform-Wide Statistics
              </h1>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[#737686]">
                Aggregate resource and telemetry metrics across the entire
                outreach fleet. Dispatches are accelerated through the Redis
                priority pipeline so counters refresh faster than replication
                lag can blur them.
              </p>
            </div>
            <span className="flex items-center gap-1.5 rounded-full border border-[#c3c6d7] bg-[#f3f3fe] px-3 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#b3261e]" />
              <span className="font-mono text-xs text-[#434655]">
                Fleet v4.12.0
              </span>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => void handleRefresh()}
              disabled={refreshing}
              className="flex items-center gap-2 rounded-lg bg-[#004ac6] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#00309b] disabled:opacity-60"
            >
              <RefreshCw
                className={cn("h-4 w-4", refreshing && "animate-spin")}
              />
              {refreshing ? "Refreshing..." : "Refresh Fleet Stats"}
            </button>
            <button
              onClick={handleExportJson}
              className="flex items-center gap-2 rounded-lg bg-[#e7e7f3] px-4 py-2.5 text-sm font-medium text-[#004ac6] transition hover:bg-[#dbe1ff]"
            >
              <FileText className="h-4 w-4" />
              Export Telemetry JSON
            </button>
            <button
              onClick={handleSoc2Report}
              className="flex items-center gap-2 rounded-lg border border-[#c3c6d7] bg-white px-4 py-2.5 text-sm font-medium text-[#434655] transition hover:bg-[#f3f3fe]"
            >
              <Download className="h-4 w-4" />
              Download SOC2 Metric Report
            </button>
          </div>
        </header>

        <section aria-label="Platform-wide KPI metrics" className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <MetricCell
            icon={Users}
            name="User Accounts"
            title="Registered Users"
            value={formatCount(stats.totalUsers)}
            extra={`Admins: ${formatCount(stats.totalAdmins)}`}
            foot="Regular Seats & Root Governance"
          />
          <MetricCell
            icon={Building2}
            name="Multi-Tenant"
            title="Workspaces"
            value={formatCount(stats.totalWorkspaces)}
            foot="Starter · Pro · Ultra Plans"
            body={
              <div className="space-y-1.5">
                <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-[#e7e7f3]">
                  <span className="h-full w-[58%] bg-[#dbe1ff]" />
                  <span className="h-full w-[30%] bg-[#99efe5]" />
                  <span className="h-full w-[12%] bg-[#e9ddff]" />
                </div>
                <div className="flex items-center justify-between font-mono text-[11px] text-[#737686]">
                  <span>Starter 198</span>
                  <span>Pro 102</span>
                  <span>Ultra 42</span>
                </div>
              </div>
            }
          />
          <MetricCell
            icon={MailCheck}
            name="Dispatched Emails"
            title="Emails Sent"
            value={formatCompact(stats.totalEmailsSent)}
            valueDetail={formatCount(stats.totalEmailsSent)}
            foot="Delivered · Opened · Bounced"
            body={
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-[#f3f3fe] px-2 py-1.5">
                  <p className="text-xs font-semibold text-[#004ac6]">98.6%</p>
                  <p className="text-[10px] text-[#737686]">Delivered</p>
                </div>
                <div className="rounded-lg bg-[#f3f3fe] px-2 py-1.5">
                  <p className="text-xs font-semibold text-[#006a63]">44.2%</p>
                  <p className="text-[10px] text-[#737686]">Opened</p>
                </div>
                <div className="rounded-lg bg-[#ffdad6] px-2 py-1.5">
                  <p className="text-xs font-semibold text-[#93000a]">0.8%</p>
                  <p className="text-[10px] text-[#737686]">Bounced</p>
                </div>
              </div>
            }
          />
          <MetricCell
            icon={Send}
            name="Outreach Campaigns"
            title="Campaigns"
            value={formatCount(stats.totalCampaigns)}
            foot="Finished · Queued · Halted"
            body={
              <div className="flex flex-wrap gap-1.5">
                <span className="rounded-md bg-[#e7e7f3] px-2 py-1 font-mono text-[11px] text-[#434655]">
                  Finished 1,180
                </span>
                <span className="rounded-md bg-[#e7e7f3] px-2 py-1 font-mono text-[11px] text-[#434655]">
                  Queued 142
                </span>
                <span className="rounded-md bg-[#ffdad6] px-2 py-1 font-mono text-[11px] text-[#93000a]">
                  Halted 12
                </span>
              </div>
            }
          />
          <MetricCell
            icon={Contact}
            name="Prospects & Leads"
            title="Leads"
            value={formatCompact(stats.totalLeads)}
            valueDetail={formatCount(stats.totalLeads)}
            foot="Enriched Lead Pool"
            body={
              <div className="space-y-1.5">
                <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-[#e7e7f3]">
                  <span className="h-full w-[94.2%] bg-[#4565ff]" />
                </div>
                <div className="flex items-center justify-between font-mono text-[11px] text-[#737686]">
                  <span>94.2% Enriched</span>
                  <span>5.32M</span>
                </div>
              </div>
            }
          />
          <MetricCell
            icon={Brain}
            name="AI Copy Pipeline"
            title="Generation Jobs"
            value={formatCount(stats.totalGenerationJobs)}
            extra="Cluster Active"
            foot="Median Job Latency"
            body={
              <div className="flex items-center justify-between rounded-lg bg-[#f3f3fe] px-3 py-2">
                <span className="text-xs text-[#434655]">Median latency</span>
                <span className="font-mono text-sm font-semibold text-[#004ac6]">
                  1.41s
                </span>
              </div>
            }
          />
          <MetricCell
            icon={Server}
            name="SMTP Infrastructure"
            title="Connected SMTP"
            value={formatCount(stats.totalSmtpAccounts)}
            foot="SPF · DKIM · Warmup Pool"
            body={
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="rounded-lg bg-[#f3f3fe] px-2 py-1.5">
                  <p className="text-xs font-semibold text-[#004ac6]">100%</p>
                  <p className="text-[10px] text-[#737686]">SPF/DKIM Ready</p>
                </div>
                <div className="rounded-lg bg-[#f3f3fe] px-2 py-1.5">
                  <p className="text-xs font-semibold text-[#006a63]">99.1%</p>
                  <p className="text-[10px] text-[#737686]">Warmed Senders</p>
                </div>
              </div>
            }
          />
          <MetricCell
            icon={KeyRound}
            name="LLM Providers"
            title="Active AI API Keys"
            value={formatCount(stats.totalAiApiKeys)}
            extra="Multi-Engine"
            foot="OpenAI · Claude · Groq"
            body={
              <div className="flex flex-wrap gap-1.5">
                <span className="rounded-md bg-[#e9ddff] px-2 py-1 text-[11px] font-medium text-[#632ecd]">
                  OpenAI
                </span>
                <span className="rounded-md bg-[#dbe1ff] px-2 py-1 text-[11px] font-medium text-[#004ac6]">
                  Anthropic Claude
                </span>
                <span className="rounded-md bg-[#99efe5] px-2 py-1 text-[11px] font-medium text-[#006a63]">
                  Groq
                </span>
              </div>
            }
          />
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-xl border border-[#c3c6d7] bg-white p-6 lg:col-span-2">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-[#191b23]">
                  Outbound Dispatch Engine Telemetry
                </h2>
                <p className="mt-0.5 text-sm text-[#737686]">
                  Throughput across the Redis priority queue and the dispatch
                  workers.
                </p>
              </div>
              <span className="flex items-center gap-1.5 rounded-full bg-[#99efe5] px-3 py-1 font-mono text-xs font-semibold text-[#006a63]">
                <Activity className="h-3.5 w-3.5" />
                1,420 emails/min
              </span>
            </div>

            <div className="mt-6 flex h-32 items-end gap-2 sm:gap-3">
              {DISPATCH_BARS.map((height, index) => (
                <div
                  key={index}
                  style={{ height: `${height}%` }}
                  className={cn(
                    "flex-1 rounded-t-md transition-colors",
                    index % 3 === 0
                      ? "bg-[#4565ff]"
                      : index % 3 === 1
                        ? "bg-[#9a9eb3]"
                        : "bg-[#11b49a]"
                  )}
                />
              ))}
            </div>
            <div className="mt-2 flex items-center justify-between font-mono text-[11px] text-[#737686]">
              <span>08:00</span>
              <span>12:00</span>
              <span>16:00</span>
              <span>20:00</span>
              <span>Now</span>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {TELEMETRY_COUNTERS.map((item) => (
                <div
                  key={item.name}
                  className="rounded-lg border border-[#e7e7f3] bg-[#faf8ff] px-4 py-3"
                >
                  <p className="text-xs text-[#737686]">{item.name}</p>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-lg font-bold text-[#191b23]">
                      {item.value}
                    </span>
                    <span className="text-xs text-[#737686]">{item.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-[#c3c6d7] bg-white p-6">
              <div className="flex items-center justify-between gap-2">
                <h2 className="flex items-center gap-2 text-base font-semibold text-[#191b23]">
                  <Globe className="h-4 w-4 text-[#004ac6]" />
                  Cluster Node Health
                </h2>
                <span className="rounded-full bg-[#99efe5] px-2.5 py-1 text-[11px] font-semibold text-[#006a63]">
                  100% Uptime
                </span>
              </div>

              <div className="mt-5 space-y-5">
                {CLUSTER_NODES.map((node) => (
                  <div
                    key={node.id}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar
                        variant="surfaceContainer"
                        initials={getInitials(node.id)}
                        size="md"
                        className="text-[#191b23]"
                      />
                      <div>
                        <p className="font-mono text-sm font-medium text-[#191b23]">
                          {node.id}
                        </p>
                        <p className="text-xs text-[#737686]">
                          {node.region} · {node.ip}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn("font-mono text-xs", node.color)}>
                        {node.cpu}
                      </span>
                      <span className={cn("h-1.5 w-16 rounded-full bg-[#e7e7f3]")}>
                        <span
                          className={cn("block h-full rounded-full", node.bar)}
                          style={{ width: `${node.load}%` }}
                        />
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex items-center justify-between rounded-lg border border-[#e7e7f3] bg-[#faf8ff] px-4 py-3">
                <span className="flex items-center gap-2 text-xs text-[#434655]">
                  <ShieldCheck className="h-4 w-4 text-[#006a63]" />
                  Auto-failover standby armed
                </span>
                <span className="font-mono text-[11px] text-[#737686]">2/5</span>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-[#c3c6d7] bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e7e7f3] px-6 py-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-2 rounded-md border border-[#c3c6d7] bg-[#f3f3fe] px-2.5 py-1 font-mono text-xs font-semibold text-[#004ac6]">
                <Database className="h-3.5 w-3.5" />
                GET /admin/stats
              </span>
              <span className="flex items-center gap-1.5 font-mono text-xs text-[#006a63]">
                <CheckCircle2 className="h-3.5 w-3.5" />
                200 OK
              </span>
              <span className="font-mono text-xs text-[#737686]">
                14.2ms · {payloadRows.length} Attributes
              </span>
            </div>
            <button
              onClick={() => setPayloadOpen((open) => !open)}
              className="flex items-center gap-1.5 rounded-lg border border-[#c3c6d7] bg-white px-3 py-1.5 text-xs font-medium text-[#434655] transition hover:bg-[#f3f3fe]"
            >
              {payloadOpen ? (
                <>
                  Collapse <ChevronUp className="h-3.5 w-3.5" />
                </>
              ) : (
                <>
                  Expand <ChevronDown className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </div>

          <div className="px-6 py-5">
            {payloadOpen ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-[#737686]">
                    Response Payload
                  </span>
                  <span className="font-mono text-[11px] text-[#737686]">
                    Content-Length: {formatBytes(payloadBytes)}
                  </span>
                </div>
                <div className="overflow-x-auto rounded-lg border border-[#e7e7f3] bg-[#faf8ff] p-4">
                  {payloadRows.map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-baseline justify-between gap-4 font-mono text-sm py-1"
                    >
                      <span className="shrink-0 text-[#004ac6]">{`"${key}"`}</span>
                      <span className="text-right text-[#006a63]">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="truncate font-mono text-sm text-[#737686]">
                {jsonPayload}
              </p>
            )}
          </div>
        </section>

        <footer className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#c3c6d7] bg-white px-6 py-4">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-2 text-xs font-semibold text-[#191b23]">
              <ShieldCheck className="h-4 w-4 text-[#006a63]" />
              In-Scope Security Controls Enforced
            </span>
            <span className="font-mono text-[11px] text-[#737686]">
              AuthN: JWT · MFA · AuthZ: RBAC
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px] text-[#737686]">
              Updated 2 minutes ago
            </span>
            <Avatar
              variant="surfaceContainer"
              initials={getInitials("node-iad-089a")}
              size="md"
              className="text-[#191b23]"
            />
          </div>
        </footer>
      </div>
    </div>
  );
}