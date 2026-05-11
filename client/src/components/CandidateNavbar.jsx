/**
 * The `CandidateNavbar` component in this code snippet is a React component that represents a
 * navigation bar for a candidate dashboard, including features like notifications, dark/light mode
 * toggle, and logout functionality.
 * @returns The `CandidateNavbar` component is being returned. This component includes an app bar with
 * navigation buttons, icons for notifications and dark mode toggle, user avatar, logout button, a
 * drawer for mobile view with navigation links, and a bottom navigation bar for mobile devices. It
 * also includes a Snackbar component to display a notification toast when there are new notifications.
 */
import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Stack,
  Avatar,
  IconButton,
  Snackbar,
  Alert,
  AppBar,
  Toolbar,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  Paper,
  Typography,
} from "@mui/material";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Badge from "@mui/material/Badge";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import WorkRoundedIcon from "@mui/icons-material/WorkRounded";
import AssignmentTurnedInRoundedIcon from "@mui/icons-material/AssignmentTurnedInRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";

import orgLogo from "../assets/orglogo.png";
import whiteLogo from "../assets/whitelogo.png";

function CandidateBottomNav({ navItems, isActive, colors, mode, unreadCount }) {
  const iconMap = {
    Home: <DashboardRoundedIcon sx={{ fontSize: 21 }} />,
    Jobs: <WorkRoundedIcon sx={{ fontSize: 21 }} />,
    Applications: <AssignmentTurnedInRoundedIcon sx={{ fontSize: 21 }} />,
    Profile: <PersonRoundedIcon sx={{ fontSize: 21 }} />,
    Services: <AutoAwesomeRoundedIcon sx={{ fontSize: 21 }} />,
  };

  return (
    <Box
      sx={{
        display: { xs: "block", md: "none" },
        position: "fixed",
        left: 10,
        right: 10,
        bottom: 10,
        zIndex: 1300,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          px: 0.8,
          py: 0.75,
          borderRadius: 5,
          background: colors.bottomNavBg || colors.nav,
          border: `1px solid ${colors.bottomNavBorder || colors.navBorder}`,
          boxShadow: colors.bottomNavShadow || "0 18px 45px rgba(0,0,0,0.20)",
          backdropFilter: "blur(16px)",
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: `repeat(${navItems.length}, 1fr)`,
            gap: 0.3,
          }}
        >
          {navItems.map((item) => {
            const active = isActive(item.path);
            const isNotificationsRelated =
              item.path === "/candidate/notifications";

            return (
              <Link
                key={item.path}
                to={item.path}
                style={{ textDecoration: "none" }}
              >
                <Box
                  sx={{
                    minHeight: 56,
                    borderRadius: 4,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 0.25,
                    color: active ? colors.accent : colors.subtext,
                    background: active
                      ? colors.bottomNavActiveBg || colors.hoverBg
                      : "transparent",
                    border: active
                      ? `1px solid ${colors.bottomNavBorder || colors.cardBorder}`
                      : "1px solid transparent",
                    transition: "0.18s ease",
                    position: "relative",
                  }}
                >
                  {isNotificationsRelated ? (
                    <Badge badgeContent={unreadCount} color="error">
                      <NotificationsNoneRoundedIcon sx={{ fontSize: 21 }} />
                    </Badge>
                  ) : (
                    iconMap[item.label]
                  )}

                  <Typography
                    sx={{
                      fontSize: 10.2,
                      fontWeight: active ? 900 : 700,
                      lineHeight: 1,
                      whiteSpace: "nowrap",
                      color: active ? colors.accent : colors.subtext,
                    }}
                  >
                    {item.label}
                  </Typography>
                </Box>
              </Link>
            );
          })}
        </Box>
      </Paper>
    </Box>
  );
}

