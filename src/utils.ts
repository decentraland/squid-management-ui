import { Env } from "@dcl/ui-env"
import { config } from "./config"

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
