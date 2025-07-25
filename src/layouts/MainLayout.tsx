import { memo, useCallback, useMemo, useState } from "react";
import { Outlet } from "react-router-dom";
import {
  ThemeProvider,
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  useTheme,
  useMediaQuery,
  Menu,
  MenuItem,
  CssBaseline,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import DashboardIcon from "@mui/icons-material/Dashboard";
import HomeIcon from "@mui/icons-material/Home";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import CurrencyBitcoinIcon from "@mui/icons-material/CurrencyBitcoin";
import BarChartIcon from "@mui/icons-material/BarChart"; // Import icon for Backtest
import DescriptionIcon from "@mui/icons-material/Description"; // Import icon for Bot Template
import AccountBalanceIcon from "@mui/icons-material/AccountBalance"; // Import icon for Trading Account
import { useAuth } from "@hooks/useAuth";
import { useNavigate } from "react-router-dom";
import theme from "../theme";
import autoTradeLogo from "../assets/autotrade68_logo.jpg";
import { areEqual } from "@/utils/common";

const drawerWidth = 240;

const MainLayout = () => {
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const userMenuOpen = Boolean(anchorEl);
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleDrawerOpen = useCallback(() => {
    setOpen(true);
  }, [setOpen]);

  const handleDrawerClose = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const handleUserMenuClick = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      setAnchorEl(event.currentTarget);
    },
    [setAnchorEl]
  );

  const handleUserMenuClose = useCallback(() => {
    setAnchorEl(null);
  }, [setAnchorEl]);

  const handleLogout = useCallback(() => {
    handleUserMenuClose();
    logout();
    navigate("/login");
  }, [handleUserMenuClose, logout, navigate]);

  const handleProfile = useCallback(() => {
    handleUserMenuClose();
    navigate("/profile");
  }, [handleUserMenuClose, navigate]);

  const handleSettings = useCallback(() => {
    handleUserMenuClose();
    navigate("/settings");
  }, [handleUserMenuClose, navigate]);

  const handleNavigation = useCallback(
    (path: string) => {
      navigate(path);
      if (isMobile) {
        setOpen(false);
      }
    },
    [isMobile, navigate]
  );

  // const userName = user?.full_name || user?.email || "User";
  const userName = useMemo(() => {
    if (user?.full_name) {
      return user.full_name;
    } else if (user?.email) {
      return user.email;
    } else {
      return "User";
    }
  }, [user]);

  // Get first letter for Avatar
  const getInitials = useCallback(
    (name: string) => {
      return name.charAt(0).toUpperCase();
    },
    [user]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: "flex" }}>
        {/* App Bar */}
        <AppBar
          position="fixed"
          sx={{
            zIndex: (theme) => theme.zIndex.drawer + 1,
            transition: theme.transitions.create(["width", "margin"], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
            ...(open && {
              marginLeft: drawerWidth,
              width: `calc(100% - ${drawerWidth}px)`,
              transition: theme.transitions.create(["width", "margin"], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            }),
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerOpen}
              edge="start"
              sx={{
                marginRight: 2,
                ...(open && { display: "none" }),
              }}
            >
              <MenuIcon />
            </IconButton>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <img
                src={autoTradeLogo}
                alt="AutoTrade68 Logo"
                style={{
                  height: "40px",
                  marginRight: "16px",
                  borderRadius: "50%",
                }}
              />
              <Typography variant="h6" noWrap component="div">
                AutoTrade68
              </Typography>
            </Box>
            <Box sx={{ flexGrow: 1 }} />
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography variant="body1" sx={{ mr: 2 }}>
                {userName}
              </Typography>
              <IconButton
                onClick={handleUserMenuClick}
                size="small"
                aria-controls={userMenuOpen ? "user-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={userMenuOpen ? "true" : undefined}
                sx={{ p: 0 }}
              >
                <Avatar sx={{ bgcolor: "secondary.main" }}>
                  {getInitials(userName)}
                </Avatar>
              </IconButton>
              <Menu
                id="user-menu"
                anchorEl={anchorEl}
                open={userMenuOpen}
                onClose={handleUserMenuClose}
                MenuListProps={{
                  "aria-labelledby": "user-button",
                }}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                PaperProps={{
                  elevation: 3,
                  sx: {
                    overflow: "visible",
                    filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                    mt: 1.5,
                    "& .MuiAvatar-root": {
                      width: 32,
                      height: 32,
                      ml: -0.5,
                      mr: 1,
                    },
                  },
                }}
              >
                <MenuItem onClick={handleProfile}>
                  <ListItemIcon>
                    <PersonIcon fontSize="small" />
                  </ListItemIcon>
                  Profile
                </MenuItem>
                <MenuItem onClick={handleSettings}>
                  <ListItemIcon>
                    <SettingsIcon fontSize="small" />
                  </ListItemIcon>
                  Settings
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Sidebar */}
        <Drawer
          variant={isMobile ? "temporary" : "permanent"}
          open={open}
          onClose={handleDrawerClose}
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
              width: drawerWidth,
              boxSizing: "border-box",
              ...(isMobile || !open
                ? {
                    overflowX: "hidden",
                    transition: theme.transitions.create("width", {
                      easing: theme.transitions.easing.sharp,
                      duration: theme.transitions.duration.leavingScreen,
                    }),
                    [theme.breakpoints.up("sm")]: {
                      width: theme.spacing(9),
                    },
                    [theme.breakpoints.down("sm")]: {
                      width: theme.spacing(7),
                    },
                  }
                : {
                    transition: theme.transitions.create("width", {
                      easing: theme.transitions.easing.sharp,
                      duration: theme.transitions.duration.enteringScreen,
                    }),
                  }),
            },
          }}
        >
          <Toolbar
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              px: [1],
            }}
          >
            <IconButton onClick={handleDrawerClose} sx={{ color: "white" }}>
              {muiTheme.direction === "rtl" ? (
                <ChevronRightIcon />
              ) : (
                <ChevronLeftIcon />
              )}
            </IconButton>
          </Toolbar>
          <Divider sx={{ bgcolor: "rgba(255,255,255,0.1)" }} />
          <List>
            <ListItem disablePadding sx={{ display: "block" }}>
              <ListItemButton
                sx={{
                  height: 48,
                  justifyContent: open ? "initial" : "center",
                  px: 2.5,
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.1)",
                  },
                }}
                onClick={() => handleNavigation("/")}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : "auto",
                    justifyContent: "center",
                    display: "flex",
                    alignItems: "center",
                    width: 24,
                    height: 24,
                  }}
                >
                  <HomeIcon 
                    sx={{ 
                      fontSize: 24,
                      width: 24,
                      height: 24,
                      transition: "none"
                    }} 
                  />
                </ListItemIcon>
                <ListItemText primary="Home" sx={{ opacity: open ? 1 : 0 }} />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding sx={{ display: "block" }}>
              <ListItemButton
                sx={{
                  height: 48,
                  justifyContent: open ? "initial" : "center",
                  px: 2.5,
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.1)",
                  },
                }}
                onClick={() => handleNavigation("/dashboard")}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : "auto",
                    justifyContent: "center",
                    display: "flex",
                    alignItems: "center",
                    width: 24,
                    height: 24,
                  }}
                >
                  <DashboardIcon 
                    sx={{ 
                      fontSize: 24,
                      width: 24,
                      height: 24,
                      transition: "none"
                    }} 
                  />
                </ListItemIcon>
                <ListItemText
                  primary="Dashboard"
                  sx={{ opacity: open ? 1 : 0 }}
                />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding sx={{ display: "block" }}>
              <ListItemButton
                sx={{
                  height: 48,
                  justifyContent: open ? "initial" : "center",
                  px: 2.5,
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.1)",
                  },
                }}
                onClick={() => handleNavigation("/module-bot")}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : "auto",
                    justifyContent: "center",
                    display: "flex",
                    alignItems: "center",
                    width: 24,
                    height: 24,
                  }}
                >
                  <SmartToyIcon 
                    sx={{ 
                      fontSize: 24,
                      width: 24,
                      height: 24,
                      transition: "none"
                    }} 
                  />
                </ListItemIcon>
                <ListItemText
                  primary="Module Bot"
                  sx={{ opacity: open ? 1 : 0 }}
                />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding sx={{ display: "block" }}>
              <ListItemButton
                sx={{
                  height: 48,
                  justifyContent: open ? "initial" : "center",
                  px: 2.5,
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.1)",
                  },
                }}
                onClick={() => handleNavigation("/bot-template")}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : "auto",
                    justifyContent: "center",
                    display: "flex",
                    alignItems: "center",
                    width: 24,
                    height: 24,
                  }}
                >
                  <DescriptionIcon 
                    sx={{ 
                      fontSize: 24,
                      width: 24,
                      height: 24,
                      transition: "none"
                    }} 
                  />
                </ListItemIcon>
                <ListItemText
                  primary="Bot Template"
                  sx={{ opacity: open ? 1 : 0 }}
                />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding sx={{ display: "block" }}>
              <ListItemButton
                sx={{
                  height: 48,
                  justifyContent: open ? "initial" : "center",
                  px: 2.5,
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.1)",
                  },
                }}
                onClick={() => handleNavigation("/backtest")}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : "auto",
                    justifyContent: "center",
                    display: "flex",
                    alignItems: "center",
                    width: 24,
                    height: 24,
                  }}
                >
                  <BarChartIcon 
                    sx={{ 
                      fontSize: 24,
                      width: 24,
                      height: 24,
                      transition: "none"
                    }} 
                  />
                </ListItemIcon>
                <ListItemText
                  primary="Backtest"
                  sx={{ opacity: open ? 1 : 0 }}
                />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding sx={{ display: "block" }}>
              <ListItemButton
                sx={{
                  height: 48,
                  justifyContent: open ? "initial" : "center",
                  px: 2.5,
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.1)",
                  },
                }}
                onClick={() => handleNavigation("/trading")}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : "auto",
                    justifyContent: "center",
                    display: "flex",
                    alignItems: "center",
                    width: 24,
                    height: 24,
                  }}
                >
                  <CurrencyBitcoinIcon 
                    sx={{ 
                      fontSize: 24,
                      width: 24,
                      height: 24,
                      transition: "none"
                    }} 
                  />
                </ListItemIcon>
                <ListItemText
                  primary="Crypto Trading"
                  sx={{ opacity: open ? 1 : 0 }}
                />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding sx={{ display: "block" }}>
              <ListItemButton
                sx={{
                  height: 48,
                  justifyContent: open ? "initial" : "center",
                  px: 2.5,
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.1)",
                  },
                }}
                onClick={() => handleNavigation("/trading-account")}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : "auto",
                    justifyContent: "center",
                    display: "flex",
                    alignItems: "center",
                    width: 24,
                    height: 24,
                  }}
                >
                  <AccountBalanceIcon 
                    sx={{ 
                      fontSize: 24,
                      width: 24,
                      height: 24,
                      transition: "none"
                    }} 
                  />
                </ListItemIcon>
                <ListItemText
                  primary="Tài khoản Trading"
                  sx={{ opacity: open ? 1 : 0 }}
                />
              </ListItemButton>
            </ListItem>
          </List>
          <Divider sx={{ bgcolor: "rgba(255,255,255,0.1)" }} />
          <List>
            <ListItem disablePadding sx={{ display: "block" }}>
              <ListItemButton
                sx={{
                  height: 48,
                  justifyContent: open ? "initial" : "center",
                  px: 2.5,
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.1)",
                  },
                }}
                onClick={handleLogout}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : "auto",
                    justifyContent: "center",
                    display: "flex",
                    alignItems: "center",
                    width: 24,
                    height: 24,
                  }}
                >
                  <LogoutIcon 
                    sx={{ 
                      fontSize: 24,
                      width: 24,
                      height: 24,
                      transition: "none"
                    }} 
                  />
                </ListItemIcon>
                <ListItemText primary="Logout" sx={{ opacity: open ? 1 : 0 }} />
              </ListItemButton>
            </ListItem>
          </List>
        </Drawer>

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: "100%",
            backgroundColor: "background.default",
            marginLeft: isMobile
              ? 0
              : open
              ? 0
              : `calc(-${drawerWidth}px + ${theme.spacing(9)})`,
            transition: theme.transitions.create("margin", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          }}
        >
          <Toolbar /> {/* This is for spacing below AppBar */}
          <Outlet />
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default memo(MainLayout, areEqual);
