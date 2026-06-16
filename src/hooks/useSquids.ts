import { useCallback, useEffect, useRef, useState } from "react"
import { config } from "../config"
import { Squid } from "../types"

// How often the squid list is refreshed to show live indexing progress.
export const POLL_INTERVAL_MS = 3000

export const useSquids = (
  showMessage: (message: string, type: "success" | "error") => void
) => {
  const [squids, setSquids] = useState<Squid[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [isPolling, setIsPolling] = useState(true)
  // Guards against overlapping requests when a refresh is slower than the interval.
  const isFetchingRef = useRef(false)

  const fetchSquids = useCallback(
    async (isBackground = false) => {
      // Only background polls yield to an in-flight request. The foreground load
      // must always run so the initial spinner is cleared even if a poll is active.
      if (isBackground && isFetchingRef.current) {
        return
      }
      isFetchingRef.current = true
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
      } catch (err) {
        // Background polls keep the last good data and stay quiet to avoid
        // replacing the table and spamming the snackbar on transient errors.
        if (!isBackground) {
          setError("Failed to fetch squids")
          showMessage("Failed to fetch squids", "error")
        }
      } finally {
        // Only the foreground load drives the spinner; polls leave it untouched.
        if (!isBackground) {
          setLoading(false)
        }
        isFetchingRef.current = false
      }
    },
    [showMessage]
  )

  // Initial load.
  useEffect(() => {
    fetchSquids()
  }, [fetchSquids])

  // Auto-refresh to surface live indexing progress.
  useEffect(() => {
    if (!isPolling) {
      return
    }
    const intervalId = setInterval(() => {
      fetchSquids(true)
    }, POLL_INTERVAL_MS)
    return () => clearInterval(intervalId)
  }, [isPolling, fetchSquids])

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
    error,
    lastUpdated,
    isPolling,
    setIsPolling,
    promoteSquid,
    stopSquid,
    fetchSquids,
  }
}
