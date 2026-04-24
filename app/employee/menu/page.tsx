"use client"

import { Suspense } from "react"
import { useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CategoryTabs } from "@/components/menu/category-tabs"
import { MenuItemCard } from "@/components/menu/menu-item-card"
import { CartSheet } from "@/components/menu/cart-sheet"
import { categories, menuItems } from "@/lib/mock-data"
import { useCart, getCartTotal, getCartItemCount } from "@/lib/cart-store"
import { ArrowRight, ShoppingBag, User } from "lucide-react"

function MenuContent() {
  const searchParams = useSearchParams()
  const [activeCategory, setActiveCategory] = useState(categories[0].id)
  const [cartOpen, setCartOpen] = useState(false)
  const cartItems = useCart()
  const itemCount = getCartItemCount()
  const total = getCartTotal()

  const employeeId = searchParams.get("id") ?? "EMP001"
  const employeeName = searchParams.get("name") ?? "موظف"

  const filteredItems = menuItems.filter(
    (item) => item.categoryId === activeCategory
  )

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-40 bg-primary text-primary-foreground shadow-md">
        <div className="flex items-center justify-between p-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
            <span className="text-sm">خروج</span>
          </Link>
          <h1 className="font-bold text-lg">كافتيريا نيشنز</h1>
          <Button
            variant="ghost"
            size="icon"
            className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
          >
            <User className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <main className="flex-1 flex flex-col p-4 pb-24">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-foreground">مرحباً بك</h2>
          <p className="text-sm text-muted-foreground">اختر طلبك من القائمة</p>
        </div>
        <div className="mb-4">
          <CategoryTabs
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <MenuItemCard key={item.id} item={item} />
          ))}
        </div>
        {filteredItems.length === 0 && (
          <div className="flex-1 flex items-center justify-center py-12">
            <p className="text-muted-foreground">لا توجد عناصر في هذه الفئة</p>
          </div>
        )}
      </main>

      {itemCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent">
          <Button
            size="lg"
            className="w-full gap-3 h-14 text-base shadow-lg"
            onClick={() => setCartOpen(true)}
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              <Badge variant="secondary" className="bg-primary-foreground text-primary">
                {itemCount}
              </Badge>
            </div>
            <span className="flex-1">عرض السلة</span>
            <span className="font-bold">{total} ر.س</span>
          </Button>
        </div>
      )}

      <CartSheet
        open={cartOpen}
        onOpenChange={setCartOpen}
        employeeId={employeeId}
        employeeName={employeeName}
      />
    </div>
  )
}

export default function EmployeeMenuPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">جاري التحميل...</p>
      </div>
    }>
      <MenuContent />
    </Suspense>
  )
}
