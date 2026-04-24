"use client"

import { useState } from "react"
import type { Order } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, User, FileText, Check, X, ChefHat, Package } from "lucide-react"

interface OrderCardProps {
  order: Order
  onStatusChange?: () => void
}

const statusConfig = {
  pending: {
    label: "قيد الانتظار",
    labelEn: "Pending",
    color: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  },
  preparing: {
    label: "قيد التحضير",
    labelEn: "Preparing",
    color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  },
  ready: {
    label: "جاهز للتسليم",
    labelEn: "Ready",
    color: "bg-green-500/10 text-green-600 border-green-500/20",
  },
  delivered: {
    label: "تم التسليم",
    labelEn: "Delivered",
    color: "bg-muted text-muted-foreground border-muted",
  },
  cancelled: {
    label: "ملغي",
    labelEn: "Cancelled",
    color: "bg-destructive/10 text-destructive border-destructive/20",
  },
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("ar-SA", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

function getTimeAgo(date: Date) {
  const minutes = Math.floor((Date.now() - date.getTime()) / 60000)
  if (minutes < 1) return "الآن"
  if (minutes < 60) return `منذ ${minutes} دقيقة`
  const hours = Math.floor(minutes / 60)
  return `منذ ${hours} ساعة`
}

export function OrderCard({ order, onStatusChange }: OrderCardProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const status = statusConfig[order.status]

  const handleStatusChange = async (newStatus: Order["status"]) => {
    setIsUpdating(true)
    try {
      await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      onStatusChange?.()
    } catch (error) {
      console.error("Failed to update order status:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <User className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="font-semibold truncate">{order.employeeName}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span>{formatTime(order.createdAt)}</span>
              <span className="text-xs">({getTimeAgo(order.createdAt)})</span>
            </div>
          </div>
          <Badge variant="outline" className={status.color}>
            {status.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <div className="space-y-2">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-2 py-1.5 border-b border-border/50 last:border-0"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                  {item.quantity}
                </span>
                <span className="truncate">{item.name}</span>
              </div>
              <span className="text-sm text-muted-foreground shrink-0">
                {item.price * item.quantity} ج.م
              </span>
            </div>
          ))}
        </div>

        {order.notes && (
          <div className="mt-3 p-2.5 bg-accent/30 rounded-lg">
            <div className="flex items-start gap-2">
              <FileText className="w-4 h-4 text-accent-foreground mt-0.5 shrink-0" />
              <p className="text-sm text-accent-foreground">{order.notes}</p>
            </div>
          </div>
        )}

        <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
          <span className="text-muted-foreground">الإجمالي</span>
          <span className="font-bold text-lg">{order.total} ج.م</span>
        </div>
      </CardContent>

      <CardFooter className="bg-muted/30 pt-3">
        {order.status === "pending" && (
          <div className="flex gap-2 w-full">
            <Button
              variant="destructive"
              className="flex-1 gap-2"
              onClick={() => handleStatusChange("cancelled")}
              disabled={isUpdating}
            >
              <X className="w-4 h-4" />
              رفض
            </Button>
            <Button
              className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
              onClick={() => handleStatusChange("preparing")}
              disabled={isUpdating}
            >
              <Check className="w-4 h-4" />
              قبول
            </Button>
          </div>
        )}

        {order.status === "preparing" && (
          <Button
            className="w-full gap-2"
            onClick={() => handleStatusChange("ready")}
            disabled={isUpdating}
          >
            <ChefHat className="w-4 h-4" />
            جاهز للتسليم
          </Button>
        )}

        {order.status === "ready" && (
          <Button
            className="w-full gap-2"
            variant="secondary"
            onClick={() => handleStatusChange("delivered")}
            disabled={isUpdating}
          >
            <Package className="w-4 h-4" />
            تم التسليم
          </Button>
        )}

        {(order.status === "delivered" || order.status === "cancelled") && (
          <p className="text-center text-sm text-muted-foreground w-full">
            {order.status === "delivered" ? "تم تسليم الطلب بنجاح" : "تم إلغاء الطلب"}
          </p>
        )}
      </CardFooter>
    </Card>
  )
}
