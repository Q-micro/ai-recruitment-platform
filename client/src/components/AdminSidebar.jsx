/**
 * The `AdminSidebar` function in JavaScript React creates a sidebar component with navigation links
 * and buttons for an admin dashboard interface.
 */
import { Box, Stack, Typography, Button, InputBase } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import WorkIcon from "@mui/icons-material/Work";
import BusinessIcon from "@mui/icons-material/Business";
import AssessmentIcon from "@mui/icons-material/Assessment";
import PaymentsIcon from "@mui/icons-material/Payments";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import { NavLink, useNavigate } from "react-router-dom";
import logo from "../assets/whitelogo.png";

const linkStyle = {
  textDecoration: "none",
};

const navButtonBase = {
  justifyContent: "flex-start",
  color: "#c7d2fe",
  textTransform: "none",
  padding: "12px 16px",
  borderRadius: "12px",
  fontWeight: 500,
  fontSize: "14px",
  width: "100%",
  position: "relative",
};

const pageButtonStyle = (isActive) => ({
  ...navButtonBase,
  backgroundColor: isActive ? "#071735" : "transparent",
  borderLeft: isActive ? "3px solid #FF6500" : "3px solid transparent",
  borderRadius: 0,
  pl: 2,
  color: isActive ? "#ffffff" : "#c7d2fe",
  "&:hover": {
    backgroundColor: "#081a3a",
  },
});

export default function AdminSidebar() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  return (
    <Box
      sx={{
        width: 250,
        minHeight: "100vh",
        background: "linear-gradient(180deg, #000000 0%, #031133 100%)",
        color: "#fff",
        px: 2,
        py: 2.5,
        boxSizing: "border-box",
        borderRight: "1px solid rgba(255,255,255,0.04)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          mb: 2.5,
          width: "100%",
        }}
      >
        <Box
          component="img"
          src={logo}
          alt="Admin logo"
          sx={{
            width: 80,
            display: "block",
          }}
        />
      </Box>

      <Box
        sx={{
          height: 44,
          borderRadius: 2,
          backgroundColor: "#081a3a",
          border: "1px solid rgba(255,255,255,0.05)",
          display: "flex",
          alignItems: "center",
          px: 1.5,
          mb: 3,
        }}
      >
        <SearchIcon sx={{ color: "#7f8db0", fontSize: 18, mr: 1 }} />
        <InputBase
          placeholder="Search for..."
          sx={{
            color: "#dbe4ff",
            fontSize: 14,
            width: "100%",
            "& input::placeholder": {
              color: "#7f8db0",
              opacity: 1,
            },
          }}
        />
      </Box>

      <Box sx={{ mb: 2 }}>
        <NavLink to="/admin" end style={linkStyle}>
          {({ isActive }) => (
            <Button
              startIcon={<AssessmentIcon sx={{ fontSize: 18 }} />}
              sx={{
                ...navButtonBase,
                color: isActive ? "#FF9A4D" : "#ff9a4d",
                backgroundColor: "transparent",
                "&:hover": {
                  backgroundColor: "#081a3a",
                },
              }}
            >
              Dashboard
            </Button>
          )}
        </NavLink>
      </Box>

      <Typography
        sx={{
          fontSize: 13,
          color: "#9aa7c7",
          mb: 1.2,
          px: 1,
        }}
      >
        All pages
      </Typography>

      <Stack spacing={0.5}>
        <NavLink to="/admin/candidates" style={linkStyle}>
          {({ isActive }) => (
            <Button
              startIcon={<PeopleIcon sx={{ fontSize: 18 }} />}
              sx={pageButtonStyle(isActive)}
            >
              Candidates
            </Button>
          )}
        </NavLink>

        <NavLink to="/admin/jobs" style={linkStyle}>
          {({ isActive }) => (
            <Button
              startIcon={<WorkIcon sx={{ fontSize: 18 }} />}
              sx={pageButtonStyle(isActive)}
            >
              Jobs
            </Button>
          )}
        </NavLink>

        <NavLink to="/admin/companies" style={linkStyle}>
          {({ isActive }) => (
            <Button
              startIcon={<BusinessIcon sx={{ fontSize: 18 }} />}
              sx={pageButtonStyle(isActive)}
            >
              Companies
            </Button>
          )}
        </NavLink>

        <NavLink to="/admin/sales" style={linkStyle}>
          {({ isActive }) => (
            <Button
              startIcon={<PaymentsIcon sx={{ fontSize: 18 }} />}
              sx={pageButtonStyle(isActive)}
            >
              Sales
            </Button>
          )}
        </NavLink>

        <NavLink to="/admin/ats-cv-generator" style={linkStyle}>
          {({ isActive }) => (
            <Button
              startIcon={<SettingsIcon sx={{ fontSize: 18 }} />}
              sx={pageButtonStyle(isActive)}
            >
              ATS
            </Button>
          )}
        </NavLink>
      </Stack>

      <Box sx={{ flexGrow: 1 }} />

      <Box
        sx={{
          pt: 2,
          mt: 2,
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <NavLink to="/admin/settings" style={linkStyle}>
          {({ isActive }) => (
            <Button
              startIcon={<SettingsIcon sx={{ fontSize: 18 }} />}
              sx={{
                ...navButtonBase,
                color: isActive ? "#ffffff" : "#c7d2fe",
                backgroundColor: isActive ? "#081a3a" : "transparent",
                "&:hover": {
                  backgroundColor: "#081a3a",
                },
              }}
            >
              Settings
            </Button>
          )}
        </NavLink>

        <Button
          startIcon={<LogoutIcon sx={{ fontSize: 18 }} />}
          onClick={handleLogout}
          sx={{
            ...navButtonBase,
            mt: 1,
            "&:hover": {
              backgroundColor: "#081a3a",
            },
          }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );
}
