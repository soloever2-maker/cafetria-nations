"use client"

import { useSyncExternalStore } from "react"
import type { Order, CartItem } from "./types"

// Generate a simple ID
function generateId() {
  return Math.random().toString(36).substring(2, 9)
}

// Store state
let orders: Order[] = []
let listeners: Set<() => void> = new Set()

function emitChange() {
  listeners.forEach((listener) => listener())
}

// Subscribe to store changes
function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

// Get current snapshot
function getSnapshot() {
  return orders
}

// Get server snapshot (for SSR)
function getServerSnapshot() {
  return orders
}

// Actions
export function createOrder(
  items: CartItem[],
  employeeId: string,
  employeeName: string,
  notes?: string
): Order {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  
  const newOrder: Order = {
    id: generateId(),
    items,
    total,
    employeeId,
    employeeName,
    status: "pending",
    createdAt: new Date(),
    notes,
  }
  
  orders = [newOrder, ...orders]
  emitChange()
  return newOrder
}

export function updateOrderStatus(orderId: string, status: Order["status"]) {
  orders = orders.map((order) =>
    order.id === orderId ? { ...order, status } : order
  )
  emitChange()
}

export function getOrderById(orderId: string): Order | undefined {
  return orders.find((order) => order.id === orderId)
}

// Hook to use orders
export function useOrders() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

// Hook to get orders by status
export function useOrdersByStatus(statuses: Order["status"][]) {
  const allOrders = useOrders()
  return allOrders.filter((order) => statuses.includes(order.status))
}

// Hook to get orders for a specific employee
export function useEmployeeOrders(employeeId: string) {
  const allOrders = useOrders()
  return allOrders.filter((order) => order.employeeId === employeeId)
}

// Add some demo orders for testing
export function addDemoOrders() {
  const demoOrders: Order[] = [
    {
      id: "demo1",
      items: [
        {
          id: "d1",
          name: "قهوة عربية",
          nameEn: "Arabic Coffee",
          description: "قهوة عربية تقليدية مع الهيل",
          price: 5,
          categoryId: "drinks",
          available: true,
          quantity: 2,
        },
        {
          id: "s1",
          name: "سندويش دجاج مشوي",
          nameEn: "Grilled Chicken Sandwich",
          description: "دجاج مشوي مع الخضار والصوص",
          price: 18,
          categoryId: "sandwiches",
          available: true,
          quantity: 1,
        },
      ],
      total: 28,
      employeeId: "EMP001",
      employeeName: "أحمد محمد",
      status: "pending",
      createdAt: new Date(Date.now() - 2 * 60000),
      notes: "بدون بصل",
    },
    {
      id: "demo2",
      items: [
        {
          id: "d3",
          name: "كابتشينو",
          nameEn: "Cappuccino",
          description: "إسبريسو مع حليب مخفوق",
          price: 8,
          categoryId: "drinks",
          available: true,
          quantity: 3,
        },
      ],
      total: 24,
      employeeId: "EMP002",
      employeeName: "سارة أحمد",
      status: "pending",
      createdAt: new Date(Date.now() - 5 * 60000),
    },
  ]
  
  orders = [...demoOrders, ...orders]
  emitChange()
}
