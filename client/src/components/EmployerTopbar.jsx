/**
 * The `EmployerTopbar` component in JavaScript React displays notifications and settings for an
 * employer user interface.
 * @returns The `EmployerTopbar` component is being returned. It consists of a top bar UI for an
 * employer dashboard with notifications, settings, and user information. The component includes
 * functionality to fetch notifications, mark notifications as read, mark all notifications as read,
 * and handle notification clicks. The UI elements include icons, badges, popovers, buttons, avatars,
 * and typography components styled using Material-UI
 */
import {
  Box,
  Typography,
  Avatar,
  Stack,
  IconButton,
  Tooltip,
  Badge,
  Popover,
  Paper,
  Button,
  Divider,
  CircularProgress,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SettingsIcon from "@mui/icons-material/Settings";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:3001";

export default function EmployerTopbar() {
  const navigate = useNavigate();

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  const initial = user?.email?.[0]?.toUpperCase() || "E";

  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  const unreadCount = notifications.filter((item) => !item.is_read).length;
  const open = Boolean(anchorEl);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  async function fetchNotifications() {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      setLoadingNotifications(true);

      const res = await fetch(`${API_BASE_URL}/api/employer/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        console.error("Employer notifications error:", data);
        return;
      }

      setNotifications(
        Array.isArray(data.notifications) ? data.notifications : [],
      );
    } catch (error) {
      console.error("Employer notifications fetch error:", error);
    } finally {
      setLoadingNotifications(false);
    }
  }

  async function markAsRead(notificationId) {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(
        `${API_BASE_URL}/api/employer/notifications/${notificationId}/read`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        console.error("Mark employer notification read error:", data);
        return;
      }

      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notificationId ? { ...item, is_read: true } : item,
        ),
      );
    } catch (error) {
      console.error("Mark employer notification read error:", error);
    }
  }

  async function markAllAsRead() {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(
        `${API_BASE_URL}/api/employer/notifications/read-all`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        console.error("Mark all employer notifications read error:", data);
        return;
      }

      setNotifications((prev) =>
        prev.map((item) => ({ ...item, is_read: true })),
      );
    } catch (error) {
      console.error("Mark all employer notifications read error:", error);
    }
  }

  function handleNotificationClick(item) {
    if (!item.is_read) {
      markAsRead(item.id);
    }

    if (item.link) {
      setAnchorEl(null);
      navigate(item.link);
    }
  }

  return (
    <Box
      sx={{
        height: 70,
        background: "rgba(249, 241, 207, 0.08)",
        borderRadius: 3,
        mb: 3,
        px: { xs: 2, md: 3 },
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        color: "#4a2b12",
        border: "1px solid rgba(90,52,24,0.10)",
        boxShadow: "0 10px 28px rgba(90,52,24,0.10)",
        backdropFilter: "blur(14px)",
      }}
    >
      <Box sx={{ minWidth: 0 }}></Box>

      <Stack direction="row" spacing={1.2} alignItems="center">
        <Tooltip title="Notifications">
          <IconButton
            onClick={(event) => setAnchorEl(event.currentTarget)}
            sx={{
              color: "#4a2b12",
              bgcolor: "rgba(255,255,255,0.38)",
              border: "1px solid rgba(90,52,24,0.10)",
              "&:hover": {
                bgcolor: "rgba(255,255,255,0.55)",
              },
            }}
          >
            <Badge color="error" variant={unreadCount > 0 ? "dot" : "standard"}>
              <NotificationsIcon fontSize="small" />
            </Badge>
          </IconButton>
        </Tooltip>

        <Popover
          open={open}
          anchorEl={anchorEl}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          PaperProps={{
            sx: {
              mt: 1,
              width: { xs: 330, sm: 390 },
              maxWidth: "calc(100vw - 24px)",
              borderRadius: 4,
              background: "rgba(255,255,255,0.98)",
              color: "#4a2b12",
              border: "1px solid rgba(90,52,24,0.12)",
              boxShadow: "0 20px 60px rgba(90,52,24,0.22)",
              overflow: "hidden",
            },
          }}
        >
          <Box sx={{ p: 2 }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Box>
                <Typography sx={{ fontWeight: 900, fontSize: 17 }}>
                  Notifications
                </Typography>
                <Typography sx={{ color: "#7a5630", fontSize: 12.5 }}>
                  {unreadCount} unread
                </Typography>
              </Box>

              {unreadCount > 0 && (
                <Button
                  size="small"
                  onClick={markAllAsRead}
                  sx={{
                    textTransform: "none",
                    color: "#FF7D29",
                    fontWeight: 900,
                  }}
                >
                  Mark all read
                </Button>
              )}
            </Stack>
          </Box>

          <Divider sx={{ borderColor: "rgba(90,52,24,0.10)" }} />

          <Box sx={{ maxHeight: 360, overflowY: "auto", p: 1 }}>
            {loadingNotifications && notifications.length === 0 ? (
              <Stack alignItems="center" sx={{ py: 4 }}>
                <CircularProgress size={26} sx={{ color: "#FF7D29" }} />
              </Stack>
            ) : notifications.length === 0 ? (
              <Box sx={{ p: 2 }}>
                <Typography sx={{ color: "#7a5630" }}>
                  No notifications yet.
                </Typography>
              </Box>
            ) : (
              notifications.slice(0, 8).map((item) => (
                <Paper
                  key={item.id}
                  elevation={0}
                  onClick={() => handleNotificationClick(item)}
                  sx={{
                    p: 1.4,
                    mb: 1,
                    borderRadius: 3,
                    cursor: "pointer",
                    background: item.is_read
                      ? "rgba(90,52,24,0.035)"
                      : "rgba(255,125,41,0.12)",
                    border: item.is_read
                      ? "1px solid rgba(90,52,24,0.08)"
                      : "1px solid rgba(255,125,41,0.24)",
                    "&:hover": {
                      background: item.is_read
                        ? "rgba(90,52,24,0.06)"
                        : "rgba(255,125,41,0.18)",
                    },
                  }}
                >
                  <Stack direction="row" spacing={1.2} alignItems="flex-start">
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        bgcolor: item.is_read
                          ? "rgba(122,86,48,0.35)"
                          : "#ef4444",
                        mt: 0.65,
                        flexShrink: 0,
                      }}
                    />

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 900, fontSize: 13.5 }}>
                        {item.title || "Notification"}
                      </Typography>

                      <Typography
                        sx={{
                          color: "#7a5630",
                          fontSize: 12.5,
                          mt: 0.35,
                          lineHeight: 1.35,
                        }}
                      >
                        {item.message}
                      </Typography>

                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        sx={{ mt: 0.8 }}
                      >
                        <Typography
                          sx={{ color: "rgba(122,86,48,0.70)", fontSize: 11.5 }}
                        >
                          {item.created_at
                            ? new Date(item.created_at).toLocaleString()
                            : ""}
                        </Typography>

                        {item.link && (
                          <OpenInNewRoundedIcon
                            sx={{ color: "rgba(122,86,48,0.70)", fontSize: 14 }}
                          />
                        )}
                      </Stack>
                    </Box>

                    {!item.is_read && (
                      <CheckCircleRoundedIcon
                        onClick={(event) => {
                          event.stopPropagation();
                          markAsRead(item.id);
                        }}
                        sx={{
                          color: "#FF7D29",
                          fontSize: 20,
                          cursor: "pointer",
                          mt: 0.2,
                        }}
                      />
                    )}
                  </Stack>
                </Paper>
              ))
            )}
          </Box>
        </Popover>

        <IconButton
          onClick={() => navigate("/employer/settings")}
          sx={{
            color: "#4a2b12",
            bgcolor: "rgba(255,255,255,0.38)",
            border: "1px solid rgba(90,52,24,0.10)",
            display: { xs: "none", sm: "inline-flex" },
            "&:hover": {
              bgcolor: "rgba(255,255,255,0.55)",
            },
          }}
        >
          <SettingsIcon fontSize="small" />
        </IconButton>

        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{
            display: { xs: "none", sm: "flex" },
            pl: 1.1,
            pr: 1.4,
            py: 0.75,
            borderRadius: 999,
            bgcolor: "rgba(255,255,255,0.38)",
            border: "1px solid rgba(90,52,24,0.10)",
          }}
        >
          <Avatar
            sx={{ bgcolor: "#FF7D29", color: "#fff", width: 34, height: 34 }}
          >
            {initial}
          </Avatar>

          <Typography
            variant="body2"
            sx={{
              maxWidth: 180,
              color: "#4a2b12",
              fontWeight: 700,
            }}
            noWrap
          >
            {user?.email || "Employer"}
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
}
