/**
 * The `EmployerLayout` function in this code defines the layout for an employer dashboard with a
 * sidebar navigation menu and main content area.
 */

import { Box, Stack, Typography, Button, InputBase } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import WorkRoundedIcon from "@mui/icons-material/WorkRounded";
import AddBoxRoundedIcon from "@mui/icons-material/AddBoxRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/whitelogo.png";

const linkStyle = {
  textDecoration: "none",
};

const navButtonBase = {
  justifyContent: "flex-start",
  color: "#5a3418",
  textTransform: "none",
  px: 1.8,
  py: 1.3,
  borderRadius: "14px",
  fontWeight: 700,
  fontSize: "14px",
  width: "100%",
  position: "relative",
};

function SidebarNavButton({ to, icon, label, end = false }) {
  return (
    <NavLink to={to} end={end} style={linkStyle}>
      {({ isActive }) => (
        <Button
          startIcon={icon}
          sx={{
            ...navButtonBase,
            color: isActive ? "#4a250d" : "#6a4120",
            background: isActive ? "rgba(255,255,255,0.45)" : "transparent",
            border: isActive
              ? "1px solid rgba(74,37,13,0.08)"
              : "1px solid transparent",
            boxShadow: isActive ? "0 8px 18px rgba(90,52,24,0.08)" : "none",
            "&:hover": {
              backgroundColor: "rgba(255,255,255,0.28)",
            },
          }}
        >
          {label}
        </Button>
      )}
    </NavLink>
  );
}

export default function EmployerLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  function getPageTitle(pathname) {
    if (pathname.includes("/employer/jobs/create")) return "Post Job";
    if (pathname.includes("/employer/jobs")) return "My Jobs";
    if (pathname.includes("/employer/applications")) return "Applications";
    if (pathname.includes("/employer/company")) return "Company";
    if (pathname.includes("/employer/settings")) return "Settings";
    return "Dashboard";
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        background: "#FFF8E8",
      }}
    >
      {/* Sidebar */}
      <Box
        sx={{
          width: 270,
          minHeight: "100vh",
          background: "linear-gradient(180deg, #FF9A3D 0%, #FFD37A 100%)",
          color: "#3d220f",
          px: 2,
          py: 2.2,
          boxSizing: "border-box",
          borderRight: "1px solid rgba(74,37,13,0.08)",
          display: "flex",
          flexDirection: "column",
          position: "sticky",
          top: 0,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            mb: 0.8,
            width: "100%",
          }}
        >
          <Box
            component="img"
            src={logo}
            alt="Employer logo"
            sx={{
              width: 80,
              display: "block",
            }}
          />
        </Box>

        <Box
          sx={{
            height: 46,
            borderRadius: 3,
            backgroundColor: "rgba(255,255,255,0.38)",
            border: "1px solid rgba(74,37,13,0.06)",
            display: "flex",
            alignItems: "center",
            px: 1.5,
            mb: 3,
          }}
        >
          <SearchIcon sx={{ color: "#7a4a22", fontSize: 18, mr: 1 }} />
          <InputBase
            placeholder="Search..."
            sx={{
              color: "#5a3418",
              fontSize: 14,
              width: "100%",
              "& input::placeholder": {
                color: "#8a5b34",
                opacity: 1,
              },
            }}
          />
        </Box>

        <Stack spacing={1}>
          <SidebarNavButton
            to="/employer/dashboard"
            icon={<DashboardRoundedIcon sx={{ fontSize: 18 }} />}
            label="Dashboard"
          />

          <Typography
            sx={{
              fontSize: 13,
              color: "#6e4020",
              mt: 1,
              mb: 0.2,
              px: 1,
              fontWeight: 700,
            }}
          >
            Employer pages
          </Typography>

          <SidebarNavButton
            to="/employer/jobs"
            icon={<WorkRoundedIcon sx={{ fontSize: 18 }} />}
            label="My Jobs"
          />

          <SidebarNavButton
            to="/employer/jobs/create"
            icon={<AddBoxRoundedIcon sx={{ fontSize: 18 }} />}
            label="Post Job"
          />

          <SidebarNavButton
            to="/employer/applications"
            icon={<GroupsRoundedIcon sx={{ fontSize: 18 }} />}
            label="Applications"
          />

          <SidebarNavButton
            to="/employer/company"
            icon={<BusinessRoundedIcon sx={{ fontSize: 18 }} />}
            label="Company"
          />
        </Stack>

        <Box sx={{ flexGrow: 1 }} />

        <Box
          sx={{
            pt: 2,
            mt: 2,
            borderTop: "1px solid rgba(74,37,13,0.10)",
          }}
        >
          <Stack spacing={1}>
            <SidebarNavButton
              to="/employer/settings"
              icon={<SettingsRoundedIcon sx={{ fontSize: 18 }} />}
              label="Settings"
            />

            <Button
              startIcon={<LogoutRoundedIcon sx={{ fontSize: 18 }} />}
              onClick={handleLogout}
              sx={{
                ...navButtonBase,
                color: "#5a3418",
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.28)",
                },
              }}
            >
              Logout
            </Button>
          </Stack>
        </Box>
      </Box>

      {/* Main content area */}
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Top bar */}
        <Box
          sx={{
            px: { xs: 2, md: 3 },
            py: 2,
            borderBottom: "1px solid rgba(74,37,13,0.08)",
            background: "rgba(255,248,232,0.92)",
            backdropFilter: "blur(10px)",
            position: "sticky",
            top: 0,
            zIndex: 5,
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
            spacing={1}
          >
            <Box></Box>
          </Stack>
        </Box>

        {/* Swapping page content */}
        <Box
          sx={{
            flex: 1,
            p: { xs: 2, md: 3 },
            overflow: "auto",
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
