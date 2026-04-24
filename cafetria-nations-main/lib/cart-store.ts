"use client"

import { useSyncExternalStore } from "react"
import type { CartItem, MenuItem } from "./types"

interface CartStore {
  items: CartItem[]
  addItem: (item: MenuItem) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  getTotal: () => number
  getItemCount: () => number
}

let cartItems: CartItem[] = []
const listeners = new Set<() => void>()

function emitChange() {
  listeners.forEach((listener) => listener())
}

function getSnapshot(): CartItem[] {
  return cartItems
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function addToCart(item: MenuItem) {
  const existingIndex = cartItems.findIndex((i) => i.id === item.id)
  if (existingIndex >= 0) {
    cartItems = cartItems.map((i, idx) =>
      idx === existingIndex ? { ...i, quantity: i.quantity + 1 } : i
    )
  } else {
    cartItems = [...cartItems, { ...item, quantity: 1 }]
  }
  emitChange()
}

export function removeFromCart(itemId: string) {
  cartItems = cartItems.filter((i) => i.id !== itemId)
  emitChange()
}

export function updateCartQuantity(itemId: string, quantity: number) {
  if (quantity <= 0) {
    removeFromCart(itemId)
    return
  }
  cartItems = cartItems.map((i) =>
    i.id === itemId ? { ...i, quantity } : i
  )
  emitChange()
}

export function clearCart() {
  cartItems = []
  emitChange()
}

export function getCartTotal(): number {
  return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
}

export function getCartItemCount(): number {
  return cartItems.reduce((sum, item) => sum + item.quantity, 0)
}

export function useCart(): CartItem[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}
