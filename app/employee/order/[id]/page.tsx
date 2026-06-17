"use client"

import { Suspense, useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { ArrowRight, CheckCircle, Clock, Coffee, Loader2, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"

type OrderStatus = "pending" | "accepted" | "preparing" | "ready" | "delivered"

interface OrderData {
  id: string
  employee_name: string
  status: OrderStatus
  notes: string | null
  created_at: string
  order_items: { item_name: string; quantity: number }[]
}

const statusSteps: { key: OrderStatus; label: string; icon: React.ReactNode }[] = [
  { key: "pending",   label: "في الانتظار",     icon: <Clock className="w-5 h-5" /> },
  { key: "accepted",  label: "تم القبول",        icon: <CheckCircle className="w-5 h-5" /> },
  { key: "preparing", label: "قيد التحضير",      icon: <Coffee className="w-5 h-5" /> },
  { key: "ready",     label: "في الطريق إليك",   icon: <Truck className="w-5 h-5" /> },
  { key: "delivered", label: "تم التسليم ✓",     icon: <CheckCircle className="w-5 h-5" /> },
]

const statusIndex = (s: OrderStatus) => statusSteps.findIndex(x => x.key === s)

function TrackingContent() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string
  const [order, setOrder] = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(true)
  const [rating, setRating] = useState(0)
  const [rated, setRated] = useState(false)

  useEffect(() => {
    if (!orderId) return

    // Fetch initial order
    async function fetchOrder() {
      const { data } = await supabase
        .from("orders")
        .select("*, order_items(item_name, quantity)")
        .eq("id", orderId)
        .single()
      if (data) setOrder(data as OrderData)
      setLoading(false)
    }
    fetchOrder()

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`order-track-${orderId}`)
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "orders",
        filter: `id=eq.${orderId}`,
      }, (payload) => {
        setOrder(prev => prev ? { ...prev, status: payload.new.status as OrderStatus } : prev)
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [orderId])

  async function submitRating(stars: number) {
    setRating(stars)
    await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "rate", rating: stars }),
    })
    setRated(true)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  )

  if (!order) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">الطلب غير موجود</p>
    </div>
  )

  const currentStep = statusIndex(order.status)

  return (
    <div className="min-h-screen flex flex-col bg-background" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-primary text-primary-foreground shadow-md">
        <div className="flex items-center justify-between p-4">
          <Link href="/" className="flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground">
            <ArrowRight className="w-5 h-5" />
            <span className="text-sm">خروج</span>
          </Link>
          <h1 className="font-bold text-lg">تتبع طلبك</h1>
          <div className="w-16" />
        </div>
      </header>

      <main className="flex-1 p-4 max-w-md mx-auto w-full space-y-6">

        {/* Status Banner */}
        <div className={`rounded-2xl p-5 text-center text-white shadow-lg ${
          order.status === "delivered" ? "bg-green-600" :
          order.status === "preparing" || order.status === "ready" ? "bg-primary" :
          "bg-muted-foreground"
        }`}>
          <div className="text-3xl mb-2">
            {order.status === "pending"   && "⏳"}
            {order.status === "accepted"  && "✅"}
            {order.status === "preparing" && "☕"}
            {order.status === "ready"     && "🚶"}
            {order.status === "delivered" && "🎉"}
          </div>
          <p className="text-xl font-bold">
            {statusSteps[currentStep]?.label}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="bg-card border rounded-2xl p-4 space-y-3">
          {statusSteps.map((step, i) => (
            <div key={step.key} className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                i < currentStep  ? "bg-green-500 text-white" :
                i === currentStep ? "bg-primary text-white ring-4 ring-primary/20" :
                "bg-muted text-muted-foreground"
              }`}>
                {i < currentStep ? <CheckCircle className="w-5 h-5" /> : step.icon}
              </div>
              <span className={`text-sm font-medium ${
                i === currentStep ? "text-primary" :
                i < currentStep  ? "text-green-600" :
                "text-muted-foreground"
              }`}>
                {step.label}
              </span>
              {i === currentStep && order.status !== "delivered" && (
                <span className="mr-auto">
                  <span className="inline-flex gap-1">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{animationDelay:"0ms"}}/>
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{animationDelay:"150ms"}}/>
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{animationDelay:"300ms"}}/>
                  </span>
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Order Items */}
        <div className="bg-card border rounded-2xl p-4">
          <h3 className="font-bold mb-3 text-sm text-muted-foreground uppercase tracking-wide">تفاصيل طلبك</h3>
          <div className="space-y-2">
            {order.order_items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span>{item.item_name}</span>
                <span className="text-muted-foreground">× {item.quantity}</span>
              </div>
            ))}
          </div>
          {order.notes && (
            <p className="mt-3 text-xs text-muted-foreground border-t pt-2">
              ملاحظة: {order.notes}
            </p>
          )}
        </div>

        {/* Rating */}
        {order.status === "delivered" && !rated && (
          <div className="bg-card border rounded-2xl p-4 text-center">
            <h3 className="font-bold mb-1">كيف كانت الخدمة؟</h3>
            <p className="text-sm text-muted-foreground mb-3">قيّم تجربتك</p>
            <div className="flex justify-center gap-2">
              {[1,2,3,4,5].map(star => (
                <button
                  key={star}
                  onClick={() => submitRating(star)}
                  className={`text-3xl transition-transform hover:scale-125 ${
                    star <= rating ? "opacity-100" : "opacity-30"
                  }`}
                >
                  ⭐
                </button>
              ))}
            </div>
          </div>
        )}

        {rated && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
            <p className="text-green-700 font-bold">شكراً على تقييمك! 🙏</p>
          </div>
        )}

        {/* New Order Button */}
        {order.status === "delivered" && (
          <Button
            className="w-full h-12"
            onClick={() => router.replace(`/employee/menu?id=${order.id}`)}
          >
            طلب جديد ☕
          </Button>
        )}

      </main>
    </div>
  )
}

export default function OrderTrackingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <TrackingContent />
    </Suspense>
  )
}
