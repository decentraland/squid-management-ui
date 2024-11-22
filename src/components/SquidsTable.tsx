import { Fragment, useRef, useState } from "react"
import { Network } from "@dcl/schemas"
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown"
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp"
import MoreVertIcon from "@mui/icons-material/MoreVert"
import OpenInNewIcon from "@mui/icons-material/OpenInNew"
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
  Typography,
} from "decentraland-ui2"
import { Squid, SquidMetrics } from "../types"
import { getGraphQLEndpoint } from "../utils"

interface SquidsTableProps {
  squids: Squid[]
  promoteSquid: (id: string) => Promise<void>
  stopSquid: (id: string) => Promise<void>
}

const parseProjectName = (name: string): string =>
  name.split("-squid-server-")[0]

const renameNetwork = (network: Network): string => {
  return network === Network.MATIC ? "POLYGON" : network
}

const renderStatusBadge = (status: string, color: string): JSX.Element => (
  <Chip label={status} size="small" sx={{ bgcolor: color, color: "#fff" }} />
)

const SquidsTable: React.FC<SquidsTableProps> = ({
  squids,
  promoteSquid,
  stopSquid,
}) => {
  const [selectedSquid, setSelectedSquid] = useState<string | null>(null)

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

  const handleMenuOpen = (squidName: string) => {
    setSelectedSquid(squidName)
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

  return (
    <TableContainer component={Paper} elevation={3}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell />
            {[
              "Project",
              "Service Name",
              "Status (Chains)",
              "GraphQL",
              "Actions",
            ].map((header) => (
              <TableCell
                key={header}
                sx={{ fontWeight: "600", textTransform: "uppercase" }}
              >
                {header}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {squids.map((squid) => (
            <Fragment key={squid.name}>
              <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
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
                  <strong>{parseProjectName(squid.name)}</strong>
                </TableCell>
                <TableCell>{squid.service_name}</TableCell>
                <TableCell>
                  {Object.entries(squid.metrics).map(
                    ([chain, chainMetrics]) => (
                      <div key={chain} style={{ marginBottom: "4px" }}>
                        <strong style={{ paddingRight: 8 }}>
                          {renameNetwork(chain as Network)}:
                        </strong>
                        {renderStatusBadge(
                          chainMetrics.sqd_processor_sync_eta_seconds === 0
                            ? "Synced"
                            : "Indexing",
                          chainMetrics.sqd_processor_sync_eta_seconds === 0
                            ? "green"
                            : "orange"
                        )}
                      </div>
                    )
                  )}
                </TableCell>
                <TableCell>
                  <IconButton
                    component="a"
                    href={getGraphQLEndpoint(squid.service_name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="open GraphQL"
                  >
                    <OpenInNewIcon />
                  </IconButton>
                </TableCell>
                <TableCell>
                  <IconButton
                    aria-label="more"
                    onClick={() => handleMenuOpen(squid.name)}
                    ref={(el) => (menuAnchorRefs.current[squid.name] = el)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell
                  style={{ paddingBottom: 0, paddingTop: 0 }}
                  colSpan={6}
                >
                  <Collapse
                    in={isOpen[squid.name]}
                    timeout="auto"
                    unmountOnExit
                  >
                    <Box sx={{ margin: 1 }}>
                      <Typography variant="h6" gutterBottom component="div">
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
                                {squid.schema_name ===
                                squid.project_active_schema
                                  ? "YES"
                                  : "NO"}
                              </Box>
                              <Box sx={{ marginBottom: 1 }}>
                                <strong>Project Active Schema:</strong>{" "}
                                {squid.project_active_schema}
                              </Box>
                              <Box sx={{ marginBottom: 1 }}>
                                <strong>Version:</strong> {squid.version}
                              </Box>
                              <Box>
                                <strong>Created At:</strong>{" "}
                                {new Date(squid.created_at).toLocaleString()}
                              </Box>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
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
                            <TableCell>Sync ETA (Seconds)</TableCell>
                            <TableCell>Speed</TableCell>
                            <TableCell>Last Block Processed</TableCell>
                            <TableCell>Status</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {renderChainData(squid.metrics, Network.ETHEREUM)}
                          {renderChainData(squid.metrics, Network.MATIC)}
                        </TableBody>
                      </Table>
                    </Box>
                  </Collapse>
                </TableCell>
              </TableRow>
            </Fragment>
          ))}
        </TableBody>
      </Table>
      <Menu
        anchorEl={selectedSquid ? menuAnchorRefs.current[selectedSquid] : null}
        open={open}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => !!selectedSquid && handlePromote(selectedSquid)}
        >
          Promote to Prod
        </MenuItem>
        <MenuItem onClick={() => !!selectedSquid && handleStop(selectedSquid)}>
          Stop
        </MenuItem>
      </Menu>
    </TableContainer>
  )
}

export default SquidsTable
