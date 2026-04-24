"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import Link from "next/link"
import { useRealtimeOrders } from "@/hooks/use-realtime-orders"
import { OrderCard } from "@/components/worker/order-card"
import { useNotificationSound } from "@/hooks/use-notification-sound"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Spinner } from "@/components/ui/spinner"
import { 
  LogOut, 
  Bell, 
  BellOff, 
  Clock, 
  ChefHat, 
  CheckCircle, 
  XCircle,
  Plus,
  BarChart3,
  RefreshCw
} from "lucide-react"
import type { Order } from "@/lib/types"

type TabType = "pending" | "preparing" | "ready" | "completed"

const tabs: { id: TabType; label: string; labelEn: string; icon: React.ReactNode; statuses: Order["status"][] }[] = [
  { 
    id: "pending", 
    label: "جديد", 
    labelEn: "New", 
    icon: <Clock className="w-4 h-4" />,
    statuses: ["pending"]
  },
  { 
    id: "preparing", 
    label: "قيد التحضير", 
    labelEn: "Preparing", 
    icon: <ChefHat className="w-4 h-4" />,
    statuses: ["preparing"]
  },
  { 
    id: "ready", 
    label: "جاهز", 
    labelEn: "Ready", 
    icon: <CheckCircle className="w-4 h-4" />,
    statuses: ["ready"]
  },
  { 
    id: "completed", 
    label: "مكتمل", 
    labelEn: "Completed", 
    icon: <XCircle className="w-4 h-4" />,
    statuses: ["delivered", "cancelled"]
  },
]

export default function WorkerDashboardPage() {
  const [activeTab, setActiveTab] = useState<TabType>("pending")
  const [soundEnabled, setSoundEnabled] = useState(true)
  const { playSound } = useNotificationSound()
  const prevPendingCount = useRef(0)
  const hasInitialized = useRef(false)

  // Handle new order notification
  const handleNewOrder = useCallback((order: Order) => {
    if (soundEnabled && order.status === "pending") {
      playSound()
    }
  }, [soundEnabled, playSound])

  // Use realtime orders
  const { orders, isLoading, refetch } = useRealtimeOrders({
    onNewOrder: handleNewOrder,
  })

  // Filter orders by active tab
  const currentTab = tabs.find((tab) => tab.id === activeTab)!
  const filteredOrders = orders.filter((order) => 
    currentTab.statuses.includes(order.status)
  )

  // Count orders for each tab
  const pendingCount = orders.filter((o) => o.status === "pending").length
  const preparingCount = orders.filter((o) => o.status === "preparing").length
  const readyCount = orders.filter((o) => o.status === "ready").length

  // Track pending count changes for sound (backup for SSE)
  useEffect(() => {
    if (!hasInitialized.current) {
      prevPendingCount.current = pendingCount
      hasInitialized.current = true
      return
    }

    if (pendingCount > prevPendingCount.current && soundEnabled) {
      playSound()
    }
    prevPendingCount.current = pendingCount
  }, [pendingCount, soundEnabled, playSound])

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-primary text-primary-foreground shadow-md">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <h1 className="font-bold text-lg">لوحة تحكم العامل</h1>
            <p className="text-xs opacity-80">Worker Dashboard</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/worker/kpi">
              <Button
                variant="ghost"
                size="icon"
                className="text-primary-foreground hover:bg-primary-foreground/10"
                title="الإحصائيات"
              >
                <BarChart3 className="w-5 h-5" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="text-primary-foreground hover:bg-primary-foreground/10"
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? "إيقاف الصوت" : "تشغيل الصوت"}
            >
              {soundEnabled ? (
                <Bell className="w-5 h-5" />
              ) : (
                <BellOff className="w-5 h-5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-primary-foreground hover:bg-primary-foreground/10"
              onClick={() => refetch()}
              title="تحديث"
            >
              <RefreshCw className="w-5 h-5" />
            </Button>
            <Link href="/">
              <Button
                variant="ghost"
                size="icon"
                className="text-primary-foreground hover:bg-primary-foreground/10"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-t border-primary-foreground/10">
          {tabs.map((tab) => {
            const count = 
              tab.id === "pending" ? pendingCount :
              tab.id === "preparing" ? preparingCount :
              tab.id === "ready" ? readyCount : 0

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium transition-colors relative ${
                  activeTab === tab.id
                    ? "text-primary-foreground"
                    : "text-primary-foreground/60 hover:text-primary-foreground/80"
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
                {count > 0 && tab.id !== "completed" && (
                  <Badge 
                    variant="secondary" 
                    className={`h-5 min-w-5 px-1.5 text-xs ${
                      tab.id === "pending" 
                        ? "bg-red-500 text-white animate-pulse" 
                        : "bg-primary-foreground/20"
                    }`}
                  >
                    {count}
                  </Badge>
                )}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 inset-x-0 h-0.5 bg-secondary" />
                )}
              </button>
            )
          })}
        </div>
      </header>

      {/* Orders List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4 pb-24">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Spinner className="h-8 w-8 text-primary" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                {currentTab.icon}
              </div>
              <h3 className="font-semibold text-lg mb-1">لا توجد طلبات</h3>
              <p className="text-sm text-muted-foreground">
                {activeTab === "pending" && "لا توجد طلبات جديدة حالياً"}
                {activeTab === "preparing" && "لا توجد طلبات قيد التحضير"}
                {activeTab === "ready" && "لا توجد طلبات جاهزة للتسليم"}
                {activeTab === "completed" && "لا توجد طلبات مكتملة"}
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <OrderCard key={order.id} order={order} onStatusChange={refetch} />
            ))
          )}
        </div>
      </ScrollArea>

      {/* Demo Button - For Testing */}
      <div className="fixed bottom-6 left-6">
        <Button
          onClick={handleAddDemoOrder}
          size="lg"
          className="rounded-full shadow-lg gap-2"
          variant="secondary"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">إضافة طلب تجريبي</span>
        </Button>
      </div>
    </div>
  )
}
