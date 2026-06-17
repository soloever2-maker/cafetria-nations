"use client"

import { useEffect, useCallback, useRef } from "react"
import useSWR, { mutate } from "swr"
import { supabase } from "@/lib/supabase"
import type { Order } from "@/lib/types"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export interface UseRealtimeOrdersOptions {
  statuses?: Order["status"][]
  siteId?: string                       // ← filter by site (for Nations Hero)
  onNewOrder?: (order: Order) => void
  onOrderUpdate?: (order: Order) => void
}

export function useRealtimeOrders(options: UseRealtimeOrdersOptions = {}) {
  const { statuses, siteId, onNewOrder, onOrderUpdate } = options
  const onNewOrderRef    = useRef(onNewOrder)
  const onOrderUpdateRef = useRef(onOrderUpdate)

  useEffect(() => {
    onNewOrderRef.current    = onNewOrder
    onOrderUpdateRef.current = onOrderUpdate
  }, [onNewOrder, onOrderUpdate])

  // Build API URL with filters
  const apiUrl = (() => {
    const params = new URLSearchParams()
    if (statuses) params.set("status", statuses.join(","))
    if (siteId)   params.set("site_id", siteId)
    const qs = params.toString()
    return qs ? `/api/orders?${qs}` : "/api/orders"
  })()

  const { data, error, isLoading } = useSWR<{ orders: Order[] }>(
    apiUrl,
    fetcher,
    { refreshInterval: 0, revalidateOnFocus: true }
  )

  // Supabase Realtime subscription (filtered by site when provided)
  useEffect(() => {
    const channelName = siteId ? `orders-site-${siteId}` : "orders-changes"

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "orders",
          ...(siteId ? { filter: `site_id=eq.${siteId}` } : {}),
        },
        (payload) => {
          mutate(apiUrl)
          if (onNewOrderRef.current) {
            const o = payload.new as {
              id: string; employee_id: string; employee_name: string
              status: Order["status"]; created_at: string; notes?: string
              site_id?: string; site_name?: string
            }
            onNewOrderRef.current({
              id:           o.id,
              employeeId:   o.employee_id,
              employeeName: o.employee_name,
              status:       o.status,
              createdAt:    new Date(o.created_at),
              notes:        o.notes,
              siteId:       o.site_id,
              siteName:     o.site_name,
              items:        [],
              total:        0,
            })
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          ...(siteId ? { filter: `site_id=eq.${siteId}` } : {}),
        },
        (payload) => {
          mutate(apiUrl)
          if (onOrderUpdateRef.current) {
            const o = payload.new as {
              id: string; employee_id: string; employee_name: string
              status: Order["status"]; created_at: string; notes?: string
            }
            onOrderUpdateRef.current({
              id:           o.id,
              employeeId:   o.employee_id,
              employeeName: o.employee_name,
              status:       o.status,
              createdAt:    new Date(o.created_at),
              notes:        o.notes,
              items:        [],
              total:        0,
            })
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "orders",
        },
        () => { mutate(apiUrl) }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [apiUrl, siteId])

  const orders: Order[] = (data?.orders || []).map((order) => ({
    ...order,
    createdAt: new Date(order.createdAt),
  }))

  return {
    orders,
    isLoading,
    error,
    refetch: () => mutate(apiUrl),
  }
}

// ── Employee orders (unchanged) ───────────────────────────────────────────────
export function useEmployeeOrders(employeeId: string) {
  const apiUrl = employeeId ? `/api/orders?employeeId=${employeeId}` : null

  const { data, error, isLoading } = useSWR<{ orders: Order[] }>(
    apiUrl,
    fetcher,
    { refreshInterval: 0, revalidateOnFocus: true }
  )

  useEffect(() => {
    if (!employeeId) return

    const channel = supabase
      .channel(`employee-orders-${employeeId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `employee_id=eq.${employeeId}`,
        },
        () => { if (apiUrl) mutate(apiUrl) }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [employeeId, apiUrl])

  const orders: Order[] = (data?.orders || []).map((order) => ({
    ...order,
    createdAt: new Date(order.createdAt),
  }))

  return {
    orders,
    isLoading,
    error,
    refetch: () => apiUrl && mutate(apiUrl),
  }
}

// ── KPI stats (unchanged) ─────────────────────────────────────────────────────
export function useKPIStats() {
  const { data, error, isLoading } = useSWR("/api/kpi", fetcher, {
    refreshInterval: 30000,
    revalidateOnFocus: true,
  })

  useEffect(() => {
    const channel = supabase
      .channel("kpi-updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => { mutate("/api/kpi") }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  return {
    stats: data,
    isLoading,
    error,
    refetch: () => mutate("/api/kpi"),
  }
}
