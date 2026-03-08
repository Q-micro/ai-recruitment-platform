import { Box, Button, Stack, Typography, Avatar, IconButton } from "@mui/material";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { Link, useNavigate } from "react-router-dom";

export default function CandidateNavbar({ mode, setMode, colors }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  function toggleMode() {
    setMode((prev) => (prev === "light" ? "dark" : "light"));
  }

  return (
    <Box
      sx={{
        height: 72,
        px: 4,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: colors.nav,
        borderBottom: `1px solid ${colors.navBorder}`,
        position: "sticky",
        top: 0,
        zIndex: 10,
        backdropFilter: "blur(10px)",
      }}
    >
      <Typography variant="h5" fontWeight="bold" sx={{ color: colors.text }}>
        Khutwa
      </Typography>

      <Stack direction="row" spacing={1.5} alignItems="center">
        <Button component={Link} to="/candidate" sx={{ color: colors.text, textTransform: "none" }}>
          Home
        </Button>
        <Button sx={{ color: colors.text, textTransform: "none" }}>
          Jobs
        </Button>
        <Button sx={{ color: colors.text, textTransform: "none" }}>
          Applications
        </Button>
        <Button sx={{ color: colors.text, textTransform: "none" }}>
          Profile
        </Button>

        <IconButton
          onClick={toggleMode}
          sx={{
            color: colors.text,
            backgroundColor: mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
          }}
        >
          {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>

        <Avatar sx={{ bgcolor: colors.accent, color: "#fff" }}>
          {user?.email?.[0]?.toUpperCase() || "C"}
        </Avatar>

        <Button
          onClick={handleLogout}
          variant="contained"
          sx={{
            textTransform: "none",
            backgroundColor: colors.accent,
            "&:hover": {
              backgroundColor: colors.accent,
              opacity: 0.9,
            },
          }}
        >
          Logout
        </Button>
      </Stack>
    </Box>
  );
}