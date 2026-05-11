/**
 * The `EmployerLayout` function in this code is a React component that serves as the layout for an
 * employer dashboard, handling company registration status, navigation, and conditional rendering
 * based on company approval status.
 */

import { useEffect, useState } from "react";
import {
  Box,
  Stack,
  Typography,
  Button,
  InputBase,
  Alert,
  CircularProgress,
  Paper,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import WorkRoundedIcon from "@mui/icons-material/WorkRounded";
import AddBoxRoundedIcon from "@mui/icons-material/AddBoxRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { apiFetch } from "../api/http";
import logo from "../assets/whitelogo.png";
import EmployerTopbar from "./EmployerTopbar";

const linkStyle = { textDecoration: "none" };

const navButtonBase = {
  justifyContent: "flex-start",
  color: "#255a18",
  textTransform: "none",
  px: 1.8,
  py: 1.3,
  borderRadius: "14px",
  fontWeight: 700,
  fontSize: "14px",
  width: "100%",
};

const bottomNavItems = [
  {
    to: "/employer/dashboard",
    label: "Home",
    icon: <DashboardRoundedIcon sx={{ fontSize: 20 }} />,
  },
  {
    to: "/employer/jobs",
    label: "Jobs",
    icon: <WorkRoundedIcon sx={{ fontSize: 20 }} />,
  },
  {
    to: "/employer/jobs/create",
    label: "Post",
    icon: <AddBoxRoundedIcon sx={{ fontSize: 20 }} />,
  },
  {
    to: "/employer/applications",
    label: "Applicants",
    icon: <GroupsRoundedIcon sx={{ fontSize: 20 }} />,
  },
  {
    to: "/employer/settings",
    label: "Settings",
    icon: <SettingsRoundedIcon sx={{ fontSize: 20 }} />,
  },
];

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
            "&:hover": { backgroundColor: "rgba(255,255,255,0.28)" },
          }}
        >
          {label}
        </Button>
      )}
    </NavLink>
  );
}

function MobileBottomNav({ isApproved }) {
  if (!isApproved) {
    return (
      <Box
        sx={{
          display: { xs: "block", md: "none" },
          position: "fixed",
          left: 12,
          right: 12,
          bottom: 12,
          zIndex: 30,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            px: 1.2,
            py: 0.9,
            borderRadius: 5,
            background: "rgba(255,255,255,0.92)",
            border: "1px solid rgba(90,52,24,0.10)",
            boxShadow: "0 18px 40px rgba(90,52,24,0.18)",
            backdropFilter: "blur(14px)",
          }}
        >
          <NavLink to="/employer/register" style={linkStyle}>
            {({ isActive }) => (
              <Button
                fullWidth
                startIcon={<BusinessRoundedIcon />}
                sx={{
                  borderRadius: 4,
                  textTransform: "none",
                  fontWeight: 900,
                  color: isActive ? "#FF7D29" : "#6a4120",
                  background: isActive
                    ? "rgba(255,125,41,0.10)"
                    : "transparent",
                }}
              >
                Company Status
              </Button>
            )}
          </NavLink>
        </Paper>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: { xs: "block", md: "none" },
        position: "fixed",
        left: 10,
        right: 10,
        bottom: 10,
        zIndex: 30,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          px: 0.8,
          py: 0.75,
          borderRadius: 5,
          background: "rgba(255,255,255,0.94)",
          border: "1px solid rgba(90,52,24,0.10)",
          boxShadow: "0 18px 40px rgba(90,52,24,0.20)",
          backdropFilter: "blur(14px)",
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: `repeat(${bottomNavItems.length}, 1fr)`,
            gap: 0.3,
          }}
        >
          {bottomNavItems.map((item) => (
            <NavLink key={item.to} to={item.to} style={linkStyle}>
              {({ isActive }) => (
                <Box
                  sx={{
                    minHeight: 54,
                    borderRadius: 4,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 0.25,
                    color: isActive ? "#FF7D29" : "#7a5630",
                    background: isActive
                      ? "rgba(255,125,41,0.10)"
                      : "transparent",
                    transition: "0.18s ease",
                  }}
                >
                  {item.icon}
                  <Typography
                    sx={{
                      fontSize: 10.5,
                      fontWeight: isActive ? 900 : 700,
                      lineHeight: 1,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.label}
                  </Typography>
                </Box>
              )}
            </NavLink>
          ))}
        </Box>
      </Paper>
    </Box>
  );
}

