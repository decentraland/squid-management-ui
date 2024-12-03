import { useEffect, useState } from "react"
import { config } from "../config"
import { Squid } from "../types"

export const useSquids = (
  showMessage: (message: string, type: "success" | "error") => void
) => {
  const [squids, setSquids] = useState<Squid[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSquids = async () => {
    try {
      const response = await fetch(
        `${config.get("SQUID_MANAGEMENT_SERVER")}/list`,
        {
          credentials: "include",
        }
      )
      const data: Squid[] = await response.json()
      setSquids(
        data.sort((a, b) => a.service_name.localeCompare(b.service_name))
      )
    } catch (err) {
      setError("Failed to fetch squids")
      showMessage("Failed to fetch squids", "error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSquids()
  }, [showMessage])

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

  return { squids, loading, error, promoteSquid, stopSquid, fetchSquids }
}
