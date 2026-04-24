"use client"

import { useEffect, useCallback, useRef } from "react"
import useSWR, { mutate } from "swr"
import { supabase } from "@/lib/supabase"
import type { Order } from "@/lib/types"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export interface UseRealtimeOrdersOptions {
  statuses?: Order["status"][]
  onNewOrder?: (order: Order) => void
  onOrderUpdate?: (order: Order) => void
}

export function useRealtimeOrders(options: UseRealtimeOrdersOptions = {}) {
  const { statuses, onNewOrder, onOrderUpdate } = options
  const onNewOrderRef = useRef(onNewOrder)
  const onOrderUpdateRef = useRef(onOrderUpdate)

  // Keep refs updated
  useEffect(() => {
    onNewOrderRef.current = onNewOrder
    onOrderUpdateRef.current = onOrderUpdate
  }, [onNewOrder, onOrderUpdate])

  // Build the API URL with status filter
  const apiUrl = statuses
    ? `/api/orders?status=${statuses.join(",")}`
    : "/api/orders"

  // Fetch orders using SWR
  const { data, error, isLoading } = useSWR<{ orders: Order[] }>(
    apiUrl,
    fetcher,
    {
      refreshInterval: 0, // Disable polling, we use Supabase Realtime
      revalidateOnFocus: true,
    }
  )

  // Subscribe to Supabase Realtime
  useEffect(() => {
    const channel = supabase
      .channel("orders-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "orders",
        },
        (payload) => {
          // Refetch to get the full order with items
          mutate(apiUrl)
          if (onNewOrderRef.current) {
            // Transform the payload to Order type
            const newOrder = payload.new as {
              id: string
              employee_id: string
              employee_name: string
              status: Order["status"]
              created_at: string
              notes?: string
            }
            onNewOrderRef.current({
              id: newOrder.id,
              employeeId: newOrder.employee_id,
              employeeName: newOrder.employee_name,
              status: newOrder.status,
              createdAt: new Date(newOrder.created_at),
              notes: newOrder.notes,
              items: [],
              total: 0,
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
        },
        (payload) => {
          mutate(apiUrl)
          if (onOrderUpdateRef.current) {
            const updatedOrder = payload.new as {
              id: string
              employee_id: string
              employee_name: string
              status: Order["status"]
              created_at: string
              notes?: string
            }
            onOrderUpdateRef.current({
              id: updatedOrder.id,
              employeeId: updatedOrder.employee_id,
              employeeName: updatedOrder.employee_name,
              status: updatedOrder.status,
              createdAt: new Date(updatedOrder.created_at),
              notes: updatedOrder.notes,
              items: [],
              total: 0,
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
        () => {
          mutate(apiUrl)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [apiUrl])

  // Parse dates in orders
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

// Hook for employee to track their own orders with realtime updates
export function useEmployeeOrders(employeeId: string) {
  const apiUrl = employeeId ? `/api/orders?employeeId=${employeeId}` : null

  const { data, error, isLoading } = useSWR<{ orders: Order[] }>(
    apiUrl,
    fetcher,
    {
      refreshInterval: 0,
      revalidateOnFocus: true,
    }
  )

  // Subscribe to updates for this employee's orders
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
        () => {
          if (apiUrl) mutate(apiUrl)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
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

// Hook to get KPI stats with realtime updates
export function useKPIStats() {
  const { data, error, isLoading } = useSWR("/api/kpi", fetcher, {
    refreshInterval: 30000, // Refresh every 30 seconds
    revalidateOnFocus: true,
  })

  // Subscribe to order changes to refresh KPIs
  useEffect(() => {
    const channel = supabase
      .channel("kpi-updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        () => {
          mutate("/api/kpi")
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return {
    stats: data,
    isLoading,
    error,
    refetch: () => mutate("/api/kpi"),
  }
}
