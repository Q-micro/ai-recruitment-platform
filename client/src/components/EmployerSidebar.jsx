import { Box, Stack, Typography, Button, InputBase } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DashboardIcon from "@mui/icons-material/Dashboard";
import WorkIcon from "@mui/icons-material/Work";
import AddBoxIcon from "@mui/icons-material/AddBox";
import GroupsIcon from "@mui/icons-material/Groups";
import BusinessIcon from "@mui/icons-material/Business";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import { NavLink, useNavigate } from "react-router-dom";
import logo from "../assets/whitelogo.png";

const linkStyle = {
  textDecoration: "none",
};

const navButtonBase = {
  justifyContent: "flex-start",
  color: "#5a3418",
  textTransform: "none",
  padding: "12px 16px",
  borderRadius: "12px",
  fontWeight: 600,
  fontSize: "14px",
  width: "100%",
  position: "relative",
};

export default function EmployerSidebar() {
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
        background: "linear-gradient(180deg, #FF7D29 0%, #FFBF78 100%)",
        color: "#3d220f",
        px: 2,
        py: 2.5,
        boxSizing: "border-box",
        borderRight: "1px solid rgba(0,0,0,0.06)",
        display: "flex",
        flexDirection: "column",
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
            alt="Admin logo"
            sx={{
              width: 80,
              display: "block",
            }}
          />
        </Box>
      
        
        
      <Typography sx={{ fontWeight: 800, fontSize: 24, mb: 2.5 }}>
        Employer
      </Typography>



      

      <Box
        sx={{
          height: 44,
          borderRadius: 2,
          backgroundColor: "rgba(255,255,255,0.35)",
          border: "1px solid rgba(0,0,0,0.06)",
          display: "flex",
          alignItems: "center",
          px: 1.5,
          mb: 3,
        }}
      >
        <SearchIcon sx={{ color: "#7a4a22", fontSize: 18, mr: 1 }} />
        <InputBase
          placeholder="Search for..."
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

      <Box sx={{ mb: 2 }}>
        <NavLink to="/employer" style={linkStyle}>
          {({ isActive }) => (
            <Button
              startIcon={<DashboardIcon sx={{ fontSize: 18 }} />}
              sx={{
                ...navButtonBase,
                color: "#4a250d",
                backgroundColor: isActive ? "rgba(255,255,255,0.45)" : "transparent",
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.28)",
                },
              }}
            >
              Dashboard
            </Button>
          )}
        </NavLink>
      </Box>

      <Typography sx={{ fontSize: 13, color: "#6e4020", mb: 1.2, px: 1 }}>
        Employer pages
      </Typography>

      <Stack spacing={0.5}>
        <NavLink to="/employer/jobs" style={linkStyle}>
          {({ isActive }) => (
            <Button
              startIcon={<WorkIcon sx={{ fontSize: 18 }} />}
              sx={{
                ...navButtonBase,
                backgroundColor: isActive ? "rgba(255,255,255,0.45)" : "transparent",
                borderLeft: isActive ? "3px solid #FF7D29" : "3px solid transparent",
                borderRadius: 0,
                pl: 2,
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.28)",
                },
              }}
            >
              My Jobs
            </Button>
          )}
        </NavLink>

        <NavLink to="/employer/post-job" style={linkStyle}>
          {({ isActive }) => (
            <Button
              startIcon={<AddBoxIcon sx={{ fontSize: 18 }} />}
              sx={{
                ...navButtonBase,
                backgroundColor: isActive ? "rgba(255,255,255,0.45)" : "transparent",
                borderLeft: isActive ? "3px solid #FF7D29" : "3px solid transparent",
                borderRadius: 0,
                pl: 2,
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.28)",
                },
              }}
            >
              Post Job
            </Button>
          )}
        </NavLink>

        <NavLink to="/employer/applications" style={linkStyle}>
          {({ isActive }) => (
            <Button
              startIcon={<GroupsIcon sx={{ fontSize: 18 }} />}
              sx={{
                ...navButtonBase,
                backgroundColor: isActive ? "rgba(255,255,255,0.45)" : "transparent",
                borderLeft: isActive ? "3px solid #FF7D29" : "3px solid transparent",
                borderRadius: 0,
                pl: 2,
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.28)",
                },
              }}
            >
              Applications
            </Button>
          )}
        </NavLink>

        <NavLink to="/employer/company" style={linkStyle}>
          {({ isActive }) => (
            <Button
              startIcon={<BusinessIcon sx={{ fontSize: 18 }} />}
              sx={{
                ...navButtonBase,
                backgroundColor: isActive ? "rgba(255,255,255,0.45)" : "transparent",
                borderLeft: isActive ? "3px solid #FF7D29" : "3px solid transparent",
                borderRadius: 0,
                pl: 2,
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.28)",
                },
              }}
            >
              Company
            </Button>
          )}
        </NavLink>
      </Stack>

      <Box sx={{ flexGrow: 1 }} />

      <Box
        sx={{
          pt: 2,
          mt: 2,
          borderTop: "1px solid rgba(0,0,0,0.08)",
        }}
      >
        <NavLink to="/employer/settings" style={linkStyle}>
          {({ isActive }) => (
            <Button
              startIcon={<SettingsIcon sx={{ fontSize: 18 }} />}
              sx={{
                ...navButtonBase,
                backgroundColor: isActive ? "rgba(255,255,255,0.35)" : "transparent",
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.28)",
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
              backgroundColor: "rgba(255,255,255,0.28)",
            },
          }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );
}