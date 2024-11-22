import { useState } from "react"
import { ThemeProvider, dark } from "decentraland-ui2/dist/theme"
import { Box, CircularProgress, Toolbar, Typography } from "@mui/material"
import Sidebar from "./components/Sidebar"
import SquidsTable from "./components/SquidsTable"
import TopBar from "./components/TopBar"
import { useSquids } from "./hooks/useSquids"

const drawerWidth = 240

const App = () => {
  const { squids, loading, error } = useSquids()
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
          {loading && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
              }}
            >
              <CircularProgress />
            </Box>
          )}
          {error && <Typography color="error">{error}</Typography>}
          {!loading && !error && <SquidsTable squids={squids} />}
        </Box>
      </Box>
    </ThemeProvider>
  )
}

export { App }
