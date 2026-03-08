import { Box, Typography, Avatar, Stack, IconButton } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SettingsIcon from "@mui/icons-material/Settings";

export default function EmployerTopbar() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <Box
      sx={{
        height: 70,
        background: "#FFEEA9",
        borderRadius: 3,
        mb: 3,
        px: 3,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        color: "#4a2b12",
        boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
      }}
    >
      <Typography variant="h6" fontWeight="bold">
        Employer Dashboard
      </Typography>

      <Stack direction="row" spacing={2} alignItems="center">
        <IconButton sx={{ color: "#4a2b12" }}>
          <NotificationsIcon />
        </IconButton>

        <IconButton sx={{ color: "#4a2b12" }}>
          <SettingsIcon />
        </IconButton>

        <Stack direction="row" spacing={1} alignItems="center">
          <Avatar sx={{ bgcolor: "#FF7D29", color: "#fff" }}>
            {user?.email?.[0]?.toUpperCase() || "E"}
          </Avatar>

          <Typography variant="body2">
            {user?.email || "Employer"}
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
}