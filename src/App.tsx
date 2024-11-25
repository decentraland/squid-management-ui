import { useCallback, useState } from "react"
import { ThemeProvider, dark } from "decentraland-ui2/dist/theme"
import { Alert, Box, Snackbar, Toolbar, Typography } from "@mui/material"
import Sidebar from "./components/Sidebar"
import SquidsTable from "./components/SquidsTable"
import TopBar from "./components/TopBar"
import { useSquids } from "./hooks/useSquids"

const drawerWidth = 240

const App = () => {
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

  const { squids, loading, error, promoteSquid, stopSquid } =
    useSquids(showMessage)
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
          <Typography variant="h5" gutterBottom sx={{ paddingBottom: 2 }}>
            Squids
          </Typography>
          {loading && <Typography>Loading...</Typography>}
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
