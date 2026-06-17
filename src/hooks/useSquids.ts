import { useCallback, useEffect, useRef, useState } from "react"
import { config } from "../config"
import { Squid } from "../types"

export const useSquids = (
  showMessage: (message: string, type: "success" | "error") => void
) => {
  const [squids, setSquids] = useState<Squid[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  // Guards against overlapping requests (e.g. double-clicking refresh while a
  // slow /list is still in flight).
  const isFetchingRef = useRef(false)
  // Tracks whether we ever loaded data, so a failed refresh keeps showing it.
  const hasLoadedRef = useRef(false)

  const fetchSquids = useCallback(async () => {
    if (isFetchingRef.current) {
      return
    }
    isFetchingRef.current = true
    setRefreshing(true)
    try {
      const response = await fetch(
        `${config.get("SQUID_MANAGEMENT_SERVER")}/list`,
        {
          credentials: "include",
        }
      )
      if (!response.ok) {
        throw new Error("Failed to fetch squids")
      }
      const data: Squid[] = await response.json()
      setSquids(
        data.sort((a, b) => a.service_name.localeCompare(b.service_name))
      )
      setError(null)
      setLastUpdated(new Date())
      hasLoadedRef.current = true
    } catch (err) {
      showMessage("Failed to fetch squids", "error")
      // Only block the view with an error when there is nothing to show yet;
      // a failed manual refresh keeps the last good data on screen.
      if (!hasLoadedRef.current) {
        setError("Failed to fetch squids")
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
      isFetchingRef.current = false
    }
  }, [showMessage])

  // Initial load. Afterwards the list is only refreshed on demand.
  useEffect(() => {
    fetchSquids()
  }, [fetchSquids])

  const promoteSquid = async (id: string): Promise<void> => {
    try {
      const response = await fetch(
        `${config.get("SQUID_MANAGEMENT_SERVER")}/${id}/promote`,
        { method: "PUT", credentials: "include" }
      )
      if (!response.ok) {
        throw new Error("Failed to promote squid")
      }
      showMessage(`Squid ${id} promoted successfully!`, "success")
      fetchSquids()
    } catch (err) {
      showMessage(`Failed to promote squid: ${id}`, "error")
    }
  }

  const stopSquid = async (id: string): Promise<void> => {
    try {
      const response = await fetch(
        `${config.get("SQUID_MANAGEMENT_SERVER")}/${id}/stop`,
        { method: "PUT", credentials: "include" }
      )
      if (!response.ok) {
        throw new Error("Failed to stop squid")
      }
      showMessage(
        `Squid ${id} stop triggered! Wait a couple of minutes for the squid to stop.`,
        "success"
      )
    } catch (err) {
      showMessage(`Failed to stop squid: ${id}`, "error")
    }
  }

  return {
    squids,
    loading,
    refreshing,
    error,
    lastUpdated,
    promoteSquid,
    stopSquid,
    fetchSquids,
  }
}
