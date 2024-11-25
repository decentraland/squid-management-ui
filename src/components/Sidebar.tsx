import {
  Box,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
} from "@mui/material"
import SquidLogo from "../squid.svg?react"

interface SidebarProps {
  drawerWidth: number
  mobileOpen: boolean
  handleDrawerToggle: () => void
}

const Sidebar: React.FC<SidebarProps> = ({
  drawerWidth,
  mobileOpen,
  handleDrawerToggle,
}) => {
  const drawer = (
    <div>
      <Toolbar />
      <Divider />
      <List>
        <ListItemButton selected>
          <ListItemIcon>
            <SquidLogo width={24} height={24} fill="white" />
          </ListItemIcon>
          <ListItemText
            primary="Squids"
            sx={{ fontWeight: 600, fontSize: "0.875rem" }}
          />
        </ListItemButton>
      </List>
    </div>
  )

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      aria-label="squid management options"
    >
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: drawerWidth,
          },
        }}
      >
        {drawer}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", sm: "block" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: drawerWidth,
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  )
}

export default Sidebar
