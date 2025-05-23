import { Fragment, useRef, useState } from "react"
import { Network } from "@dcl/schemas"
import { Env } from "@dcl/ui-env"
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown"
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp"
import MoreVertIcon from "@mui/icons-material/MoreVert"
import OpenInNewIcon from "@mui/icons-material/OpenInNew"
import WarningIcon from "@mui/icons-material/Warning"
import {
  Box,
  Chip,
  Collapse,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "decentraland-ui2"
import { config } from "../config"
import { Squid, SquidMetrics } from "../types"
import {
  getGraphQLEndpoint,
  getSquidOperationalStatus,
  hasLiveService,
  parseProjectName,
} from "../utils"

interface SquidsTableProps {
  squids: Squid[]
  promoteSquid: (id: string) => Promise<void>
  stopSquid: (id: string) => Promise<void>
}

// Row background colors based on operational status
const ROW_BACKGROUND_COLORS = {
  "fully-operational": "rgba(46, 204, 113, 0.1)", // Light green for fully operational
  "partially-working": "rgba(241, 196, 15, 0.1)", // Light yellow for partially working
  stopped: "rgba(231, 76, 60, 0.1)", // Light red for stopped
  indexing: "rgba(241, 196, 15, 0.1)", // Light yellow for indexing
}

// No live service background color
const NO_LIVE_SERVICE_COLOR = "rgba(241, 196, 15, 0.1)" // Light yellow

// Project header styling
const PROJECT_HEADER_STYLE = {
  backgroundColor: "#333",
  padding: "12px 16px",
  fontWeight: "bold",
  fontSize: "1rem",
  borderTop: "1px solid #444",
  borderBottom: "1px solid #444",
  position: "relative",
}

// Project name text styling
const PROJECT_NAME_STYLE = {
  textTransform: "uppercase",
  letterSpacing: "0.5px",
}

// Warning icon styling
const WARNING_ICON_STYLE = {
  color: "orange",
  fontSize: "1.2rem",
  verticalAlign: "middle",
  marginRight: 8,
  position: "absolute",
  left: -24,
  top: "50%",
  transform: "translateY(-50%)",
}

const renameNetwork = (network: Network): string => {
  const isDev = config.is(Env.DEVELOPMENT)
  return network === Network.MATIC
    ? `POLYGON ${isDev ? "AMOY" : ""}`
    : `${network} ${isDev ? "SEPOLIA" : ""}`
}

const renderStatusBadge = (status: string, color: string): JSX.Element => (
  <Chip label={status} size="small" sx={{ bgcolor: color, color: "#fff" }} />
)

const getRelativeTime = (date: string): string => {
  const now = new Date()
  const past = new Date(date)
  const diffMs = now.getTime() - past.getTime()
  const diffMins = Math.floor(diffMs / (60 * 1000))
  const diffHours = Math.floor(diffMs / (60 * 60 * 1000))
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000))
  const diffWeeks = Math.floor(diffDays / 7)
  const diffMonths = Math.floor(diffDays / 30)
  const diffYears = Math.floor(diffDays / 365)

  if (diffMins < 60) return `${diffMins} minutes ago`
  if (diffHours < 24) return `${diffHours} hours ago`
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffWeeks < 4) return `${diffWeeks} weeks ago`
  if (diffMonths < 12) return `${diffMonths} months ago`
  return `${diffYears} years ago`
}

