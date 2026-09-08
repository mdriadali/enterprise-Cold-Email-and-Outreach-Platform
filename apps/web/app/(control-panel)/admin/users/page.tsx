"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Download,
  Filter,
  UserPlus,
  Users,
  BadgeCheck,
  ShieldUser,
  Coins,
  TrendingUp,
  Layers,
  CheckCircle,
  TriangleAlert,
  Edit,
  Eye,
  MoreHorizontal,
  RotateCw,
  ShieldPlus,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react"
import { Badge } from "@repo/ui/badge"
import { Button } from "@repo/ui/button"
import { Card } from "@repo/ui/card"
import { Checkbox } from "@repo/ui/checkbox"
import { Avatar } from "@repo/ui/avatar"
import { useNotification } from "@repo/ui/notification-provider"
import { listAdminUsers, type AdminUserResponse, type AdminUsersPagination } from "../../../src/actions/admin/users"

const AVATAR_VARIANTS = ["primary", "secondary", "primaryContainer", "surface", "tertiary", "outline", "secondaryFixedDim", "surfaceContainer"] as const

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
}

export default function AdminUsersPage() {
  const router = useRouter()
  const [selectAll, setSelectAll] = React.useState(false)
  const [selectedRows, setSelectedRows] = React.useState<Record<string, boolean>>({})
  const [refreshing, setRefreshing] = React.useState(false)
  const [users, setUsers] = React.useState<AdminUserResponse[]>([])
  const [pagination, setPagination] = React.useState<AdminUsersPagination>({ page: 1, limit: 10, total: 0, totalPages: 0 })
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const { notify } = useNotification()

  const fetchUsers = React.useCallback(async (page: number, limit: number) => {
    setLoading(true)
    setError(null)
    try {
      const result = await listAdminUsers({ page, limit })
      if (result.status === "success") {
        setUsers(result.data)
        setPagination(result.pagination)
      } else {
        setError(result.message)
        notify({ tone: "error", title: "Failed to load users", message: result.message })
      }
    } catch {
      setError("Could not reach the server.")
      notify({ tone: "error", title: "Failed to load users", message: "Could not reach the server." })
    } finally {
      setLoading(false)
    }
  }, [notify])

  React.useEffect(() => {
    fetchUsers(pagination.page, pagination.limit)
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      const result = await listAdminUsers({ page: pagination.page, limit: pagination.limit })
      if (result.status === "success") {
        setUsers(result.data)
        setPagination(result.pagination)
        notify({
          tone: "info",
          title: "Users refreshed",
          message: `Loaded ${result.data.length} of ${result.pagination.total.toLocaleString("en-US")} users.`,
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
    setSelectAll(false)
    setSelectedRows({})
    fetchUsers(newPage, pagination.limit)
  }

  const handleLimitChange = (newLimit: number) => {
    setSelectAll(false)
    setSelectedRows({})
    fetchUsers(1, newLimit)
  }

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectAll(e.target.checked)
    const newSelected: Record<string, boolean> = {}
    users.forEach((u) => (newSelected[u.id] = e.target.checked))
    setSelectedRows(newSelected)
  }

  const handleSelectRow = (id: string, checked: boolean) => {
    setSelectedRows((prev) => ({ ...prev, [id]: checked }))
    const allChecked = users.every((u) => checked && selectedRows[u.id])
    setSelectAll(allChecked)
  }

  return (
    <div className="p-6 space-y-6">
      {/* PAGE TITLE & HEADER ACTIONS */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              User Management
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700">
              {pagination.total.toLocaleString("en-US")} Total
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            System-wide directory of registered accounts, roles, verification status, and workspace allotments.
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            <span>Filter Roles</span>
          </Button>
          <Button variant="default" className="flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            <span>+ Invite User / Create Admin</span>
          </Button>
        </div>
      </div>

      {/* KPI SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-5 flex flex-col justify-between border border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Total Users</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-gray-900">{pagination.total.toLocaleString("en-US")}</div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500">
              <TrendingUp className="w-4 h-4" />
              <span className="font-semibold">All registered</span>
            </div>
          </div>
        </Card>

        <Card className="p-5 flex flex-col justify-between border border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Verified Accounts</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <BadgeCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-gray-900">
              {users.filter((u) => u.emailVerifiedAt !== null).length}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="font-semibold text-emerald-600">on this page</span>
              <span>verified</span>
            </div>
          </div>
        </Card>

        <Card className="p-5 flex flex-col justify-between border border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">System Administrators</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
              <ShieldUser className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-gray-900">
              {users.filter((u) => u.role === "ADMIN").length}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-purple-600">
              <Layers className="w-4 h-4" />
              <span>on this page</span>
            </div>
          </div>
        </Card>

        <Card className="p-5 flex flex-col justify-between border border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Free Workspaces Left</span>
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-gray-900">
              {users.reduce((sum, u) => sum + u.remainingFreeWorkspaces, 0)}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500">
              <Layers className="w-4 h-4 text-indigo-500" />
              <span>across current page</span>
            </div>
          </div>
        </Card>
      </div>

      {/* FILTER TOOLBAR & TAB FILTER GROUP */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1">
            <button className="px-3 py-1 rounded text-xs font-semibold bg-white text-gray-900 shadow-sm">
              All Roles ({pagination.total.toLocaleString("en-US")})
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-gray-400">
            API:{" "}
            <code className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
              GET /admin/users
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

      {/* DENSE ENTERPRISE USERS TABLE */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span className="text-sm">Loading users...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-2">
              <TriangleAlert className="w-8 h-8 text-red-400" />
              <span className="text-sm text-red-600 font-medium">{error}</span>
              <button
                className="mt-2 text-xs text-indigo-600 hover:underline font-semibold"
                onClick={() => fetchUsers(pagination.page, pagination.limit)}
              >
                Retry
              </button>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider">
                  <th className="py-3.5 pl-4 pr-2 w-10" scope="col">
                    <Checkbox
                      checked={selectAll}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className="py-3.5 px-4" scope="col">User</th>
                  <th className="py-3.5 px-4" scope="col">Email & Verification</th>
                  <th className="py-3.5 px-4" scope="col">System Role</th>
                  <th className="py-3.5 px-4" scope="col">Remaining Free Workspaces</th>
                  <th className="py-3.5 px-4" scope="col">Registered</th>
                  <th className="py-3.5 pr-4 pl-2 text-right" scope="col">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {users.map((user, idx) => (
                  <tr
                    key={user.id}
                    className={`hover:bg-gray-50 transition-colors group cursor-pointer ${
                      user.emailVerifiedAt === null ? "bg-red-50/50" : ""
                    }`}
                    onClick={() => router.push(`/admin/users/${user.id}`)}
                  >
                    <td className="py-3.5 pl-4 pr-2" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={!!selectedRows[user.id]}
                        onChange={(e) => handleSelectRow(user.id, e.target.checked)}
                      />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar
                          variant={AVATAR_VARIANTS[idx % AVATAR_VARIANTS.length]}
                          initials={getInitials(user.name)}
                          size="md"
                        />
                        <div>
                          <div className="font-semibold text-gray-900 flex items-center gap-1.5">
                            {user.name}
                          </div>
                          <div className="font-mono text-xs text-gray-400">{user.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-gray-900">{user.email}</div>
                      {user.emailVerifiedAt ? (
                        <div className="inline-flex items-center gap-1 text-[11px] text-emerald-600 mt-0.5">
                          <CheckCircle className="w-3 h-3" fill="currentColor" />
                          <span>
                            Verified {user.emailVerifiedAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1 text-[11px] text-red-600 font-medium mt-0.5">
                          <TriangleAlert className="w-3 h-3" />
                          <span>Unverified (Pending Verification)</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={user.role === "ADMIN" ? "tertiary" : "surface"} className="flex items-center gap-1.5 px-2.5 py-1 font-semibold">
                        {user.role === "ADMIN" ? (
                          <ShieldUser className="w-3 h-3" />
                        ) : (
                          <Users className="w-3 h-3" />
                        )}
                        {user.role}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4">
                      {user.remainingFreeWorkspaces > 0 ? (
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          <span className="font-mono font-bold">{user.remainingFreeWorkspaces}</span>
                          <span>available</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-500">
                          <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                          <span className="font-mono font-bold">0</span>
                          <span className="text-gray-400 text-[11px]">(Used limit)</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-gray-500 font-medium">
                      {user.emailVerifiedAt
                        ? user.emailVerifiedAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                        : "—"}
                    </td>
                    <td className="py-3.5 pr-4 pl-2 text-right">
                      <div className="inline-flex items-center gap-1 justify-end w-full">
                        {user.emailVerifiedAt === null ? (
                          <button className="p-1 rounded hover:bg-gray-100 text-indigo-600 text-xs font-semibold px-2 py-1 bg-gray-50 transition-all" onClick={(e) => e.stopPropagation()}>
                            Resend
                          </button>
                        ) : (
                          <>
                            <button
                              className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-indigo-600 transition-all"
                              title="Inspect User"
                              onClick={(e) => { e.stopPropagation(); router.push(`/admin/users/${user.id}`) }}
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                          <button className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-indigo-600 transition-all" title="Edit Role" onClick={(e) => e.stopPropagation()}>
                              <Edit className="w-5 h-5" />
                            </button>
                          </>
                        )}
                        <button className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-red-600 transition-all" title="More options" onClick={(e) => e.stopPropagation()}>
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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
                <span className="font-semibold text-gray-900">{pagination.total.toLocaleString("en-US")}</span> users
              </span>
              <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
                <label className="text-gray-400" htmlFor="rowsPerPage">
                  Rows per page:
                </label>
                <select
                  className="bg-white border border-gray-200 rounded px-2 py-1 text-xs text-gray-900 focus:outline-none focus:border-indigo-500"
                  id="rowsPerPage"
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

      {/* ENTERPRISE AUDIT & QUICK ACTION DRAWER NOTIFICATION */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
            <ShieldPlus className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-gray-900">
              Role-Based Access Control (RBAC) Policy Active
            </div>
            <p className="text-xs text-gray-500">
              Promoting users to ADMIN requires hardware MFA validation and is logged to irreversible SOC2 compliance records.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 self-end md:self-center">
          <button className="text-sm font-semibold text-indigo-600 hover:underline flex items-center gap-1">
            View Security Logs
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
