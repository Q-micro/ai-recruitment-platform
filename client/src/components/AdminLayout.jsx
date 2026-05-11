/**
 * The AdminLayout component in this code snippet creates a responsive admin dashboard layout with a
 * sidebar, topbar, and bottom navigation for mobile devices.
 * @returns The `AdminLayout` component is being returned. It is a layout component for an admin
 * dashboard interface. The layout consists of a sidebar, topbar, main content area, and a mobile
 * bottom navigation bar. The main content area can render the children components passed to it or
 * render nested routes using the `Outlet` component from `react-router-dom`.
 */
import { Box, Container, Paper, Typography } from "@mui/material";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";

import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import WorkOutlineRoundedIcon from "@mui/icons-material/WorkOutlineRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import PaidRoundedIcon from "@mui/icons-material/PaidRounded";

const linkStyle = { textDecoration: "none" };

const bottomNavItems = [
  {
    to: "/admin/dashboard",
    label: "Home",
    icon: <DashboardRoundedIcon sx={{ fontSize: 21 }} />,
  },
  {
    to: "/admin/candidates",
    label: "Candidates",
    icon: <GroupsRoundedIcon sx={{ fontSize: 21 }} />,
  },
  {
    to: "/admin/jobs",
    label: "Jobs",
    icon: <WorkOutlineRoundedIcon sx={{ fontSize: 21 }} />,
  },
  {
    to: "/admin/companies",
    label: "Companies",
    icon: <BusinessRoundedIcon sx={{ fontSize: 21 }} />,
  },
  {
    to: "/admin/sales",
    label: "Sales",
    icon: <PaidRoundedIcon sx={{ fontSize: 21 }} />,
  },
];

function MobileAdminBottomNav() {
  const location = useLocation();

  function isActivePath(to) {
    if (to === "/admin/dashboard") {
      return (
        location.pathname === "/admin" ||
        location.pathname === "/admin/dashboard"
      );
    }

    return location.pathname.startsWith(to);
  }

  return (
    <Box
      sx={{
        display: { xs: "block", md: "none" },
        position: "fixed",
        left: 10,
        right: 10,
        bottom: 10,
        zIndex: 50,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          px: 0.8,
          py: 0.75,
          borderRadius: 5,
          background: "rgba(15,23,42,0.94)",
          border: "1px solid rgba(148,163,184,0.20)",
          boxShadow: "0 18px 45px rgba(0,0,0,0.45)",
          backdropFilter: "blur(16px)",
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: `repeat(${bottomNavItems.length}, 1fr)`,
            gap: 0.3,
          }}
        >
          {bottomNavItems.map((item) => {
            const active = isActivePath(item.to);

            return (
              <NavLink key={item.to} to={item.to} style={linkStyle}>
                <Box
                  sx={{
                    minHeight: 56,
                    borderRadius: 4,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 0.25,
                    color: active ? "#60a5fa" : "rgba(226,232,240,0.68)",
                    background: active
                      ? "rgba(59,130,246,0.16)"
                      : "transparent",
                    border: active
                      ? "1px solid rgba(96,165,250,0.22)"
                      : "1px solid transparent",
                    transition: "0.18s ease",
                  }}
                >
                  {item.icon}
                  <Typography
                    sx={{
                      fontSize: 10,
                      fontWeight: active ? 900 : 700,
                      lineHeight: 1,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.label}
                  </Typography>
                </Box>
              </NavLink>
            );
          })}
        </Box>
      </Paper>
    </Box>
  );
}

export default function AdminLayout({ children }) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        background: `
          radial-gradient(circle at 15% 20%, rgba(0,117,255,0.14), transparent 22%),
          radial-gradient(circle at 85% 18%, rgba(139,92,246,0.16), transparent 20%),
          radial-gradient(circle at 70% 75%, rgba(34,197,94,0.10), transparent 18%),
          linear-gradient(180deg, #060b16 0%, #0b1220 45%, #0f172a 100%)
        `,
        overflowX: "hidden",
      }}
    >
      <Box sx={{ display: { xs: "none", md: "block" }, flexShrink: 0 }}>
        <AdminSidebar />
      </Box>

      <Box
        sx={{
          flexGrow: 1,
          minWidth: 0,
          position: "relative",
        }}
      >
        <Box
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 20,
            px: { xs: 1.5, md: 3 },
            pt: { xs: 1.5, md: 3 },
            backdropFilter: "blur(10px)",
          }}
        >
          <AdminTopbar />
        </Box>

        <Container
          maxWidth="xl"
          sx={{
            pb: { xs: 11, md: 4 },
            pt: { xs: 1.5, md: 2 },
            px: { xs: 1.5, md: 3 },
          }}
        >
          {children ? children : <Outlet />}
        </Container>
      </Box>

      <MobileAdminBottomNav />
    </Box>
  );
}
