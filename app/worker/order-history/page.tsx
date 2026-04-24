"use client"

import { Suspense, useState, useCallback } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { ArrowRight, Search, ShoppingBag, Calendar, User } from "lucide-react"

// ── types ─────────────────────────────────────────────────────────────────────

type Period = "week" | "month" | "year"

interface Employee {
  id: string
  name: string
  department: string | null
}

interface OrderItem {
  id: string
  name: string
  quantity: number
}

interface Order {
  id: string
  status: string
  createdAt: string
  notes?: string
  items: OrderItem[]
}

// ── helpers ───────────────────────────────────────────────────────────────────

const PERIOD_LABELS: Record<Period, { ar: string; days: number }> = {
  week:  { ar: "الأسبوع",  days: 7   },
  month: { ar: "الشهر",   days: 30  },
  year:  { ar: "السنة",   days: 365 },
}

function buildDateRange(period: Period) {
  const to   = new Date()
  const from = new Date()
  from.setDate(from.getDate() - PERIOD_LABELS[period].days)
  return { from: from.toISOString(), to: to.toISOString() }
}

const STATUS_MAP: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending:   { label: "قيد الانتظار",  variant: "secondary"   },
  accepted:  { label: "مقبول",         variant: "default"     },
  preparing: { label: "قيد التحضير",   variant: "default"     },
  ready:     { label: "جاهز",          variant: "default"     },
  delivered: { label: "تم التسليم",    variant: "outline"     },
  cancelled: { label: "ملغي",          variant: "destructive" },
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("ar-EG", {
    day:    "numeric",
    month:  "long",
    hour:   "2-digit",
    minute: "2-digit",
  }).format(new Date(iso))
}

// ── main content ──────────────────────────────────────────────────────────────