const SquidsTable: React.FC<SquidsTableProps> = ({
  squids,
  promoteSquid,
  stopSquid,
}) => {
  const [selectedSquid, setSelectedSquid] = useState<Squid | null>(null)

  const handlePromote = (id: string) => {
    promoteSquid(id)
    setSelectedSquid(null)
  }

  const handleStop = (id: string) => {
    stopSquid(id)
    setSelectedSquid(null)
  }
  const menuAnchorRefs = useRef<{ [key: string]: HTMLElement | null }>({})
  const open = Boolean(selectedSquid)

  const handleMenuOpen = (squid: Squid) => {
    setSelectedSquid(squid)
  }

  const handleMenuClose = () => {
    setSelectedSquid(null)
  }

  const [isOpen, setIsOpen] = useState<{ [key: string]: boolean }>({})

  const toggleRow = (squidName: string) => {
    setIsOpen((prev) => ({
      ...prev,
      [squidName]: !prev[squidName],
    }))
  }

  const renderChainData = (
    metrics: {
      [Network.ETHEREUM]: SquidMetrics
      [Network.MATIC]: SquidMetrics
    },
    chain: Network.ETHEREUM | Network.MATIC
  ) => {
    const chainMetrics = metrics[chain]
    if (!chainMetrics) return null

    return (
      <TableRow>
        <TableCell>{renameNetwork(chain)}</TableCell>
        <TableCell>{chainMetrics.sqd_processor_sync_eta_seconds}s</TableCell>
        <TableCell>
          {chainMetrics.sqd_processor_mapping_blocks_per_second.toFixed(2)}{" "}
          blocks/s
        </TableCell>
        <TableCell>
          {chainMetrics.sqd_processor_last_block} /{" "}
          {chainMetrics.sqd_processor_chain_height}
        </TableCell>
        <TableCell>
          {renderStatusBadge(
            chainMetrics.sqd_processor_sync_eta_seconds === 0
              ? "Synced"
              : "Indexing",
            chainMetrics.sqd_processor_sync_eta_seconds === 0
              ? "green"
              : "orange"
          )}
        </TableCell>
      </TableRow>
    )
  }

  // Group squids by project
  const projectGroups = squids.reduce(
    (groups, squid) => {
      const projectName = parseProjectName(squid.name)
      if (!groups[projectName]) {
        groups[projectName] = []
      }
      groups[projectName].push(squid)
      return groups
    },
    {} as Record<string, Squid[]>
  )

  return (
    <TableContainer component={Paper} elevation={3}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell sx={{ fontWeight: "600", textTransform: "uppercase" }}>
              SERVICE NAME
            </TableCell>
            <TableCell sx={{ fontWeight: "600", textTransform: "uppercase" }}>
              STATUS (CHAINS)
            </TableCell>
            <TableCell sx={{ fontWeight: "600", textTransform: "uppercase" }}>
              GRAPHQL
            </TableCell>
            <TableCell sx={{ fontWeight: "600", textTransform: "uppercase" }}>
              ACTIONS
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Object.entries(projectGroups).map(([projectName, projectSquids]) => {
            const projectHasLiveService = hasLiveService(squids, projectName)

            return (
              <Fragment key={projectName}>
                {/* Project header row */}
                <TableRow>
                  <TableCell width="48px" sx={PROJECT_HEADER_STYLE} />
                  <TableCell
                    colSpan={4}
                    sx={{ ...PROJECT_HEADER_STYLE, ...PROJECT_NAME_STYLE }}
                  >
                    {!projectHasLiveService && (
                      <Tooltip
                        title="This project doesn't have a promoted version"
                        arrow
                      >
                        <WarningIcon sx={WARNING_ICON_STYLE} />
                      </Tooltip>
                    )}
                    {projectName}
                  </TableCell>
                </TableRow>

                {/* Service rows */}
                {projectSquids.map((squid) => {
                  const isServiceRunning = Object.keys(squid.metrics).length > 0
                  const operationalStatus = getSquidOperationalStatus(squid)

                  // Determine background color
                  const backgroundColor = !projectHasLiveService
                    ? NO_LIVE_SERVICE_COLOR
                    : ROW_BACKGROUND_COLORS[operationalStatus]

                  return (
                    <Fragment key={squid.name}>
                      <TableRow sx={{ backgroundColor }}>
                        <TableCell>
                          <IconButton
                            aria-label="expand row"
                            size="small"
                            onClick={() => toggleRow(squid.name)}
                          >
                            {isOpen[squid.name] ? (
                              <KeyboardArrowUpIcon />
                            ) : (
                              <KeyboardArrowDownIcon />
                            )}
                          </IconButton>
                        </TableCell>
                        <TableCell>
                          <>
                            {squid.service_name}
                            {squid.schema_name ===
                            squid.project_active_schema ? (
                              <Chip
                                label={"LIVE"}
                                sx={{
                                  backgroundColor: "green",
                                  color: "white",
                                  fontWeight: "bold",
                                  marginLeft: "8px",
                                }}
                                size="small"
                              />
                            ) : !isServiceRunning ? (
                              <Chip
                                label={"STOPPED"}
                                sx={{
                                  backgroundColor: "red",
                                  color: "white",
                                  fontWeight: "bold",
                                  marginLeft: "8px",
                                }}
                                size="small"
                              />
                            ) : null}
                          </>
                        </TableCell>
                        <TableCell>
                          {Object.entries(squid.metrics).map(
                            ([chain, chainMetrics]) => (
                              <div key={chain} style={{ marginBottom: "4px" }}>
                                <strong style={{ paddingRight: 8 }}>
                                  {renameNetwork(chain as Network)}:
                                </strong>
                                {renderStatusBadge(
                                  chainMetrics.sqd_processor_sync_eta_seconds ===
                                    0
                                    ? "Synced"
                                    : "Indexing",
                                  chainMetrics.sqd_processor_sync_eta_seconds ===
                                    0
                                    ? "green"
                                    : "orange"
                                )}
                              </div>
                            )
                          )}
                        </TableCell>
                        <TableCell>
                          {isServiceRunning ? (
                            <IconButton
                              component="a"
                              href={getGraphQLEndpoint(squid.service_name)}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label="open GraphQL"
                            >
                              <OpenInNewIcon />
                            </IconButton>
                          ) : null}
                        </TableCell>
                        <TableCell>
                          {isServiceRunning ? (
                            <IconButton
                              aria-label="more"
                              onClick={() => handleMenuOpen(squid)}
                              ref={(el) =>
                                (menuAnchorRefs.current[squid.name] = el)
                              }
                            >
                              <MoreVertIcon />
                            </IconButton>
                          ) : null}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell
                          style={{ paddingBottom: 0, paddingTop: 0 }}
                          colSpan={5}
                        >
                          <Collapse
                            in={isOpen[squid.name]}
                            timeout="auto"
                            unmountOnExit
                          >
                            <Box sx={{ margin: 1 }}>
                              <Typography
                                variant="h6"
                                gutterBottom
                                component="div"
                              >
                                Schema Data
                              </Typography>
                              <Table size="small" aria-label="schema-data">
                                <TableBody>
                                  <TableRow>
                                    <TableCell sx={{ paddingBottom: 3 }}>
                                      <Box sx={{ marginBottom: 1 }}>
                                        <strong>Writing to Schema:</strong>{" "}
                                        {squid.schema_name}
                                      </Box>
                                      <Box sx={{ marginBottom: 1 }}>
                                        <strong>Is Active Schema:</strong>{" "}
                                        <Chip
                                          label={
                                            squid.schema_name ===
                                            squid.project_active_schema
                                              ? "YES"
                                              : "NO"
                                          }
                                          sx={{
                                            backgroundColor:
                                              squid.schema_name ===
                                              squid.project_active_schema
                                                ? "green"
                                                : "red",
                                            color: "white",
                                            fontWeight: "bold",
                                          }}
                                          size="small"
                                        />
                                      </Box>
                                      <Box sx={{ marginBottom: 1 }}>
                                        <strong>Project Active Schema:</strong>{" "}
                                        {squid.project_active_schema}
                                      </Box>
                                      <Box sx={{ marginBottom: 1 }}>
                                        <strong>Version:</strong>{" "}
                                        {squid.version}
                                      </Box>
                                      <Box>
                                        <strong>Created At:</strong>{" "}
                                        {squid.created_at
                                          ? `${new Date(
                                              squid.created_at
                                            ).toLocaleString()} (${getRelativeTime(squid.created_at)})`
                                          : "-"}
                                      </Box>
                                    </TableCell>
                                  </TableRow>
                                </TableBody>
                              </Table>
                              {isServiceRunning ? (
                                <Box mb={4}>
                                  <Typography
                                    variant="h6"
                                    gutterBottom
                                    component="div"
                                    sx={{ paddingTop: 3 }}
                                  >
                                    Chain Data
                                  </Typography>
                                  <Table size="small" aria-label="chain-data">
                                    <TableHead>
                                      <TableRow>
                                        <TableCell>Chain</TableCell>
                                        <TableCell>
                                          Sync ETA (Seconds)
                                        </TableCell>
                                        <TableCell>Speed</TableCell>
                                        <TableCell>
                                          Last Block Processed
                                        </TableCell>
                                        <TableCell>Status</TableCell>
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {renderChainData(
                                        squid.metrics,
                                        Network.ETHEREUM
                                      )}
                                      {renderChainData(
                                        squid.metrics,
                                        Network.MATIC
                                      )}
                                    </TableBody>
                                  </Table>
                                </Box>
                              ) : null}
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </Fragment>
                  )
                })}
              </Fragment>
            )
          })}
        </TableBody>
      </Table>
      <Menu
        anchorEl={
          selectedSquid ? menuAnchorRefs.current[selectedSquid.name] : null
        }
        open={open}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => !!selectedSquid && handlePromote(selectedSquid.name)}
          disabled={
            selectedSquid?.schema_name === selectedSquid?.project_active_schema
          }
        >
          Promote to Prod
        </MenuItem>
        <MenuItem
          onClick={() => !!selectedSquid && handleStop(selectedSquid.name)}
          disabled={
            !selectedSquid?.metrics ||
            selectedSquid?.schema_name === selectedSquid?.project_active_schema
          }
        >
          Stop
        </MenuItem>
      </Menu>
    </TableContainer>
  )
}

export default SquidsTable
