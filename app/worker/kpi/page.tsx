"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Spinner } from "@/components/ui/spinner"
import {
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  ShoppingBag,
  BarChart3,
  RefreshCw,
} from "lucide-react"
import type { KPIStats } from "@/lib/server-store"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const statusLabels: Record<string, { ar: string; en: string }> = {
  pending: { ar: "قيد الانتظار", en: "Pending" },
  preparing: { ar: "قيد التحضير", en: "Preparing" },
  ready: { ar: "جاهز", en: "Ready" },
  delivered: { ar: "تم التسليم", en: "Delivered" },
  cancelled: { ar: "ملغي", en: "Cancelled" },
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-500/20 text-amber-700",
  preparing: "bg-blue-500/20 text-blue-700",
  ready: "bg-green-500/20 text-green-700",
  delivered: "bg-primary/20 text-primary",
  cancelled: "bg-destructive/20 text-destructive",
}

export default function WorkerKPIPage() {
  const { data: stats, error, isLoading, mutate } = useSWR<KPIStats>(
    "/api/kpi",
    fetcher,
    { refreshInterval: 10000 }
  )
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  useEffect(() => {
    if (stats) {
      setLastUpdated(new Date())
    }
  }, [stats])

  const handleRefresh = () => {
    mutate()
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">خطأ في تحميل البيانات</h2>
            <p className="text-muted-foreground mb-4">
              حدث خطأ أثناء تحميل الإحصائيات
            </p>
            <Button onClick={handleRefresh}>إعادة المحاولة</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Link href="/worker/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-bold">لوحة الأداء</h1>
              <p className="text-xs text-muted-foreground">KPI Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              آخر تحديث: {lastUpdated.toLocaleTimeString("ar-SA")}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      </header>

      {isLoading && !stats ? (
        <div className="flex items-center justify-center h-64">
          <Spinner className="h-8 w-8 text-primary" />
        </div>
      ) : (
        <ScrollArea className="h-[calc(100vh-65px)]">
          <div className="p-4 space-y-4">
            {/* Main Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* Total Orders */}
              <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <ShoppingBag className="h-8 w-8 text-primary" />
                    <div className="text-left">
                      <p className="text-2xl font-bold text-primary">
                        {stats?.totalOrders || 0}
                      </p>
                      <p className="text-xs text-muted-foreground">إجمالي الطلبات</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pending Orders */}
              <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <Clock className="h-8 w-8 text-amber-600" />
                    <div className="text-left">
                      <p className="text-2xl font-bold text-amber-600">
                        {stats?.pendingOrders || 0}
                      </p>
                      <p className="text-xs text-muted-foreground">قيد الانتظار</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Completed Orders */}
              <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                    <div className="text-left">
                      <p className="text-2xl font-bold text-green-600">
                        {stats?.completedOrders || 0}
                      </p>
                      <p className="text-xs text-muted-foreground">مكتملة</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Cancelled Orders */}
              <Card className="bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <XCircle className="h-8 w-8 text-destructive" />
                    <div className="text-left">
                      <p className="text-2xl font-bold text-destructive">
                        {stats?.cancelledOrders || 0}
                      </p>
                      <p className="text-xs text-muted-foreground">ملغاة</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Revenue Stats */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <DollarSign className="h-5 w-5 text-accent" />
                  <span>الإيرادات</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 rounded-lg bg-accent/10">
                    <p className="text-2xl font-bold text-accent">
                      {stats?.totalRevenue?.toFixed(2) || "0.00"} ج.م
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      إجمالي الإيرادات
                    </p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-primary/10">
                    <p className="text-2xl font-bold text-primary">
                      {stats?.averageOrderValue?.toFixed(2) || "0.00"} ج.م
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      متوسط قيمة الطلب
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status Breakdown */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <span>توزيع الحالات</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats?.statusBreakdown && stats.statusBreakdown.length > 0 ? (
                    stats.statusBreakdown.map((item) => {
                      const percentage =
                        stats.totalOrders > 0
                          ? (item.count / stats.totalOrders) * 100
                          : 0
                      return (
                        <div key={item.status} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <Badge
                              variant="secondary"
                              className={statusColors[item.status]}
                            >
                              {statusLabels[item.status]?.ar || item.status}
                            </Badge>
                            <span className="text-sm font-medium">
                              {item.count} ({percentage.toFixed(0)}%)
                            </span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                item.status === "pending"
                                  ? "bg-amber-500"
                                  : item.status === "preparing"
                                  ? "bg-blue-500"
                                  : item.status === "ready"
                                  ? "bg-green-500"
                                  : item.status === "delivered"
                                  ? "bg-primary"
                                  : "bg-destructive"
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <p className="text-center text-muted-foreground py-4">
                      لا توجد بيانات
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Top Items */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span>الأصناف الأكثر طلباً</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats?.topItems && stats.topItems.length > 0 ? (
                  <div className="space-y-2">
                    {stats.topItems.map((item, index) => (
                      <div
                        key={item.name}
                        className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              index === 0
                                ? "bg-accent text-accent-foreground"
                                : index === 1
                                ? "bg-muted-foreground/30 text-foreground"
                                : index === 2
                                ? "bg-amber-700/20 text-amber-700"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {index + 1}
                          </span>
                          <span className="font-medium">{item.name}</span>
                        </div>
                        <Badge variant="outline">{item.count} طلب</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    لا توجد بيانات
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Orders Per Hour */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <span>الطلبات حسب الساعة</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats?.ordersPerHour && stats.ordersPerHour.length > 0 ? (
                  <div className="space-y-2">
                    {stats.ordersPerHour.map((item) => {
                      const maxCount = Math.max(
                        ...stats.ordersPerHour.map((h) => h.count)
                      )
                      const percentage =
                        maxCount > 0 ? (item.count / maxCount) * 100 : 0
                      return (
                        <div key={item.hour} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-mono">{item.hour}</span>
                            <span className="font-medium">{item.count}</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    لا توجد بيانات
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      )}
    </div>
  )
}