export default function CandidateNavbar({ mode, setMode, colors }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [unreadCount, setUnreadCount] = useState(0);
  const [openToast, setOpenToast] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 10000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.candidate_id]);

  async function fetchUnreadCount() {
    try {
      const token = localStorage.getItem("token");
      const candidateId = user?.candidate_id;

      if (!candidateId || !token) return;

      const res = await fetch(
        "http://localhost:3001/api/candidate/notifications",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        console.error("Notification count error:", data);
        return;
      }

      const list = Array.isArray(data.notifications) ? data.notifications : [];
      const unread = list.filter((item) => !item.is_read).length;

      setUnreadCount((previousUnread) => {
        if (unread > previousUnread) {
          setOpenToast(true);
        }

        return unread;
      });
    } catch (error) {
      console.error(error);
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  function toggleMode() {
    setMode((prev) => (prev === "light" ? "dark" : "light"));
  }

  function isActive(path) {
    return location.pathname === path;
  }

  const navItems = [
    { label: "Home", path: "/candidate/dashboard" },
    { label: "Jobs", path: "/candidate/jobs" },
    { label: "Applications", path: "/candidate/applications" },
    { label: "Profile", path: "/candidate/profile" },
    { label: "Services", path: "/candidate/career-services" },
  ];

  const navButtonStyle = (path) => ({
    color: isActive(path) ? colors.accent : colors.text,
    textTransform: "none",
    fontWeight: isActive(path) ? 800 : 600,
    minWidth: "auto",
    px: 1.8,
    py: 0.9,
    borderRadius: 999,
    fontSize: "0.95rem",
    backgroundColor: isActive(path)
      ? mode === "dark"
        ? "rgba(255,154,61,0.12)"
        : "rgba(248,81,36,0.10)"
      : "transparent",
    "&:hover": {
      backgroundColor:
        mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
    },
  });

  const logoSrc = mode === "dark" ? whiteLogo : orgLogo;

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backgroundColor: colors.nav,
          borderBottom: `1px solid ${colors.navBorder}`,
          backdropFilter: "blur(14px)",
          color: colors.text,
        }}
      >
        <Toolbar
          sx={{
            minHeight: 72,
            px: { xs: 2, md: 4 },
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Box
            onClick={() => navigate("/candidate/dashboard")}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            <Box
              component="img"
              src={logoSrc}
              alt="Logo"
              sx={{
                height: 40,
                width: "auto",
                objectFit: "contain",
                display: "block",
              }}
            />
          </Box>

          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ display: { xs: "none", md: "flex" } }}
          >
            {navItems.map((item) => (
              <Button
                key={item.path}
                component={Link}
                to={item.path}
                sx={navButtonStyle(item.path)}
              >
                {item.label}
              </Button>
            ))}

            <IconButton
              component={Link}
              to="/candidate/notifications"
              sx={{
                color: isActive("/candidate/notifications")
                  ? colors.accent
                  : colors.text,
                borderRadius: 999,
                backgroundColor:
                  mode === "dark"
                    ? "rgba(255,255,255,0.04)"
                    : "rgba(0,0,0,0.04)",
                "&:hover": {
                  backgroundColor:
                    mode === "dark"
                      ? "rgba(255,255,255,0.08)"
                      : "rgba(0,0,0,0.06)",
                },
              }}
            >
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsNoneRoundedIcon />
              </Badge>
            </IconButton>

            <IconButton
              onClick={toggleMode}
              sx={{
                color: colors.text,
                borderRadius: 999,
                backgroundColor:
                  mode === "dark"
                    ? "rgba(255,255,255,0.04)"
                    : "rgba(0,0,0,0.04)",
                "&:hover": {
                  backgroundColor:
                    mode === "dark"
                      ? "rgba(255,255,255,0.08)"
                      : "rgba(0,0,0,0.06)",
                },
              }}
            >
              {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>

            <Avatar
              sx={{ bgcolor: colors.accent, color: "#fff", fontWeight: 700 }}
            >
              {user?.email?.[0]?.toUpperCase() || "C"}
            </Avatar>

            <Button
              onClick={handleLogout}
              variant="contained"
              sx={{
                textTransform: "none",
                borderRadius: 999,
                px: 2.2,
                py: 1,
                fontWeight: 700,
                background: colors.buttonBg,
                boxShadow: "none",
                "&:hover": {
                  background: colors.buttonHoverBg,
                  boxShadow: "none",
                },
              }}
            >
              Logout
            </Button>
          </Stack>

          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ display: { xs: "flex", md: "none" } }}
          >
            <IconButton
              component={Link}
              to="/candidate/notifications"
              sx={{
                color: isActive("/candidate/notifications")
                  ? colors.accent
                  : colors.text,
                borderRadius: 999,
                backgroundColor:
                  mode === "dark"
                    ? "rgba(255,255,255,0.04)"
                    : "rgba(0,0,0,0.04)",
              }}
            >
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsNoneRoundedIcon />
              </Badge>
            </IconButton>

            <IconButton
              onClick={toggleMode}
              sx={{
                color: colors.text,
                borderRadius: 999,
                backgroundColor:
                  mode === "dark"
                    ? "rgba(255,255,255,0.04)"
                    : "rgba(0,0,0,0.04)",
              }}
            >
              {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>

            <IconButton
              onClick={() => setMobileOpen(true)}
              sx={{
                color: colors.text,
                borderRadius: 999,
                backgroundColor:
                  mode === "dark"
                    ? "rgba(255,255,255,0.04)"
                    : "rgba(0,0,0,0.04)",
              }}
            >
              <MenuIcon />
            </IconButton>
          </Stack>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        PaperProps={{
          sx: {
            width: 300,
            backgroundColor: colors.cardBg,
            color: colors.text,
            borderLeft: `1px solid ${colors.cardBorder}`,
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 2,
          }}
        >
          <Box
            component="img"
            src={logoSrc}
            alt="Logo"
            sx={{ height: 36, width: "auto", objectFit: "contain" }}
          />
          <IconButton
            onClick={() => setMobileOpen(false)}
            sx={{ color: colors.text }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ borderColor: colors.cardBorder }} />

        <List sx={{ p: 1.5 }}>
          {navItems.map((item) => (
            <ListItemButton
              key={item.path}
              component={Link}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              selected={isActive(item.path)}
              sx={{
                borderRadius: 3,
                mb: 0.75,
                "&.Mui-selected": {
                  backgroundColor:
                    mode === "dark"
                      ? "rgba(255,154,61,0.12)"
                      : "rgba(248,81,36,0.10)",
                },
              }}
            >
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontWeight: isActive(item.path) ? 700 : 600,
                  color: colors.text,
                }}
              />
            </ListItemButton>
          ))}

          <ListItemButton
            component={Link}
            to="/candidate/notifications"
            onClick={() => setMobileOpen(false)}
            sx={{ borderRadius: 3, mb: 0.75 }}
          >
            <ListItemText
              primary={`Notifications (${unreadCount})`}
              primaryTypographyProps={{ color: colors.text, fontWeight: 600 }}
            />
          </ListItemButton>

          <ListItemButton
            onClick={() => {
              toggleMode();
              setMobileOpen(false);
            }}
            sx={{ borderRadius: 3, mb: 0.75 }}
          >
            <ListItemText
              primary={mode === "dark" ? "Light Mode" : "Dark Mode"}
              primaryTypographyProps={{ color: colors.text, fontWeight: 600 }}
            />
          </ListItemButton>

          <ListItemButton
            onClick={() => {
              handleLogout();
              setMobileOpen(false);
            }}
            sx={{
              borderRadius: 3,
              mt: 1,
              background: colors.buttonBg,
              "&:hover": { background: colors.buttonHoverBg },
            }}
          >
            <ListItemText
              primary="Logout"
              primaryTypographyProps={{ color: "#fff", fontWeight: 700 }}
            />
          </ListItemButton>
        </List>
      </Drawer>

      <CandidateBottomNav
        navItems={navItems}
        isActive={isActive}
        colors={colors}
        mode={mode}
        unreadCount={unreadCount}
      />

      <Snackbar
        open={openToast}
        autoHideDuration={4000}
        onClose={() => setOpenToast(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setOpenToast(false)}
          severity="info"
          sx={{ width: "100%" }}
        >
          You have a new notification 🔔
        </Alert>
      </Snackbar>
    </>
  );
}