function EmployerWaitingCard({ company }) {
  if (!company) return null;

  const isPending = company.status === "pending";
  const isRejected = company.status === "rejected";

  return (
    <Paper
      elevation={0}
      sx={{
        maxWidth: 760,
        mx: "auto",
        mt: { xs: 3, md: 8 },
        p: { xs: 3, md: 5 },
        borderRadius: 5,
        background: "rgba(255,255,255,0.72)",
        border: "1px solid rgba(90,52,24,0.10)",
        boxShadow: "0 18px 50px rgba(90,52,24,0.12)",
        textAlign: "center",
        color: "#4a2b12",
      }}
    >
      <Box
        sx={{
          width: 76,
          height: 76,
          borderRadius: "50%",
          mx: "auto",
          mb: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: isRejected
            ? "rgba(248,113,113,0.14)"
            : "rgba(251,191,36,0.18)",
          color: isRejected ? "#b91c1c" : "#92400e",
        }}
      >
        <BusinessRoundedIcon sx={{ fontSize: 38 }} />
      </Box>

      <Typography variant="h4" fontWeight={900} sx={{ mb: 1 }}>
        {isPending
          ? "Registration Under Review"
          : "Registration Needs Attention"}
      </Typography>

      <Typography sx={{ color: "#6a4120", fontSize: 16, lineHeight: 1.7 }}>
        {isPending
          ? "Your company profile has been submitted. Once the admin approves it, your employer dashboard, job posting, and applications pages will unlock automatically."
          : "Your company registration was rejected. Please contact the admin or update your company information if changes are required."}
      </Typography>

      <Box
        sx={{
          mt: 3,
          p: 2,
          borderRadius: 3,
          background: "rgba(255,255,255,0.55)",
          border: "1px solid rgba(90,52,24,0.08)",
          textAlign: "left",
        }}
      >
        <Typography fontWeight={800}>Submitted company</Typography>
        <Typography sx={{ mt: 0.5, color: "#6a4120" }}>
          {company.name || "Company name not available"}
        </Typography>

        {company.cr_number && (
          <Typography sx={{ mt: 0.5, color: "#6a4120" }}>
            CR Number: {company.cr_number}
          </Typography>
        )}

        <Typography
          sx={{
            mt: 1,
            display: "inline-flex",
            px: 1.5,
            py: 0.6,
            borderRadius: 999,
            fontSize: 13,
            fontWeight: 800,
            color: isPending ? "#92400e" : "#b91c1c",
            background: isPending
              ? "rgba(251,191,36,0.18)"
              : "rgba(248,113,113,0.16)",
          }}
        >
          Status: {company.status}
        </Typography>
      </Box>
    </Paper>
  );
}

