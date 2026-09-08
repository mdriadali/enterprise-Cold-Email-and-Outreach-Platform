"use client"

import * as React from "react"
import Link from "next/link"
import {
  Activity,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  CircleDashed,
  Copy,
  Download,
  Eye,
  Hourglass,
  Loader2,
  MoreVertical,
  Pause,
  Play,
  RotateCw,
  Send,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  TrendingUp,
  Zap,
} from "lucide-react"
import type { AdminCampaignResponse, CampaignStatus } from "@repo/types"
import { Card } from "@repo/ui/card"
import { Avatar } from "@repo/ui/avatar"
import { useNotification } from "@repo/ui/notification-provider"
import {
  listAdminCampaigns,
  type AdminCampaignsPagination,
} from "../../../src/actions/admin/campaigns"

type StatusFilter = "ALL" | CampaignStatus

function shortId(id: string, prefix: string, length: number) {
  return `${prefix}_${id.slice(0, length)}`
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

const STATUS_META: Record<
  CampaignStatus,
  { label: string; badge: string; dot?: string; pulse?: boolean; icon?: React.ReactNode }
> = {
  RUNNING: {
    label: "RUNNING",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
    pulse: true,
  },
  SCHEDULED: {
    label: "SCHEDULED",
    badge: "bg-purple-50 text-purple-700 border-purple-200",
    dot: "bg-purple-500",
  },
  QUEUED: {
    label: "QUEUED",
    badge: "bg-amber-100 text-amber-900 border-amber-300",
    dot: "bg-amber-500",
  },
  COMPLETED: {
    label: "COMPLETED",
    badge: "bg-emerald-100 text-emerald-800 border-emerald-300",
    icon: <CheckCircle className="w-3 h-3" />,
  },
  PAUSED: {
    label: "PAUSED",
    badge: "bg-amber-50 text-amber-800 border-amber-200",
    icon: <Pause className="w-3 h-3" />,
  },
  DRAFT: {
    label: "DRAFT",
    badge: "bg-gray-100 text-gray-600 border-gray-200",
    icon: <CircleDashed className="w-3 h-3" />,
  },
  FAILED: {
    label: "FAILED",
    badge: "bg-red-50 text-red-700 border-red-300",
    icon: <TriangleAlert className="w-3 h-3" />,
  },
  CANCELLED: {
    label: "CANCELLED",
    badge: "bg-gray-100 text-gray-400 border-gray-200",
    icon: <CircleDashed className="w-3 h-3" />,
  },
}

function StatusBadge({ status }: { status: CampaignStatus }) {
  const meta = STATUS_META[status]
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${meta.badge}`}
    >
      {meta.icon ?? (
        <span className={`w-2 h-2 rounded-full ${meta.dot} ${meta.pulse ? "animate-ping" : ""}`} />
      )}
      {meta.label}
    </span>
  )
}

function CopyIdButton({ value, label }: { value: string; label: string }) {
  const { notify } = useNotification()
  return (
    <button
      type="button"
      className="p-0.5 rounded text-gray-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
      title="Copy campaign ID"
      onClick={(e) => {
        e.stopPropagation()
        navigator.clipboard
          .writeText(value)
          .then(() => notify({ tone: "success", title: "Copied", message: `${label} copied to clipboard.` }))
          .catch(() => notify({ tone: "error", title: "Copy failed", message: "Could not copy the campaign ID." }))
      }}
    >
      <Copy className="w-3.5 h-3.5" />
    </button>
  )
}

const AVATAR_VARIANTS = ["primary", "secondary", "primaryContainer", "surface", "tertiary", "outline", "secondaryFixedDim", "surfaceContainer"] as const

export default function AdminCampaignsPage() {
  const [rows, setRows] = React.useState<AdminCampaignResponse[]>([])
  const [pagination, setPagination] = React.useState<AdminCampaignsPagination>({ page: 1, limit: 10, total: 0, totalPages: 0 })
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [refreshing, setRefreshing] = React.useState(false)
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("ALL")
  const { notify } = useNotification()

  const fetchCampaigns = React.useCallback(async (page: number, limit: number) => {
    setLoading(true)
    setError(null)
    try {
      const result = await listAdminCampaigns({ page, limit })
      if (result.status === "success") {
        setRows(result.data)
        setPagination(result.pagination)
      } else {
        setError(result.message)
        notify({ tone: "error", title: "Failed to load campaigns", message: result.message })
      }
    } catch {
      setError("Could not reach the server.")
      notify({ tone: "error", title: "Failed to load campaigns", message: "Could not reach the server." })
    } finally {
      setLoading(false)
    }
  }, [notify])

  React.useEffect(() => {
    fetchCampaigns(pagination.page, pagination.limit)
  }, [pagination.page, pagination.limit, fetchCampaigns])

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      const result = await listAdminCampaigns({ page: pagination.page, limit: pagination.limit })
      if (result.status === "success") {
        setRows(result.data)
        setPagination(result.pagination)
        notify({
          tone: "info",
          title: "Campaigns refreshed",
          message: `Loaded ${result.data.length} of ${result.pagination.total.toLocaleString("en-US")} campaigns.`,
        })
      } else {
        notify({ tone: "error", title: "Refresh failed", message: result.message })
      }
    } catch {
      notify({ tone: "error", title: "Refresh failed", message: "Could not reach the server." })
    } finally {
      setRefreshing(false)
    }
  }

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return
    setPagination((prev) => ({ ...prev, page: newPage }))
  }

  const handleLimitChange = (newLimit: number) => {
    setPagination((prev) => ({ ...prev, page: 1, limit: newLimit }))
  }

  const handleNotWired = (title: string, action: string) => {
    notify({ tone: "info", title, message: `${action} is not wired to an API endpoint yet.` })
  }

  const filteredRows =
    statusFilter === "ALL" ? rows : rows.filter((row) => row.status === statusFilter)

  const statusCounts = React.useMemo(() => {
    const counts: Record<StatusFilter, number> = {
      ALL: rows.length,
      DRAFT: 0,
      SCHEDULED: 0,
      RUNNING: 0,
      PAUSED: 0,
      QUEUED: 0,
      COMPLETED: 0,
      CANCELLED: 0,
      FAILED: 0,
    }
    rows.forEach((row) => {
      counts[row.status] = (counts[row.status] ?? 0) + 1
    })
    return counts
  }, [rows])

  const runningCount = statusCounts.RUNNING
  const queuedCount = statusCounts.QUEUED
  const completedCount = statusCounts.COMPLETED
  const failedCount = statusCounts.FAILED
  const pausedCount = statusCounts.PAUSED
  const scheduledCount = statusCounts.SCHEDULED
  const draftCount = statusCounts.DRAFT
  const cancelledCount = statusCounts.CANCELLED

  const totalWorkspaces = new Set(rows.map((row) => row.workspaceId)).size

  const pipelineActive = runningCount + queuedCount
  const pipelinePct = pagination.total > 0 ? Math.round((pipelineActive / pagination.total) * 100) : 0
  const queuedPct = pagination.total > 0 ? Math.round((queuedCount / pagination.total) * 100) : 0

  const handleExport = () => {
    try {
      const header = [
        "id",
        "name",
        "status",
        "workspaceId",
        "workspaceName",
        "createdById",
        "createdByName",
        "createdAt",
        "updatedAt",
      ]
      const escape = (value: string | number | Date) => {
        const text = String(value)
        return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
      }
      const lines = [
        header.join(","),
        ...filteredRows.map((row) =>
          [row.id, row.name, row.status, row.workspaceId, row.workspaceName, row.createdById, row.createdByName, row.createdAt.toISOString(), row.updatedAt.toISOString()]
            .map(escape)
            .join(",")
        ),
      ]
      const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement("a")
      anchor.href = url
      anchor.download = "admin-campaigns.csv"
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      URL.revokeObjectURL(url)
      notify({
        tone: "success",
        title: "Export generated",
        message: `${filteredRows.length} campaigns exported to CSV.`,
      })
    } catch {
      notify({ tone: "error", title: "Export failed", message: "Could not generate the CSV file." })
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* PAGE TITLE & HEADER ACTIONS */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Campaign Management
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700">
              {pagination.total.toLocaleString("en-US")} Total
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Global multi-tenant outreach orchestrator. Monitor sequence statuses, delivery workflows, and execution pipelines.
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
            type="button"
            onClick={handleExport}
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
            type="button"
            onClick={() => handleNotWired("Batch controls", "Batch Dispatch Controls")}
          >
            <Activity className="w-4 h-4" />
            <span>Batch Dispatch Controls</span>
          </button>
          <button
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-red-50 border border-red-300 text-red-700 hover:bg-red-100 transition-all shadow-sm"
            type="button"
            onClick={() => handleNotWired("Emergency freeze", "Emergency Freeze All")}
          >
            <Pause className="w-4 h-4" />
            <span>Emergency Freeze All</span>
          </button>
        </div>
      </div>

      {/* KPI SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-5 flex flex-col justify-between border border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Total Campaigns</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Send className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-gray-900">{pagination.total.toLocaleString("en-US")}</div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span className="font-semibold">across {totalWorkspaces} workspaces</span>
            </div>
          </div>
        </Card>

        <Card className="p-5 flex flex-col justify-between border border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Dispatch Pipeline</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <Hourglass className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-gray-900">{pipelineActive}</div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              <span className="font-semibold">{runningCount} running</span>
              <span>·</span>
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>{queuedCount} queued</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2 overflow-hidden flex">
              <div className="bg-indigo-600 h-full" style={{ width: `${pipelinePct}%` }}></div>
              <div className="bg-amber-400 h-full" style={{ width: `${queuedPct}%` }}></div>
            </div>
          </div>
        </Card>

        <Card className="p-5 flex flex-col justify-between border border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Completed Sequences</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-gray-900">{completedCount}</div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500">
              <Zap className="w-4 h-4 text-emerald-500" />
              <span>on this page</span>
            </div>
          </div>
        </Card>

        <Card className="p-5 flex flex-col justify-between border border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Incident & Failed</span>
            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
              <TriangleAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-red-600">{failedCount}</div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500">
              <span className={`w-2 h-2 rounded-full ${failedCount > 0 ? "bg-red-500" : "bg-gray-300"}`}></span>
              <span className="font-semibold">{failedCount > 0 ? "Auto-quarantined" : "No incidents"}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* STATUS FILTER TABS & TOOLBAR */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Status Tabs */}
        <div className="flex items-center border-b border-gray-200 overflow-x-auto px-2 pt-2 bg-gray-50/50">
          <button
            className={`flex items-center gap-2 px-3 py-2.5 border-b-2 font-semibold text-xs whitespace-nowrap transition-colors ${
              statusFilter === "ALL" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300"
            }`}
            type="button"
            onClick={() => setStatusFilter("ALL")}
          >
            <span>All Statuses</span>
            <span className="px-2 py-0.5 text-xs bg-indigo-50 text-indigo-700 rounded-full font-bold">{pagination.total.toLocaleString("en-US")}</span>
          </button>
          <button
            className={`flex items-center gap-2 px-3 py-2.5 border-b-2 font-semibold text-xs whitespace-nowrap transition-colors ${
              statusFilter === "RUNNING" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300"
            }`}
            type="button"
            onClick={() => setStatusFilter("RUNNING")}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Running</span>
            <span className="text-xs text-gray-400 font-medium">{runningCount}</span>
          </button>
          <button
            className={`flex items-center gap-2 px-3 py-2.5 border-b-2 font-semibold text-xs whitespace-nowrap transition-colors ${
              statusFilter === "SCHEDULED" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300"
            }`}
            type="button"
            onClick={() => setStatusFilter("SCHEDULED")}
          >
            <span>Scheduled</span>
            <span className="text-xs text-gray-400 font-medium">{scheduledCount}</span>
          </button>
          <button
            className={`flex items-center gap-2 px-3 py-2.5 border-b-2 font-semibold text-xs whitespace-nowrap transition-colors ${
              statusFilter === "QUEUED" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300"
            }`}
            type="button"
            onClick={() => setStatusFilter("QUEUED")}
          >
            <span>Queued</span>
            <span className="text-xs text-gray-400 font-medium">{queuedCount}</span>
          </button>
          <button
            className={`flex items-center gap-2 px-3 py-2.5 border-b-2 font-semibold text-xs whitespace-nowrap transition-colors ${
              statusFilter === "COMPLETED" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300"
            }`}
            type="button"
            onClick={() => setStatusFilter("COMPLETED")}
          >
            <span>Completed</span>
            <span className="text-xs text-gray-400 font-medium">{completedCount}</span>
          </button>
          <button
            className={`flex items-center gap-2 px-3 py-2.5 border-b-2 font-semibold text-xs whitespace-nowrap transition-colors ${
              statusFilter === "PAUSED" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300"
            }`}
            type="button"
            onClick={() => setStatusFilter("PAUSED")}
          >
            <span>Paused</span>
            <span className="text-xs text-gray-400 font-medium">{pausedCount}</span>
          </button>
          <button
            className={`flex items-center gap-2 px-3 py-2.5 border-b-2 font-semibold text-xs whitespace-nowrap transition-colors ${
              statusFilter === "DRAFT" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300"
            }`}
            type="button"
            onClick={() => setStatusFilter("DRAFT")}
          >
            <span>Draft</span>
            <span className="text-xs text-gray-400 font-medium">{draftCount}</span>
          </button>
          <button
            className={`flex items-center gap-2 px-3 py-2.5 border-b-2 font-semibold text-xs whitespace-nowrap transition-colors ${
              statusFilter === "FAILED" ? "border-red-500 text-red-600" : "border-transparent text-gray-500 hover:text-red-600 hover:border-gray-300"
            }`}
            type="button"
            onClick={() => setStatusFilter("FAILED")}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
            <span>Failed</span>
            <span className="text-xs text-red-600 font-bold bg-red-50 px-1.5 rounded">{failedCount}</span>
          </button>
          <button
            className={`flex items-center gap-2 px-3 py-2.5 border-b-2 font-semibold text-xs whitespace-nowrap transition-colors ${
              statusFilter === "CANCELLED" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300"
            }`}
            type="button"
            onClick={() => setStatusFilter("CANCELLED")}
          >
            <span>Cancelled</span>
            <span className="text-xs text-gray-400 font-medium">{cancelledCount}</span>
          </button>
        </div>

        {/* Toolbar Row: API label, refresh */}
        <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="text-xs text-gray-400">
            API:{" "}
            <code className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
              GET /admin/campaigns?page={pagination.page}&amp;limit={pagination.limit}
            </code>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs text-gray-400">
              Page {pagination.page} of {pagination.totalPages} · {pagination.total.toLocaleString("en-US")} total
            </div>
            <button
              className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-gray-100 rounded-lg transition-all disabled:opacity-50"
              title="Refresh list"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RotateCw className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* ENTERPRISE CAMPAIGNS TABLE */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span className="text-sm">Loading campaigns...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-2">
              <TriangleAlert className="w-8 h-8 text-red-400" />
              <span className="text-sm text-red-600 font-medium">{error}</span>
              <button
                className="mt-2 text-xs text-indigo-600 hover:underline font-semibold"
                onClick={() => fetchCampaigns(pagination.page, pagination.limit)}
              >
                Retry
              </button>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4" scope="col">Campaign & ID</th>
                  <th className="py-3.5 px-4" scope="col">Telemetry Status</th>
                  <th className="py-3.5 px-4" scope="col">Workspace & Tenant</th>
                  <th className="py-3.5 px-4" scope="col">Created By (Operator)</th>
                  <th className="py-3.5 px-4" scope="col">Timestamps</th>
                  <th className="py-3.5 pr-4 pl-2 text-right" scope="col">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredRows.length === 0 ? (
                  <tr>
                    <td className="py-16 text-center text-gray-400" colSpan={6}>
                      <Send className="w-10 h-10 mx-auto mb-2 text-gray-200" />
                      No campaigns match the selected status filter.
                    </td>
                  </tr>
                ) : (
                  filteredRows
                    .slice()
                    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
                    .map((campaign, idx) => (
                      <tr
                        key={campaign.id}
                        className={`hover:bg-gray-50 transition-colors group ${
                          campaign.status === "FAILED" ? "bg-red-50/40" : ""
                        } ${campaign.status === "CANCELLED" ? "opacity-70" : ""}`}
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col gap-0.5">
                            <span className={`font-semibold text-gray-900 flex items-center gap-1.5 ${campaign.status === "CANCELLED" ? "line-through text-gray-400" : ""}`}>
                              {campaign.name}
                              <span className="text-gray-300 group-hover:text-indigo-600">
                                <Sparkles className="w-3 h-3" />
                              </span>
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                              <span className="font-mono text-xs text-gray-400 bg-gray-50 border border-gray-100 rounded px-1.5 py-0.5">
                                {shortId(campaign.id, "cmp", 8)}
                              </span>
                              <CopyIdButton value={campaign.id} label="Campaign ID" />
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <StatusBadge status={campaign.status} />
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-medium text-gray-900">{campaign.workspaceName}</span>
                            <Link
                              href={`/admin/workspaces/${campaign.workspaceId}`}
                              className="font-mono text-xs text-indigo-600 hover:underline flex items-center gap-1"
                            >
                              {shortId(campaign.workspaceId, "ws", 8)}
                            </Link>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <Avatar
                              variant={AVATAR_VARIANTS[idx % AVATAR_VARIANTS.length]}
                              initials={getInitials(campaign.createdByName)}
                              size="sm"
                            />
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-gray-900">{campaign.createdByName}</span>
                              <span className="font-mono text-[11px] text-gray-400">
                                {shortId(campaign.createdById, "usr", 6)}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex flex-col text-xs text-gray-500">
                            <span className="text-gray-900">
                              {campaign.updatedAt.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}{" "}
                              <span className="text-gray-400">({campaign.updatedAt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "UTC" })} UTC)</span>
                            </span>
                            <span className="text-[11px] text-gray-400">Created: {campaign.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                          </div>
                        </td>
                        <td className="py-3.5 pr-4 pl-2 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1 justify-end w-full">
                            <button
                              className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-indigo-600 transition-all"
                              title="Inspect Campaign"
                              onClick={() => handleNotWired("Campaign inspect", `Inspect ${campaign.name}`)}
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                            {campaign.status === "RUNNING" ? (
                              <button
                                className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-amber-600 transition-all"
                                title="Pause Sequence"
                                onClick={() => handleNotWired("Campaign action", `Pause ${campaign.name}`)}
                              >
                                <Pause className="w-5 h-5" />
                              </button>
                            ) : campaign.status === "PAUSED" ? (
                              <button
                                className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-emerald-600 transition-all"
                                title="Resume Sequence"
                                onClick={() => handleNotWired("Campaign action", `Resume ${campaign.name}`)}
                              >
                                <Play className="w-5 h-5" />
                              </button>
                            ) : campaign.status === "FAILED" ? (
                              <button
                                className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-indigo-600 transition-all"
                                title="Force Retry Sequence"
                                onClick={() => handleNotWired("Campaign action", `Retry ${campaign.name}`)}
                              >
                                <RotateCw className="w-5 h-5" />
                              </button>
                            ) : null}
                            <button
                              className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-900 transition-all"
                              title="More Operations"
                              onClick={() => handleNotWired("Campaign operations", `More operations for ${campaign.name}`)}
                            >
                              <MoreVertical className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* PAGINATION CONTROLS */}
        {!loading && !error && (
          <div className="p-4 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-gray-500 text-xs">
              <span>
                Showing <span className="font-semibold text-gray-900">{(pagination.page - 1) * pagination.limit + 1}</span> to{" "}
                <span className="font-semibold text-gray-900">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{" "}
                <span className="font-semibold text-gray-900">{pagination.total.toLocaleString("en-US")}</span> campaigns
              </span>
              <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
                <label className="text-gray-400" htmlFor="campaignsRowsPerPage">
                  Rows per page:
                </label>
                <select
                  className="bg-white border border-gray-200 rounded px-2 py-1 text-xs text-gray-900 focus:outline-none focus:border-indigo-500"
                  id="campaignsRowsPerPage"
                  value={pagination.limit}
                  onChange={(e) => handleLimitChange(Number(e.target.value))}
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 mr-2">Page {pagination.page} of {pagination.totalPages}</span>
              <button
                className="px-2.5 py-1 rounded border border-gray-200 bg-white text-gray-400 cursor-not-allowed text-xs flex items-center gap-1"
                disabled={pagination.page <= 1}
                onClick={() => handlePageChange(pagination.page - 1)}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                let pageNum: number
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1
                } else if (pagination.page <= 3) {
                  pageNum = i + 1
                } else if (pagination.page >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i
                } else {
                  pageNum = pagination.page - 2 + i
                }
                return (
                  <button
                    key={pageNum}
                    className={`w-7 h-7 rounded text-xs flex items-center justify-center transition-colors ${
                      pageNum === pagination.page
                        ? "bg-indigo-600 text-white font-bold shadow-sm"
                        : "hover:bg-gray-100 text-gray-900 font-medium"
                    }`}
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </button>
                )
              })}
              <button
                className="px-2.5 py-1 rounded border border-gray-200 bg-white hover:bg-gray-50 text-gray-900 text-xs flex items-center gap-1 transition-all"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => handlePageChange(pagination.page + 1)}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* TENANT ISOLATION NOTICE */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-gray-900">
              Multi-Tenant Campaign Isolation (SOC2) Policy Active
            </div>
            <p className="text-xs text-gray-500">
              Sequence execution is scoped to owning workspace routing clusters. Cross-tenant delivery is prevented
              at the queue and SMTP boundaries.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
