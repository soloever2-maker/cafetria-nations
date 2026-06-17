"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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
  BarChart3,
  ShoppingBag,
  RefreshCw,
  MapPin,
  Star,
} from "lucide-react"
import type { Order } from "@/lib/types"

interface SelectedSite {
  id: string
  name: string
  nameEn: string
}

type TabType = "pending" | "preparing" | "ready" | "completed"

const tabs: {
  id: TabType
  label: string
  labelEn: string
  icon: React.ReactNode
  statuses: Order["status"][]
}[] = [
  { id: "pending",   label: "جديد",          labelEn: "New",       icon: <Clock className="w-4 h-4" />,       statuses: ["pending"]              },
  { id: "preparing", label: "قيد التحضير",   labelEn: "Preparing", icon: <ChefHat className="w-4 h-4" />,     statuses: ["preparing"]            },
  { id: "ready",     label: "جاهز",          labelEn: "Ready",     icon: <CheckCircle className="w-4 h-4" />, statuses: ["ready"]                },
  { id: "completed", label: "مكتمل",         labelEn: "Completed", icon: <XCircle className="w-4 h-4" />,     statuses: ["delivered", "cancelled"] },
]

export default function HeroDashboardPage() {
  const router = useRouter()
  const [activeTab, setActiveTab]     = useState<TabType>("pending")
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [selectedSite, setSelectedSite] = useState<SelectedSite | null>(null)
  const [siteLoaded, setSiteLoaded]   = useState(false)

  const { playSound } = useNotificationSound()
  const prevPendingCount = useRef(0)
  const hasInitialized   = useRef(false)

  // Guard: read site from sessionStorage — redirect if not set
  useEffect(() => {
    const stored = sessionStorage.getItem("hero_selected_site")
    if (!stored) {
      router.replace("/hero/site-select")
      return
    }
    try {
      const parsed = JSON.parse(stored) as SelectedSite
      setSelectedSite(parsed)
    } catch {
      router.replace("/hero/site-select")
      return
    }
    setSiteLoaded(true)
  }, [router])

  const handleNewOrder = useCallback(
    (order: Order) => {
      if (soundEnabled && order.status === "pending") playSound()
    },
    [soundEnabled, playSound]
  )

  // Only start fetching once we have the site
  const { orders, isLoading, refetch } = useRealtimeOrders({
    siteId: selectedSite?.id,
    onNewOrder: handleNewOrder,
  })

  const currentTab     = tabs.find((t) => t.id === activeTab)!
  const filteredOrders = orders.filter((o) => currentTab.statuses.includes(o.status))

  const pendingCount   = orders.filter((o) => o.status === "pending").length
  const preparingCount = orders.filter((o) => o.status === "preparing").length
  const readyCount     = orders.filter((o) => o.status === "ready").length

  useEffect(() => {
    if (!hasInitialized.current) {
      prevPendingCount.current = pendingCount
      hasInitialized.current   = true
      return
    }
    if (pendingCount > prevPendingCount.current && soundEnabled) playSound()
    prevPendingCount.current = pendingCount
  }, [pendingCount, soundEnabled, playSound])

  const handleLogout = () => {
    sessionStorage.removeItem("hero_selected_site")
    router.push("/")
  }

  // Show loading until site is resolved
  if (!siteLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="h-8 w-8 text-accent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-primary text-primary-foreground shadow-md">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Site info */}
          <div>
            <div className="flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 fill-current opacity-80" />
              <h1 className="font-bold text-sm">Nations Hero</h1>
            </div>
            <div className="flex items-center gap-1 text-xs opacity-75 mt-0.5">
              <MapPin className="w-3 h-3" />
              <span>{selectedSite?.name}</span>
              <span className="opacity-60">· {selectedSite?.nameEn}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <Link href="/hero/order-history">
              <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10" title="سجل الطلبات">
                <ShoppingBag className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/hero/kpi">
              <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10" title="الإحصائيات">
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
              {soundEnabled ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
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
            {/* Change site */}
            <Button
              variant="ghost"
              size="icon"
              className="text-primary-foreground hover:bg-primary-foreground/10"
              onClick={() => router.push("/hero/site-select")}
              title="تغيير السايد"
            >
              <MapPin className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-primary-foreground hover:bg-primary-foreground/10"
              onClick={handleLogout}
              title="خروج"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-t border-primary-foreground/10">
          {tabs.map((tab) => {
            const count =
              tab.id === "pending"   ? pendingCount   :
              tab.id === "preparing" ? preparingCount :
              tab.id === "ready"     ? readyCount     : 0

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

      {/* Orders */}
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
                {activeTab === "pending"   && "لا توجد طلبات جديدة حالياً"}
                {activeTab === "preparing" && "لا توجد طلبات قيد التحضير"}
                {activeTab === "ready"     && "لا توجد طلبات جاهزة للتسليم"}
                {activeTab === "completed" && "لا توجد طلبات مكتملة"}
              </p>
              <p className="text-xs text-muted-foreground mt-1 opacity-60">
                {selectedSite?.name} — {selectedSite?.nameEn}
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <OrderCard key={order.id} order={order} onStatusChange={refetch} />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
