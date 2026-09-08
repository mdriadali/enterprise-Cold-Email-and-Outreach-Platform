"use client"

import * as React from "react"
import Link from "next/link"
import {
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  Eye,
  KeyRound,
  Loader2,
  PenSquare,
  RotateCw,
  Send,
  Server,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react"
import type { AdminWorkspaceResponse } from "@repo/types"
import { Card } from "@repo/ui/card"
import { useNotification } from "@repo/ui/notification-provider"
import {
  listAdminWorkspaces,
  type AdminWorkspacesPagination,
} from "../../../src/actions/admin/workspaces"

type PlanFilter = "ALL" | "STARTER" | "PROFESSIONAL" | "ULTRA"

function shortId(id: string, prefix: string, length: number) {
  return `${prefix}_${id.slice(0, length)}`
}

function SubscriptionBadge({ subscription }: { subscription: AdminWorkspaceResponse["subscription"] }) {
  if (subscription === "ULTRA") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
        <Sparkles className="w-3.5 h-3.5" />
        ULTRA
      </span>
    )
  }
  if (subscription === "PROFESSIONAL") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
        PROFESSIONAL
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
      <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
      STARTER
    </span>
  )
}

function ResourceChip({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: number }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-gray-100 text-xs text-gray-600"
      title={label}
    >
      <Icon className="w-3.5 h-3.5 text-gray-400" />
      {value}
    </span>
  )
}

function CopyIdButton({ value }: { value: string }) {
  const { notify } = useNotification()
  return (
    <button
      type="button"
      className="p-0.5 rounded text-gray-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
      title="Copy workspace ID"
      onClick={(e) => {
        e.stopPropagation()
        navigator.clipboard
          .writeText(value)
          .then(() => notify({ tone: "success", title: "Copied", message: "Workspace ID copied to clipboard." }))
          .catch(() => notify({ tone: "error", title: "Copy failed", message: "Could not copy the workspace ID." }))
      }}
    >
      <Copy className="w-3.5 h-3.5" />
    </button>
  )
}

