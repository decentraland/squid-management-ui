import { Fragment, useRef, useState } from "react"
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
import { Squid } from "../types"
import { getGraphQLEndpoint } from "../utils"

interface SquidsTableProps {
  squids: Squid[]
}

const parseProjectName = (name: string): string =>
  name.split("-squid-server-")[0]

const renderStatusBadge = (status: string, color: string): JSX.Element => (
  <Chip label={status} size="small" sx={{ bgcolor: color, color: "#fff" }} />
)

const SquidsTable: React.FC<SquidsTableProps> = ({ squids }) => {
  const [selectedSquid, setSelectedSquid] = useState<string | null>(null)
  const menuAnchorRefs = useRef<{ [key: string]: HTMLElement | null }>({})
  const open = Boolean(selectedSquid)

  const handleMenuOpen = (squidName: string) => {
    setSelectedSquid(squidName)
  }

  const handleMenuClose = () => {
    setSelectedSquid(null)
  }

  const [isOpen, setIsOpen] = useState(false)

  return (
    <TableContainer component={Paper} elevation={3}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell />
            {[
              "Project",
              "Service Name",
              "Status",
              "Last Block Processed",
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
                    onClick={() => setIsOpen(!isOpen)}
                  >
                    {isOpen ? (
                      <KeyboardArrowUpIcon />
                    ) : (
                      <KeyboardArrowDownIcon />
                    )}
                  </IconButton>
                </TableCell>
                <TableCell>{parseProjectName(squid.name)}</TableCell>
                <TableCell>{squid.service_name}</TableCell>
                <TableCell>
                  {renderStatusBadge(
                    squid.metrics.ETHEREUM.sqd_processor_sync_eta_seconds === 0
                      ? "Synced"
                      : "Indexing",
                    "green"
                  )}
                </TableCell>
                <TableCell>
                  {squid.metrics.ETHEREUM.sqd_processor_last_block} /{" "}
                  {squid.metrics.ETHEREUM.sqd_processor_chain_height}
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
                  colSpan={7}
                >
                  <Collapse in={isOpen} timeout="auto" unmountOnExit>
                    <Box sx={{ margin: 1 }}>
                      <Typography variant="h6" gutterBottom component="div">
                        Details
                      </Typography>
                      <Table size="small" aria-label="details">
                        <TableHead>
                          <TableRow>
                            <TableCell>Schema Name</TableCell>
                            <TableCell>Project Active Schema</TableCell>
                            <TableCell>Speed</TableCell>
                            <TableCell>Version</TableCell>
                            <TableCell>Created At</TableCell>
                            <TableCell>Service Health</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow>
                            <TableCell>{squid.schema_name}</TableCell>
                            <TableCell>{squid.project_active_schema}</TableCell>
                            <TableCell>
                              {squid.metrics.ETHEREUM.sqd_processor_mapping_blocks_per_second.toFixed(
                                2
                              )}{" "}
                              blocks/s
                            </TableCell>
                            <TableCell>{squid.version}</TableCell>
                            <TableCell>
                              {new Date(squid.created_at).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              {renderStatusBadge(squid.health_status, "blue")}
                            </TableCell>
                          </TableRow>
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
        <MenuItem onClick={handleMenuClose}>Promote to Prod</MenuItem>
        <MenuItem onClick={handleMenuClose}>Stop</MenuItem>
      </Menu>
    </TableContainer>
  )
}

export default SquidsTable
