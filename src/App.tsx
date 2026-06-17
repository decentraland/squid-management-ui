import { useCallback, useState } from "react"
import { Env } from "@dcl/ui-env"
import RefreshIcon from "@mui/icons-material/Refresh"
import { ThemeProvider, dark } from "decentraland-ui2/dist/theme"
import {
  Alert,
  Box,
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
import { useSquids } from "./hooks/useSquids"

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
    refreshing,
    error,
    lastUpdated,
    promoteSquid,
    stopSquid,
    fetchSquids,
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
              <Tooltip title={refreshing ? "Refreshing…" : "Refresh"}>
                <span>
                  <IconButton
                    size="small"
                    onClick={() => fetchSquids()}
                    disabled={refreshing}
                    aria-label="refresh"
                  >
                    {refreshing ? (
                      <CircularProgress size={18} />
                    ) : (
                      <RefreshIcon />
                    )}
                  </IconButton>
                </span>
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
