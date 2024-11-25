import { Network } from "@dcl/schemas"

export interface SquidMetrics {
  sqd_processor_sync_eta_seconds: number
  sqd_processor_mapping_blocks_per_second: number
  sqd_processor_last_block: number
  sqd_processor_chain_height: number
}

export interface Squid {
  name: string
  service_name: string
  schema_name: string
  project_active_schema: string
  metrics: {
    [Network.ETHEREUM]: SquidMetrics
    [Network.MATIC]: SquidMetrics
  }
  version: number
  created_at: string
  health_status: string
  service_status: string
}
