"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { MenuItem } from "@/lib/types"
import { Plus, Minus } from "lucide-react"
import { addToCart, removeFromCart, useCart } from "@/lib/cart-store"
import { cn } from "@/lib/utils"

interface MenuItemCardProps {
  item: MenuItem
}

export function MenuItemCard({ item }: MenuItemCardProps) {
  const cartItems = useCart()
  const cartItem = cartItems.find((i) => i.id === item.id)
  const quantity = cartItem?.quantity || 0

  return (
    <div
      className={cn(
        "bg-card rounded-xl border border-border p-4 flex flex-col gap-3 transition-all",
        !item.available && "opacity-60",
        quantity > 0 && "ring-2 ring-primary/30 border-primary/50"
      )}
    >
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{item.name}</h3>
          <p className="text-xs text-muted-foreground">{item.nameEn}</p>
        </div>
        {!item.available && (
          <Badge variant="secondary" className="shrink-0">
            غير متوفر
          </Badge>
        )}
      </div>

      <p className="text-sm text-muted-foreground line-clamp-2">
        {item.description}
      </p>

      <div className="flex items-center justify-between mt-auto pt-2">
        <span className="font-bold text-primary text-lg">
          {item.price} <span className="text-xs">ج.م</span>
        </span>

        {item.available && (
          <div className="flex items-center gap-2">
            {quantity > 0 ? (
              <>
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={() => removeFromCart(item.id)}
                  className="h-8 w-8"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-6 text-center font-semibold">{quantity}</span>
                <Button
                  size="icon-sm"
                  onClick={() => addToCart(item)}
                  className="h-8 w-8"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                onClick={() => addToCart(item)}
                className="gap-1"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة</span>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
