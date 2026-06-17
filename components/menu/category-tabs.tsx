"use client"

import { cn } from "@/lib/utils"
import type { Category } from "@/lib/types"
import { Coffee, Sandwich, Croissant, Salad, Cake } from "lucide-react"

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  coffee: Coffee,
  sandwich: Sandwich,
  croissant: Croissant,
  salad: Salad,
  cake: Cake,
}

interface CategoryTabsProps {
  categories: Category[]
  activeCategory: string
  onCategoryChange: (categoryId: string) => void
}

export function CategoryTabs({
  categories,
  activeCategory,
  onCategoryChange,
}: CategoryTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map((category) => {
        const Icon = iconMap[category.icon] || Coffee
        const isActive = activeCategory === category.id
        
        return (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={cn(
              "flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl min-w-[80px] transition-all",
              isActive
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-card text-muted-foreground hover:bg-muted border border-border"
            )}
          >
            <Icon className="w-5 h-5" />
            <span className="text-xs font-medium whitespace-nowrap">
              {category.name}
            </span>
          </button>
        )
      })}
    </div>
  )
}