export default function AdminWorkspacesPage() {
  const [rows, setRows] = React.useState<AdminWorkspaceResponse[]>([])
  const [pagination, setPagination] = React.useState<AdminWorkspacesPagination>({ page: 1, limit: 10, total: 0, totalPages: 0 })
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [refreshing, setRefreshing] = React.useState(false)
  const [planFilter, setPlanFilter] = React.useState<PlanFilter>("ALL")
  const { notify } = useNotification()

  const fetchWorkspaces = React.useCallback(async (page: number, limit: number) => {
    setLoading(true)
    setError(null)
    try {
      const result = await listAdminWorkspaces({ page, limit })
      if (result.status === "success") {
        setRows(result.data)
        setPagination(result.pagination)
      } else {
        setError(result.message)
        notify({ tone: "error", title: "Failed to load workspaces", message: result.message })
      }
    } catch {
      setError("Could not reach the server.")
      notify({ tone: "error", title: "Failed to load workspaces", message: "Could not reach the server." })
    } finally {
      setLoading(false)
    }
  }, [notify])

  React.useEffect(() => {
    fetchWorkspaces(pagination.page, pagination.limit)
  }, [pagination.page, pagination.limit, fetchWorkspaces])

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      const result = await listAdminWorkspaces({ page: pagination.page, limit: pagination.limit })
      if (result.status === "success") {
        setRows(result.data)
        setPagination(result.pagination)
        notify({
          tone: "info",
          title: "Workspaces refreshed",
          message: `Loaded ${result.data.length} of ${result.pagination.total.toLocaleString("en-US")} workspaces.`,
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

  const filteredRows = planFilter === "ALL" ? rows : rows.filter((row) => row.subscription === planFilter)

  const ultraCount = rows.filter((row) => row.subscription === "ULTRA").length
  const professionalCount = rows.filter((row) => row.subscription === "PROFESSIONAL").length
  const starterCount = rows.filter((row) => row.subscription === "STARTER").length
  const campaignsSum = rows.reduce((sum, row) => sum + row.campaignsCount, 0)
  const generationJobsSum = rows.reduce((sum, row) => sum + row.generationJobsCount, 0)
  const smtpSum = rows.reduce((sum, row) => sum + row.smtpAccountsCount, 0)
  const aiKeysSum = rows.reduce((sum, row) => sum + row.aiApiKeysCount, 0)

  const handleExport = () => {
    try {
      const header = [
        "id",
        "name",
        "ownerId",
        "ownerName",
        "ownerEmail",
        "subscription",
        "membersCount",
        "campaignsCount",
        "generationJobsCount",
        "smtpAccountsCount",
        "aiApiKeysCount",
      ]
      const escape = (value: string | number) => {
        const text = String(value)
        return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
      }
      const lines = [
        header.join(","),
        ...filteredRows.map((row) =>
          [row.id, row.name, row.ownerId, row.ownerName, row.ownerEmail, row.subscription, row.membersCount, row.campaignsCount, row.generationJobsCount, row.smtpAccountsCount, row.aiApiKeysCount].map(escape).join(",")
        ),
      ]
      const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement("a")
      anchor.href = url
      anchor.download = "admin-workspaces.csv"
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      URL.revokeObjectURL(url)
      notify({
        tone: "success",
        title: "Export generated",
        message: `${filteredRows.length} of ${pagination.total.toLocaleString("en-US")} workspaces exported to CSV.`,
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
              Workspace Management
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700">
              {pagination.total.toLocaleString("en-US")} Total
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            System-wide directory of tenant workspaces, subscription tiers, owners, and resource footprints.
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
        </div>
      </div>

      {/* KPI SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-5 flex flex-col justify-between border border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Total Workspaces</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-gray-900">{pagination.total.toLocaleString("en-US")}</div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500">
              <TrendingUp className="w-4 h-4" />
              <span className="font-semibold">All tenants</span>
            </div>
          </div>
        </Card>

        <Card className="p-5 flex flex-col justify-between border border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Ultra Tier Workspaces</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-gray-900">{ultraCount}</div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-purple-600">
              <Users className="w-4 h-4" />
              <span>on this page</span>
            </div>
          </div>
        </Card>

        <Card className="p-5 flex flex-col justify-between border border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Campaigns Footprint</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Send className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-gray-900">{campaignsSum.toLocaleString("en-US")}</div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500">
              <Zap className="w-4 h-4 text-emerald-500" />
              <span>{generationJobsSum.toLocaleString("en-US")} generation jobs</span>
            </div>
          </div>
        </Card>

        <Card className="p-5 flex flex-col justify-between border border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Outbound Engine Resources</span>
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
              <Server className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-gray-900">{smtpSum}</div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500">
              <KeyRound className="w-4 h-4 text-indigo-500" />
              <span>SMTP · {aiKeysSum} AI Keys</span>
            </div>
          </div>
        </Card>
      </div>

      {/* FILTER TOOLBAR & PLAN TAB GROUP */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1">
            <button
              className={`px-3 py-1 rounded text-xs font-semibold transition-all ${planFilter === "ALL" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
              type="button"
              onClick={() => setPlanFilter("ALL")}
            >
              All Plans ({pagination.total.toLocaleString("en-US")})
            </button>
            <button
              className={`px-3 py-1 rounded text-xs font-semibold transition-all ${planFilter === "STARTER" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
              type="button"
              onClick={() => setPlanFilter("STARTER")}
            >
              Starter ({starterCount})
            </button>
            <button
              className={`px-3 py-1 rounded text-xs font-semibold transition-all ${planFilter === "PROFESSIONAL" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
              type="button"
              onClick={() => setPlanFilter("PROFESSIONAL")}
            >
              Professional ({professionalCount})
            </button>
            <button
              className={`px-3 py-1 rounded text-xs font-semibold transition-all ${planFilter === "ULTRA" ? "bg-white text-purple-700 shadow-sm" : "text-purple-600 hover:text-purple-900"}`}
              type="button"
              onClick={() => setPlanFilter("ULTRA")}
            >
              <span className="inline-flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Ultra ({ultraCount})
              </span>
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-gray-400">
            API:{" "}
            <code className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
              GET /admin/workspaces
            </code>
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

      {/* ENTERPRISE WORKSPACES TABLE */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span className="text-sm">Loading workspaces...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-2">
              <TriangleAlert className="w-8 h-8 text-red-400" />
              <span className="text-sm text-red-600 font-medium">{error}</span>
              <button
                className="mt-2 text-xs text-indigo-600 hover:underline font-semibold"
                onClick={() => fetchWorkspaces(pagination.page, pagination.limit)}
              >
                Retry
              </button>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4" scope="col">Workspace</th>
                  <th className="py-3.5 px-4" scope="col">Owner & Governance Contact</th>
                  <th className="py-3.5 px-4" scope="col">Subscription Tier</th>
                  <th className="py-3.5 px-4" scope="col">Resource Footprint</th>
                  <th className="py-3.5 pr-4 pl-2 text-right" scope="col">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredRows.length === 0 ? (
                  <tr>
                    <td className="py-16 text-center text-gray-400" colSpan={5}>
                      No workspaces match the selected plan filter.
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((workspace) => (
                    <tr
                      key={workspace.id}
                      className="hover:bg-gray-50 transition-colors group"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-0.5">
                          <Link
                            href={`/admin/workspaces/${workspace.id}`}
                            className="font-semibold text-gray-900 hover:text-indigo-600 hover:underline transition-colors"
                          >
                            {workspace.name}
                          </Link>
                          <span className="inline-flex items-center gap-1.5">
                            <span className="font-mono text-xs text-gray-400 bg-gray-50 border border-gray-100 rounded px-1.5 py-0.5">
                              {shortId(workspace.id, "ws", 8)}
                            </span>
                            <CopyIdButton value={workspace.id} />
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-medium text-gray-900">{workspace.ownerName}</span>
                          <span className="text-xs text-gray-500">{workspace.ownerEmail}</span>
                          <span className="font-mono text-[11px] text-gray-400">
                            {shortId(workspace.ownerId, "usr", 6)}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <SubscriptionBadge subscription={workspace.subscription} />
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap max-w-sm">
                          <ResourceChip icon={Users} label="Members Count" value={workspace.membersCount} />
                          <ResourceChip icon={Send} label="Campaigns Count" value={workspace.campaignsCount} />
                          <ResourceChip icon={Zap} label="Generation Jobs Count" value={workspace.generationJobsCount} />
                          <ResourceChip icon={Server} label="SMTP Accounts" value={workspace.smtpAccountsCount} />
                          <ResourceChip icon={KeyRound} label="AI API Keys" value={workspace.aiApiKeysCount} />
                        </div>
                      </td>
                      <td className="py-3.5 pr-4 pl-2 text-right">
                        <Link
                          href={`/admin/workspaces/${workspace.id}`}
                          className="inline-flex p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-indigo-600 transition-all"
                          title="Inspect Workspace"
                        >
                          <Eye className="w-5 h-5" />
                        </Link>
                        <Link
                          href={`/admin/workspaces/${workspace.id}`}
                          className="inline-flex p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-indigo-600 transition-all"
                          title="Edit Tenant Quotas"
                        >
                          <PenSquare className="w-5 h-5" />
                        </Link>
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
                <span className="font-semibold text-gray-900">{pagination.total.toLocaleString("en-US")}</span> workspaces
              </span>
              <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
                <label className="text-gray-400" htmlFor="workspacesRowsPerPage">
                  Rows per page:
                </label>
                <select
                  className="bg-white border border-gray-200 rounded px-2 py-1 text-xs text-gray-900 focus:outline-none focus:border-indigo-500"
                  id="workspacesRowsPerPage"
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
              Tenant Resource Isolation (SOC2) Policy Active
            </div>
            <p className="text-xs text-gray-500">
              Each workspace owns an isolated outbound engine sub-cluster. Cross-tenant data leakage is prevented
              at the database and queue boundaries.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}