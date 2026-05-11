/**
 * The `AdminTopbar` component in JavaScript React displays a top bar with notifications and user
 * information for an admin user.
 * @returns The `AdminTopbar` component is being returned. It consists of various UI elements such as
 * buttons, badges, popovers, avatars, typography, and more. The component handles notifications for an
 * admin user, displaying unread notifications, marking notifications as read, and providing
 * functionality to view and interact with notifications. The component also displays user information
 * like the user's initials and email address.
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
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:3001";

export default function AdminTopbar() {
  const navigate = useNavigate();

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  const initial = user?.email?.[0]?.toUpperCase() || "A";

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

      const res = await fetch(`${API_BASE_URL}/api/admin/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        console.error("Admin notifications error:", data);
        return;
      }

      setNotifications(
        Array.isArray(data.notifications) ? data.notifications : [],
      );
    } catch (error) {
      console.error("Admin notifications fetch error:", error);
    } finally {
      setLoadingNotifications(false);
    }
  }

  async function markAsRead(notificationId) {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(
        `${API_BASE_URL}/api/admin/notifications/${notificationId}/read`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        console.error("Mark admin notification read error:", data);
        return;
      }

      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notificationId ? { ...item, is_read: true } : item,
        ),
      );
    } catch (error) {
      console.error("Mark admin notification read error:", error);
    }
  }

  async function markAllAsRead() {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(
        `${API_BASE_URL}/api/admin/notifications/read-all`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        console.error("Mark all admin notifications read error:", data);
        return;
      }

      setNotifications((prev) =>
        prev.map((item) => ({ ...item, is_read: true })),
      );
    } catch (error) {
      console.error("Mark all admin notifications read error:", error);
    }
  }

  function handleNotificationClick(item) {
    if (!item.is_read) markAsRead(item.id);

    if (item.link) {
      setAnchorEl(null);
      navigate(item.link);
    }
  }

  return (
    <Box
      sx={(theme) => ({
        height: 68,
        mb: 3,
        px: { xs: 2, md: 3 },
        borderRadius: 3,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        color: theme.palette.text.primary,
        background:
          theme.palette.mode === "dark"
            ? "linear-gradient(180deg, rgba(10,16,28,0.92) 0%, rgba(12,18,32,0.84) 100%)"
            : "linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(248,250,252,0.88) 100%)",
        border: `1px solid ${theme.palette.divider}`,
        backdropFilter: "blur(14px)",
        boxShadow:
          theme.palette.mode === "dark"
            ? "0 10px 30px rgba(0,0,0,0.24)"
            : "0 10px 30px rgba(15,23,42,0.08)",
      })}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="body2"
          sx={(theme) => ({
            color: theme.palette.text.secondary,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          })}
        >
          Dashboard
        </Typography>
      </Box>

      <Stack direction="row" spacing={1.2} alignItems="center">
        <Tooltip title="Notifications">
          <IconButton
            onClick={(event) => setAnchorEl(event.currentTarget)}
            sx={(theme) => ({
              color: theme.palette.text.primary,
              bgcolor:
                theme.palette.mode === "dark"
                  ? "rgba(255,255,255,0.04)"
                  : "rgba(15,23,42,0.04)",
              border: `1px solid ${theme.palette.divider}`,
              "&:hover": {
                bgcolor:
                  theme.palette.mode === "dark"
                    ? "rgba(255,255,255,0.08)"
                    : "rgba(15,23,42,0.08)",
              },
            })}
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
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          PaperProps={{
            sx: {
              mt: 1,
              width: { xs: 330, sm: 390 },
              maxWidth: "calc(100vw - 24px)",
              borderRadius: 4,
              background: "rgba(15,23,42,0.98)",
              color: "#f8fafc",
              border: "1px solid rgba(255,255,255,0.10)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.38)",
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
                <Typography
                  sx={{ color: "rgba(248,250,252,0.62)", fontSize: 12.5 }}
                >
                  {unreadCount} unread
                </Typography>
              </Box>

              {unreadCount > 0 && (
                <Button
                  size="small"
                  onClick={markAllAsRead}
                  sx={{
                    textTransform: "none",
                    color: "#60a5fa",
                    fontWeight: 800,
                  }}
                >
                  Mark all read
                </Button>
              )}
            </Stack>
          </Box>

          <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />

          <Box sx={{ maxHeight: 360, overflowY: "auto", p: 1 }}>
            {loadingNotifications && notifications.length === 0 ? (
              <Stack alignItems="center" sx={{ py: 4 }}>
                <CircularProgress size={26} sx={{ color: "#60a5fa" }} />
              </Stack>
            ) : notifications.length === 0 ? (
              <Box sx={{ p: 2 }}>
                <Typography sx={{ color: "rgba(248,250,252,0.70)" }}>
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
                      ? "rgba(255,255,255,0.035)"
                      : "rgba(96,165,250,0.12)",
                    border: item.is_read
                      ? "1px solid rgba(255,255,255,0.06)"
                      : "1px solid rgba(96,165,250,0.22)",
                    "&:hover": {
                      background: item.is_read
                        ? "rgba(255,255,255,0.06)"
                        : "rgba(96,165,250,0.18)",
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
                          ? "rgba(148,163,184,0.45)"
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
                          color: "rgba(248,250,252,0.68)",
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
                          sx={{
                            color: "rgba(248,250,252,0.45)",
                            fontSize: 11.5,
                          }}
                        >
                          {item.created_at
                            ? new Date(item.created_at).toLocaleString()
                            : ""}
                        </Typography>

                        {item.link && (
                          <OpenInNewRoundedIcon
                            sx={{
                              color: "rgba(248,250,252,0.45)",
                              fontSize: 14,
                            }}
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
                          color: "#60a5fa",
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

        <Stack
          direction="row"
          spacing={1.1}
          alignItems="center"
          sx={(theme) => ({
            pl: 1.2,
            pr: 1.4,
            py: 0.8,
            borderRadius: 999,
            bgcolor:
              theme.palette.mode === "dark"
                ? "rgba(255,255,255,0.04)"
                : "rgba(15,23,42,0.04)",
            border: `1px solid ${theme.palette.divider}`,
          })}
        >
          <Avatar
            sx={{
              width: 34,
              height: 34,
              bgcolor: "#FF6500",
              fontSize: 14,
              fontWeight: 800,
            }}
          >
            {initial}
          </Avatar>

          <Box sx={{ minWidth: 0, display: { xs: "none", sm: "block" } }}>
            <Typography
              sx={(theme) => ({
                fontSize: 13.5,
                fontWeight: 700,
                color: theme.palette.text.primary,
                lineHeight: 1.1,
              })}
              noWrap
            >
              {user?.email || "Admin"}
            </Typography>
            <Typography
              sx={(theme) => ({
                fontSize: 11.5,
                color: theme.palette.text.secondary,
                lineHeight: 1.1,
              })}
              noWrap
            >
              Account
            </Typography>
          </Box>
        </Stack>
      </Stack>
    </Box>
  );
}
