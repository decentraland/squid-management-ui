import { useEffect, useState } from "react"
import { config } from "../config"
import { Squid } from "../types"

export const useSquids = () => {
  const [squids, setSquids] = useState<Squid[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSquids = async () => {
      try {
        const response = await fetch(
          `${config.get("SQUID_MANAGEMENT_SERVER")}/list`
        )
        const data: Squid[] = await response.json()
        setSquids(data)
      } catch (err) {
        setError("Failed to fetch squids")
      } finally {
        setLoading(false)
      }
    }

    fetchSquids()
  }, [])

  return { squids, loading, error }
}