function WorkerOrderHistoryContent() {
  const searchParams = useSearchParams()
  const workerId     = searchParams.get("workerId") ?? ""

  const [searchId, setSearchId]       = useState("")
  const [employee, setEmployee]       = useState<Employee | null>(null)
  const [employeeError, setEmployeeError] = useState("")
  const [searchLoading, setSearchLoading] = useState(false)

  const [period, setPeriod]   = useState<Period>("month")
  const [orders, setOrders]   = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [ordersError, setOrdersError]     = useState("")
  const [searched, setSearched] = useState(false)

  // Look up employee
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    const id = searchId.trim().toUpperCase()
    if (!id) return

    setEmployeeError("")
    setEmployee(null)
    setOrders([])
    setSearched(false)
    setSearchLoading(true)

    try {
      const res = await fetch(`/api/employees/${encodeURIComponent(id)}`)
      if (res.status === 404) {
        setEmployeeError("رقم الموظف غير موجود")
        return
      }
      if (!res.ok) {
        setEmployeeError("حدث خطأ، حاول مرة أخرى")
        return
      }
      const data = await res.json()
      setEmployee(data.employee)
      await loadOrders(data.employee.id, period)
      setSearched(true)
    } catch {
      setEmployeeError("حدث خطأ في الاتصال")
    } finally {
      setSearchLoading(false)
    }
  }

  // Load orders for the found employee
  const loadOrders = useCallback(async (empId: string, p: Period) => {
    setOrdersLoading(true)
    setOrdersError("")
    try {
      const { from, to } = buildDateRange(p)
      const url = `/api/orders?employeeId=${encodeURIComponent(empId)}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
      const res  = await fetch(url)
      const data = await res.json()
      setOrders(data.orders ?? [])
    } catch {
      setOrdersError("تعذّر تحميل الطلبات")
    } finally {
      setOrdersLoading(false)
    }
  }, [])

  const handlePeriodChange = async (p: Period) => {
    setPeriod(p)
    if (employee) await loadOrders(employee.id, p)
  }

  return (
    <div className="min-h-screen flex flex-col bg-background" dir="rtl">

      {/* Header */}
      <header className="sticky top-0 z-40 bg-primary text-primary-foreground shadow-md">
        <div className="flex items-center justify-between p-4">
          <Link
            href={`/worker/dashboard?workerId=${encodeURIComponent(workerId)}`}
            className="flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
            <span className="text-sm">لوحة التحكم</span>
          </Link>
          <h1 className="font-bold text-lg">سجل طلبات الموظفين</h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="flex-1 flex flex-col p-4 gap-4">

        {/* Search form */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="ابحث برقم الموظف (مثال: EMP001)"
              value={searchId}
              onChange={(e) => {
                setSearchId(e.target.value)
                if (employeeError) setEmployeeError("")
              }}
              className="pr-9 text-sm"
              dir="ltr"
              autoComplete="off"
            />
          </div>
          <Button type="submit" disabled={searchLoading || !searchId.trim()}>
            {searchLoading ? <Spinner className="w-4 h-4" /> : "بحث"}
          </Button>
        </form>

        {employeeError && (
          <p className="text-sm text-destructive text-center">{employeeError}</p>
        )}

        {/* Employee card */}
        {employee && (
          <div className="flex items-center gap-3 bg-card rounded-xl border border-border px-4 py-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{employee.name}</p>
              <p className="text-xs text-muted-foreground">
                {employee.id}
                {employee.department ? ` · ${employee.department}` : ""}
              </p>
            </div>
          </div>
        )}

        {/* Period selector — only after employee found */}
        {searched && (
          <div className="flex gap-2">
            {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => handlePeriodChange(p)}
                disabled={ordersLoading}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors border ${
                  period === p
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground border-border hover:border-primary/50"
                }`}
              >
                {PERIOD_LABELS[p].ar}
              </button>
            ))}
          </div>
        )}

        {/* Orders */}
        {searched && (
          ordersLoading ? (
            <div className="flex-1 flex items-center justify-center py-16">
              <Spinner className="w-8 h-8 text-primary" />
            </div>
          ) : ordersError ? (
            <div className="flex-1 flex flex-col items-center justify-center py-16 gap-3">
              <p className="text-muted-foreground">{ordersError}</p>
              <Button variant="outline" onClick={() => employee && loadOrders(employee.id, period)}>
                حاول مرة أخرى
              </Button>
            </div>
          ) : orders.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-16 gap-3 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <ShoppingBag className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="font-medium text-foreground">لا توجد طلبات</p>
              <p className="text-sm text-muted-foreground">
                لم يقم الموظف بأي طلبات خلال {PERIOD_LABELS[period].ar}
              </p>
            </div>
          ) : (
            <ScrollArea className="flex-1">
              <div className="flex flex-col gap-3 pb-6">
                {/* Summary */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>{orders.length} طلب خلال {PERIOD_LABELS[period].ar}</span>
                </div>

                {orders.map((order) => {
                  const status = STATUS_MAP[order.status] ?? { label: order.status, variant: "secondary" as const }
                  return (
                    <div
                      key={order.id}
                      className="bg-card rounded-xl border border-border p-4 flex flex-col gap-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs text-muted-foreground font-mono">
                            #{order.id.slice(0, 8).toUpperCase()}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </div>

                      <Separator />

                      <div className="flex flex-col gap-1.5">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span className="text-foreground">{item.name}</span>
                            <span className="text-muted-foreground font-medium">×{item.quantity}</span>
                          </div>
                        ))}
                      </div>

                      {order.notes && (
                        <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                          {order.notes}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          )
        )}

        {/* Empty state before search */}
        {!searched && !searchLoading && !employee && (
          <div className="flex-1 flex flex-col items-center justify-center py-16 gap-3 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="font-medium text-foreground">ابحث عن موظف</p>
            <p className="text-sm text-muted-foreground">أدخل رقم الموظف لعرض سجل طلباته</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default function WorkerOrderHistoryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="w-8 h-8 text-primary" />
      </div>
    }>
      <WorkerOrderHistoryContent />
    </Suspense>
  )
}