export default function EmployerLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const [company, setCompany] = useState(null);
  const [checking, setChecking] = useState(true);

  const isRegisterPage = location.pathname === "/employer/register";
  const isApproved = company?.status === "approved";

  useEffect(() => {
    async function checkCompany() {
      try {
        if (!user?.id || !token) {
          navigate("/login");
          return;
        }

        const data = await apiFetch(`/api/employer/company/${user.id}`, {
          token,
        });

        setCompany(data.company || null);
      } catch (error) {
        console.error("Employer company check error:", error);

        if (
          error?.message === "No token provided" ||
          error?.message === "Invalid or expired token" ||
          error?.message === "Access denied"
        ) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
        }
      } finally {
        setChecking(false);
      }
    }

    checkCompany();
  }, [user?.id, token, navigate]);

  useEffect(() => {
    if (checking) return;

    if (!company && !isRegisterPage) {
      navigate("/employer/register");
      return;
    }

    if (company && !isApproved && !isRegisterPage) {
      navigate("/employer/register");
    }
  }, [checking, company, isApproved, isRegisterPage, navigate]);

  if (company && isApproved && isRegisterPage) {
    navigate("/employer/dashboard");
    return null;
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  const showLockedWaitingCard =
    company && !isApproved && !isRegisterPage && !checking;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        position: "relative",
        overflow: "hidden",
        background: `
          radial-gradient(
            circle at 45% 35%, 
            rgba(255, 170, 50, 0.28) 0%, 
            rgba(255, 140, 30, 0.20) 25%, 
            rgba(255, 110, 10, 0.12) 45%, 
            rgba(255, 90, 0, 0.06) 65%, 
            rgba(255, 80, 0, 0) 80%
          ),
          linear-gradient(
            135deg,
            #fff7ef 0%,
            #ffe8d2 35%,
            #ffd1a6 70%,
            #ffb066 100%
          )
        `,
      }}
    >
      <Box
        sx={{
          width: 270,
          minHeight: "100vh",
          background: "linear-gradient(180deg, #FF9A3D 0%, #FFD37A 100%)",
          px: 2,
          py: 2.2,
          boxSizing: "border-box",
          borderRight: "1px solid rgba(74,37,13,0.08)",
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          position: "sticky",
          top: 0,
          zIndex: 2,
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "center", mb: 0.8 }}>
          <Box
            component="img"
            src={logo}
            alt="Employer logo"
            sx={{ width: 80 }}
          />
        </Box>

        {isApproved && (
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
              sx={{ color: "#5a3418", fontSize: 14 }}
            />
          </Box>
        )}

        <Stack spacing={1}>
          {isApproved && (
            <>
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
            </>
          )}

          {!isApproved && (
            <SidebarNavButton
              to="/employer/register"
              icon={<BusinessRoundedIcon sx={{ fontSize: 18 }} />}
              label={company ? "Company Status" : "Register Company"}
            />
          )}
        </Stack>

        <Box sx={{ flexGrow: 1 }} />

        <Stack spacing={1}>
          {isApproved && (
            <SidebarNavButton
              to="/employer/settings"
              icon={<SettingsRoundedIcon sx={{ fontSize: 18 }} />}
              label="Settings"
            />
          )}

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

      <Box
        sx={{
          flex: 1,
          p: {
            xs: "14px 14px 92px",
            md: 3,
          },
          overflow: "auto",
          minWidth: 0,
        }}
      >
        {checking ? (
          <Box
            sx={{
              minHeight: "70vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Stack spacing={2} alignItems="center">
              <CircularProgress sx={{ color: "#FF7D29" }} />
              <Typography sx={{ color: "#5a3418", fontWeight: 700 }}>
                Checking company approval...
              </Typography>
            </Stack>
          </Box>
        ) : (
          <>
            {company?.status === "pending" && (
              <Alert
                severity="warning"
                sx={{
                  mb: 2,
                  borderRadius: 3,
                  fontWeight: 700,
                }}
              >
                Your company registration is pending admin approval.
              </Alert>
            )}

            {company?.status === "rejected" && (
              <Alert
                severity="error"
                sx={{
                  mb: 2,
                  borderRadius: 3,
                  fontWeight: 700,
                }}
              >
                Your company registration was rejected. Please contact admin.
              </Alert>
            )}

            {showLockedWaitingCard ? (
              <EmployerWaitingCard company={company} />
            ) : (
              <>
                <EmployerTopbar />
                <Outlet context={{ company, setCompany }} />
              </>
            )}
          </>
        )}
      </Box>

      {!checking && <MobileBottomNav isApproved={isApproved} />}
    </Box>
  );
}
