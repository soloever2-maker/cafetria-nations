"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import {
  useCart,
  updateCartQuantity,
  removeFromCart,
  clearCart,
  getCartTotal,
} from "@/lib/cart-store"
import { Plus, Minus, Trash2, ShoppingBag, Check } from "lucide-react"

interface CartSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employeeId: string
  employeeName: string
}

export function CartSheet({ open, onOpenChange, employeeId, employeeName }: CartSheetProps) {
  const cartItems = useCart()
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderSubmitted, setOrderSubmitted] = useState(false)
  const total = getCartTotal()
  const router = useRouter()

  const handleSubmitOrder = async () => {
    if (cartItems.length === 0) return
    
    setIsSubmitting(true)
    
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartItems,
          employeeId,
          employeeName,
          notes: notes || undefined,
        }),
      })
      
      if (!response.ok) {
        throw new Error("Failed to create order")
      }

      const data = await response.json()
      const orderId = data.order?.id
      
      setOrderSubmitted(true)
      clearCart()
      setNotes("")

      // Redirect to tracking page after 1.5 seconds
      setTimeout(() => {
        setOrderSubmitted(false)
        onOpenChange(false)
        if (orderId) {
          router.replace(`/employee/order/${orderId}`)
        }
      }, 1500)

    } catch (error) {
      console.error("Failed to submit order:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (orderSubmitted) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="left" className="w-full sm:max-w-md">
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center">
              <Check className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-xl font-bold text-foreground">تم إرسال الطلب</h2>
            <p className="text-muted-foreground text-center">
              جاري تحويلك لمتابعة طلبك...
            </p>
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            <span>سلة الطلبات</span>
            {cartItems.length > 0 && (
              <Badge variant="secondary">{cartItems.length}</Badge>
            )}
          </SheetTitle>
          <SheetDescription>
            راجع طلبك قبل الإرسال
          </SheetDescription>
        </SheetHeader>

        {cartItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <ShoppingBag className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium text-foreground">السلة فارغة</p>
              <p className="text-sm text-muted-foreground">
                أضف بعض العناصر من القائمة
              </p>
            </div>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 -mx-4 px-4">
              <div className="flex flex-col gap-3 py-4">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-muted/50 rounded-lg p-3 flex flex-col gap-2"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground truncate">
                          {item.name}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {item.price} ج.م × {item.quantity}
                        </p>
                      </div>
                      <span className="font-bold text-primary">
                        {item.price * item.quantity} ج.م
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon-sm"
                          onClick={() =>
                            updateCartQuantity(item.id, item.quantity - 1)
                          }
                          className="h-7 w-7"
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-6 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon-sm"
                          onClick={() =>
                            updateCartQuantity(item.id, item.quantity + 1)
                          }
                          className="h-7 w-7"
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeFromCart(item.id)}
                        className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pb-4">
                <label className="text-sm font-medium text-foreground mb-2 block">
                  ملاحظات إضافية (اختياري)
                </label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="مثال: بدون سكر، حار قليلاً..."
                  className="resize-none"
                  rows={2}
                />
              </div>
            </ScrollArea>

            <SheetFooter className="border-t border-border pt-4">
              <div className="w-full flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">المجموع</span>
                  <span className="text-2xl font-bold text-primary">
                    {total} <span className="text-sm">ج.م</span>
                  </span>
                </div>
                <Button
                  size="lg"
                  className="w-full gap-2"
                  onClick={handleSubmitOrder}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Spinner className="w-4 h-4" />
                      <span>جاري الإرسال...</span>
                    </>
                  ) : (
                    <span>إرسال الطلب ☕</span>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => clearCart()}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4 ml-2" />
                  مسح السلة
                </Button>
              </div>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
