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
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@components/LanguageSwitcher";

const drawerWidth = 240;

const MainLayout = () => {
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const userMenuOpen = Boolean(anchorEl);
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));
  // Treat tablets as compact to avoid horizontal overflow
  const isCompact = useMediaQuery(muiTheme.breakpoints.down("md"));
  const { cognitoUser, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

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

  // const userName = cognitoUser?.fullName || cognitoUser?.email || "User";
  const userName = useMemo(() => {
    if (cognitoUser?.fullName) {
      return cognitoUser.fullName;
    } else if (cognitoUser?.email) {
      return cognitoUser.email;
    } else {
      return t("common.user");
    }
  }, [t, cognitoUser]);

  // Get first letter for Avatar
  const getInitials = useCallback(
    (name: string) => {
      return name.charAt(0).toUpperCase();
    },
    [cognitoUser]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: "flex", minHeight: "100vh", overflowX: "hidden" }}>
        {/* App Bar */}
        <AppBar
          position="fixed"
          sx={{
            maxWidth: "100vw",
            overflowX: "hidden",
            zIndex: (theme) => theme.zIndex.drawer + 1,
            transition: theme.transitions.create(["width", "margin"], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
            ...(open &&
              !isCompact && {
                marginLeft: drawerWidth,
                width: `calc(100% - ${drawerWidth}px)`,
                transition: theme.transitions.create(["width", "margin"], {
                  easing: theme.transitions.easing.sharp,
                  duration: theme.transitions.duration.enteringScreen,
                }),
              }),
          }}
        >
          <Toolbar
            variant={isCompact ? "dense" : "regular"}
            sx={{ minHeight: { xs: 40, sm: 52, md: 64 }, px: { xs: 1, sm: 2 } }}
          >
            <IconButton
              color="inherit"
              aria-label={t("layout.openDrawer")}
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
                alt={t("layout.logoAlt")}
                style={{
                  height: isCompact ? "22px" : "32px",
                  marginRight: "16px",
                  borderRadius: "50%",
                }}
              />
              <Typography
                variant="h6"
                noWrap
                component="div"
                sx={{
                  display: { xs: "none", sm: "block" },
                  fontSize: { sm: "0.95rem", md: "1.15rem" },
                }}
              >
                {t("app.name")}
              </Typography>
            </Box>
            <Box sx={{ flexGrow: 1 }} />
            <Box sx={{ display: "flex", alignItems: "center", minWidth: 0 }}>
              <LanguageSwitcher />
              <Typography
                variant="body1"
                sx={{
                  mr: 2,
                  display: { xs: "none", md: "block" },
                  fontSize: { md: "0.95rem" },
                  maxWidth: 240,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
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
                <Avatar
                  sx={{
                    bgcolor: "secondary.main",
                    width: { xs: 26, sm: 30, md: 36 },
                    height: { xs: 26, sm: 30, md: 36 },
                  }}
                >
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
                  {t("common.profile")}
                </MenuItem>
                <MenuItem onClick={handleSettings}>
                  <ListItemIcon>
                    <SettingsIcon fontSize="small" />
                  </ListItemIcon>
                  {t("common.settings")}
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  {t("common.logout")}
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Sidebar */}
        <Drawer
          variant={isCompact ? "temporary" : "permanent"}
          open={open}
          onClose={handleDrawerClose}
          ModalProps={{ keepMounted: false }}
          sx={{
            width: isCompact ? undefined : drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
              boxSizing: "border-box",
              width: isCompact ? drawerWidth : open ? drawerWidth : undefined,
              ...(!isCompact && !open
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
                      transition: "none",
                    }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={t("navigation.home")}
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
                      transition: "none",
                    }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={t("navigation.dashboard")}
                  sx={{ opacity: open ? 1 : 0 }}
                />
              </ListItemButton>
            </ListItem>

            {/* Admin only: Module Bot */}
            {isAdmin && (
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
                        transition: "none",
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={t("navigation.moduleBot")}
                    sx={{ opacity: open ? 1 : 0 }}
                  />
                </ListItemButton>
              </ListItem>
            )}

            {/* Admin only: Bot Template */}
            {isAdmin && (
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
                        transition: "none",
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={t("navigation.botTemplate")}
                    sx={{ opacity: open ? 1 : 0 }}
                  />
                </ListItemButton>
              </ListItem>
            )}

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
                      transition: "none",
                    }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={t("navigation.backtest")}
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
                      transition: "none",
                    }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={t("navigation.trading")}
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
                onClick={() => handleNavigation("/trading-accounts")}
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
                      transition: "none",
                    }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={t("navigation.tradingAccounts")}
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
                      transition: "none",
                    }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={t("common.logout")}
                  sx={{ opacity: open ? 1 : 0 }}
                />
              </ListItemButton>
            </ListItem>
          </List>
        </Drawer>

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            px: { xs: 0, sm: 2, md: 3 },
            py: { xs: 1.25, sm: 2, md: 3 },
            width: "100%",
            backgroundColor: "background.default",
            overflowX: "hidden",
            maxWidth: "100vw",
            marginLeft: isCompact
              ? 0
              : open
              ? 0
              : `calc(-${drawerWidth}px + ${theme.spacing(9)})`,
            transition: theme.transitions.create("margin", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
            [muiTheme.breakpoints.down("sm")]: {
              "& .MuiPaper-root": {
                padding: `${theme.spacing(1.5)} !important`,
                borderRadius: 0,
                marginLeft: 0,
                marginRight: 0,
                width: "100%",
              },
              "& .MuiCard-root": {
                padding: `${theme.spacing(1.5)} !important`,
                borderRadius: theme.spacing(1.5),
                marginLeft: 0,
                marginRight: 0,
                width: "100%",
              },
              "& .MuiTypography-h5": {
                fontSize: "1.2rem",
                lineHeight: 1.3,
              },
              "& .MuiTypography-h6": {
                fontSize: "1rem",
                lineHeight: 1.35,
              },
              "& .MuiTypography-body1": {
                fontSize: "0.92rem",
                lineHeight: 1.45,
              },
              "& .MuiTypography-body2": {
                fontSize: "0.84rem",
                lineHeight: 1.5,
              },
              "& .MuiButton-root": {
                fontSize: "0.82rem",
                padding: `${theme.spacing(0.75, 1.5)} !important`,
              },
            },
            [muiTheme.breakpoints.between("sm", "md")]: {
              "& .MuiPaper-root, & .MuiCard-root": {
                padding: `${theme.spacing(2.25)} !important`,
                borderRadius: theme.spacing(1.75),
              },
              "& .MuiTypography-h5": {
                fontSize: "1.35rem",
              },
              "& .MuiTypography-h6": {
                fontSize: "1.12rem",
              },
              "& .MuiTypography-body1": {
                fontSize: "0.96rem",
              },
              "& .MuiTypography-body2": {
                fontSize: "0.88rem",
              },
            },
          }}
        >
          <Toolbar variant={isCompact ? "dense" : "regular"} />{" "}
          {/* spacing below AppBar */}
          <Outlet />
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default memo(MainLayout, areEqual);
