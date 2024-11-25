import MenuIcon from "@mui/icons-material/Menu"
import { AppBar, IconButton, Toolbar, Typography } from "@mui/material"

interface TopBarProps {
  handleDrawerToggle: () => void
  drawerWidth: number
}

const TopBar: React.FC<TopBarProps> = ({ handleDrawerToggle, drawerWidth }) => {
  return (
    <AppBar
      position="fixed"
      sx={{
        width: { sm: `calc(100% - ${drawerWidth}px)` },
        ml: { sm: `${drawerWidth}px` },
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ mr: 2, display: { sm: "none" } }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" noWrap>
          Decentraland Squid Management
        </Typography>
      </Toolbar>
    </AppBar>
  )
}

export default TopBar
