import { Box, Typography, Avatar, Stack, IconButton } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SettingsIcon from "@mui/icons-material/Settings";

export default function AdminTopbar() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <Box
      sx={{
        height: 70,
        background: "#1E3E62",
        borderRadius: 3,
        mb: 3,
        px: 3,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        color: "#fff",
        boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
      }}
    >
      <Typography variant="h6" fontWeight="bold">
        Admin Dashboard
      </Typography>

      <Stack direction="row" spacing={2} alignItems="center">
        <IconButton sx={{ color: "#fff" }}>
          <NotificationsIcon />
        </IconButton>

        <IconButton sx={{ color: "#fff" }}>
          <SettingsIcon />
        </IconButton>

        <Stack direction="row" spacing={1} alignItems="center">
          <Avatar sx={{ bgcolor: "#FF6500" }}>
            {user?.email?.[0]?.toUpperCase() || "A"}
          </Avatar>

          <Typography variant="body2">
            {user?.email || "Admin"}
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
}