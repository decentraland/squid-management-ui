import { useCallback, useState } from "react"
import { Env } from "@dcl/ui-env"
import PauseIcon from "@mui/icons-material/Pause"
import PlayArrowIcon from "@mui/icons-material/PlayArrow"
import { ThemeProvider, dark } from "decentraland-ui2/dist/theme"
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  IconButton,
  Snackbar,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material"
import Sidebar from "./components/Sidebar"
import SquidsTable from "./components/SquidsTable"
import TopBar from "./components/TopBar"
import { config } from "./config"
import { POLL_INTERVAL_MS, useSquids } from "./hooks/useSquids"

const drawerWidth = 240

const App = () => {
  const isDev = config.is(Env.DEVELOPMENT)
  const [snackbar, setSnackbar] = useState<{
    open: boolean
    message: string
    type: "success" | "error"
  }>({
    open: false,
    message: "",
    type: "success",
  })

  const showMessage = useCallback(
    (message: string, type: "success" | "error") => {
      setSnackbar({ open: true, message, type })
    },
    []
  )

  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }))
  }

  const {
    squids,
    loading,
    error,
    lastUpdated,
    isPolling,
    setIsPolling,
    promoteSquid,
    stopSquid,
  } = useSquids(showMessage)
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  return (
    <ThemeProvider theme={dark}>
      <Box sx={{ display: "flex", height: "100vh" }}>
        <TopBar
          handleDrawerToggle={handleDrawerToggle}
          drawerWidth={drawerWidth}
        />
        <Sidebar
          drawerWidth={drawerWidth}
          mobileOpen={mobileOpen}
          handleDrawerToggle={handleDrawerToggle}
        />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { sm: `calc(100% - ${drawerWidth}px)` },
          }}
        >
          <Toolbar />
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 1,
              paddingBottom: 2,
            }}
          >
            <Typography variant="h5">
              {isDev ? "Dev" : "Prod"} Squids
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {lastUpdated && (
                <Typography variant="caption" color="text.secondary">
                  Updated {lastUpdated.toLocaleTimeString()}
                </Typography>
              )}
              <Chip
                size="small"
                color={isPolling ? "success" : "default"}
                label={
                  isPolling
                    ? `Live · every ${POLL_INTERVAL_MS / 1000}s`
                    : "Paused"
                }
              />
              <Tooltip
                title={isPolling ? "Pause auto-refresh" : "Resume auto-refresh"}
              >
                <IconButton
                  size="small"
                  onClick={() => setIsPolling((prev) => !prev)}
                  aria-label={
                    isPolling ? "pause auto-refresh" : "resume auto-refresh"
                  }
                >
                  {isPolling ? <PauseIcon /> : <PlayArrowIcon />}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          {loading && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <CircularProgress />
            </Box>
          )}
          {error && <Typography color="error">{error}</Typography>}
          {!loading && !error && (
            <SquidsTable
              squids={squids}
              promoteSquid={promoteSquid}
              stopSquid={stopSquid}
            />
          )}
        </Box>
        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={handleSnackbarClose}
            severity={snackbar.type}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  )
}

export { App }
