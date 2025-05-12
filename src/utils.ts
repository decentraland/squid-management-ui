import { Network } from "@dcl/schemas"
import { Env } from "@dcl/ui-env"
import { config } from "./config"
import { Squid } from "./types"

/**
 * Generates the GraphQL endpoint URL based on the service name.
 * @param serviceName The name of the squid service
 * @returns The GraphQL endpoint URL
 */
export const getGraphQLEndpoint = (serviceName: string): string => {
  const isDev = config.is(Env.DEVELOPMENT)
  const baseDomain = isDev ? "decentraland.zone" : "decentraland.org"

  // Extract the part of the service name before "-blue"
  const [servicePrefix] = serviceName.split("-blue")

  return `https://${servicePrefix}.${baseDomain}/graphql`
}

/**
 * Extract project name from a squid service name
 * @param name The squid service name
 * @returns The project name
 */
export const parseProjectName = (name: string): string =>
  name.split("-squid-server-")[0]

/**
 * Checks if a project has any LIVE service
 * @param squids All squids in the system
 * @param projectName The project name to check
 * @returns true if the project has at least one LIVE service
 */
export const hasLiveService = (
  squids: Squid[],
  projectName: string
): boolean => {
  return squids
    .filter((squid) => parseProjectName(squid.name) === projectName)
    .some((squid) => squid.schema_name === squid.project_active_schema)
}

/**
 * Determines if a squid should run on multiple chains or a single chain
 * @param serviceName The name of the squid service
 * @returns Object containing expected networks for the squid
 */
export const getExpectedNetworks = (serviceName: string): Network[] => {
  // Credits squid only runs on Polygon
  if (serviceName.includes("credits")) {
    return [Network.MATIC]
  }

  // All other squids should run on both networks
  return [Network.ETHEREUM, Network.MATIC]
}

/**
 * Determines if a squid is fully operational, indexing, partially working, or stopped
 * @param squid The squid object to evaluate
 * @returns Status indicating operational state
 */
export const getSquidOperationalStatus = (
  squid: Squid
): "fully-operational" | "indexing" | "partially-working" | "stopped" => {
  // If service is not running at all
  if (Object.keys(squid.metrics).length === 0) {
    return "stopped"
  }

  const expectedNetworks = getExpectedNetworks(squid.service_name)
  const activeNetworks = Object.keys(squid.metrics) as Network[]

  // Check if all expected networks are active
  const isFullyOperational = expectedNetworks.every((network) =>
    activeNetworks.includes(network)
  )

  // Check if any network is still indexing
  const isAnyNetworkIndexing = Object.values(squid.metrics).some(
    (metrics) => metrics.sqd_processor_sync_eta_seconds > 0
  )

  if (isAnyNetworkIndexing) {
    return "indexing"
  }

  if (isFullyOperational) {
    return "fully-operational"
  }

  // If some networks are active but not all
  if (activeNetworks.length > 0) {
    return "partially-working"
  }

  return "stopped"
}
