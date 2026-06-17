"use client"

import { Suspense, useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { ArrowRight, ShoppingBag, Calendar, RefreshCw } from "lucide-react"

// ── types ─────────────────────────────────────────────────────────────────────

type Period = "week" | "month" | "year"

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

function OrderHistoryContent() {
  const searchParams = useSearchParams()
  const employeeId   = searchParams.get("id")   ?? ""
  const employeeName = searchParams.get("name") ?? "الموظف"

  const [period, setPeriod]   = useState<Period>("month")
  const [orders, setOrders]   = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState("")

  const fetchOrders = useCallback(async () => {
    if (!employeeId) return
    setLoading(true)
    setError("")
    try {
      const { from, to } = buildDateRange(period)
      const url = `/api/orders?employeeId=${encodeURIComponent(employeeId)}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
      const res  = await fetch(url)
      const data = await res.json()
      setOrders(data.orders ?? [])
    } catch {
      setError("تعذّر تحميل السجل، حاول مرة أخرى")
    } finally {
      setLoading(false)
    }
  }, [employeeId, period])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  return (
    <div className="min-h-screen flex flex-col bg-background" dir="rtl">

      {/* Header */}
      <header className="sticky top-0 z-40 bg-primary text-primary-foreground shadow-md">
        <div className="flex items-center justify-between p-4">
          <Link
            href={`/employee/menu?id=${encodeURIComponent(employeeId)}&name=${encodeURIComponent(employeeName)}`}
            className="flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
            <span className="text-sm">القائمة</span>
          </Link>
          <h1 className="font-bold text-lg">سجل طلباتي</h1>
          <Button
            variant="ghost"
            size="icon"
            className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
            onClick={fetchOrders}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </header>

      <main className="flex-1 flex flex-col p-4 gap-4">

        {/* Employee info */}
        <div className="flex items-center gap-3 bg-card rounded-xl border border-border px-4 py-3">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-primary font-bold text-sm">{employeeName.charAt(0)}</span>
          </div>
          <div>
            <p className="font-semibold text-foreground">{employeeName}</p>
            <p className="text-xs text-muted-foreground">{employeeId}</p>
          </div>
        </div>

        {/* Period selector */}
        <div className="flex gap-2">
          {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
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

        {/* Orders */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center py-16">
            <Spinner className="w-8 h-8 text-primary" />
          </div>
        ) : error ? (
          <div className="flex-1 flex flex-col items-center justify-center py-16 gap-3">
            <p className="text-muted-foreground">{error}</p>
            <Button variant="outline" onClick={fetchOrders}>حاول مرة أخرى</Button>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-16 gap-3 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <ShoppingBag className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="font-medium text-foreground">لا توجد طلبات</p>
            <p className="text-sm text-muted-foreground">
              لم تقم بأي طلبات خلال {PERIOD_LABELS[period].ar}
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
                    {/* Top row */}
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

                    {/* Items */}
                    <div className="flex flex-col gap-1.5">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-foreground">{item.name}</span>
                          <span className="text-muted-foreground font-medium">×{item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    {/* Notes */}
                    {order.notes && (
                      <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                        {order.notes}
                      </p>
                    )}

                    {/* Link to tracking */}
                    {["pending", "accepted", "preparing", "ready"].includes(order.status) && (
                      <Link
                        href={`/employee/order/${order.id}?id=${encodeURIComponent(employeeId)}&name=${encodeURIComponent(employeeName)}`}
                        className="text-xs text-primary font-medium hover:underline text-center"
                      >
                        تتبع الطلب ←
                      </Link>
                    )}
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        )}
      </main>
    </div>
  )
}

export default function EmployeeOrderHistoryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="w-8 h-8 text-primary" />
      </div>
    }>
      <OrderHistoryContent />
    </Suspense>
  )
}
