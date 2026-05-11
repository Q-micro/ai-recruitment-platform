/**
 * The CandidateNotifications component fetches and displays notifications for a candidate, allowing
 * them to mark notifications as read.
 */
import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import CandidateLayout from "../../components/CandidateLayout";

const API_BASE_URL = "http://localhost:3001";

export default function CandidateNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function fetchNotifications() {
    try {
      setErr("");
      setLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("You are not logged in");
      }

      const res = await fetch(`${API_BASE_URL}/api/candidate/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Failed to load notifications");
      }

      setNotifications(
        Array.isArray(data.notifications) ? data.notifications : [],
      );
    } catch (error) {
      console.error(error);
      setErr(error.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }

  async function markAsRead(notificationId) {
    try {
      setErr("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("You are not logged in");
      }

      const res = await fetch(
        `${API_BASE_URL}/api/candidate/notifications/${notificationId}/read`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Failed to mark notification as read");
      }

      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notificationId ? { ...item, is_read: true } : item,
        ),
      );
    } catch (error) {
      console.error(error);
      setErr(error.message || "Failed to update notification");
    }
  }

  return (
    <CandidateLayout>
      {(colors) => (
        <>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
            spacing={2}
            mb={3}
          >
            <Box></Box>

            <Chip
              label={`${notifications.filter((n) => !n.is_read).length} unread`}
              sx={{
                fontWeight: 700,
                color: "#5d9571",
                backgroundColor: "rgba(74,222,128,0.16)",
                border: "1px solid rgba(24, 134, 64, 0.35)",
              }}
            />
          </Stack>

          {err && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>
              {err}
            </Alert>
          )}

          {loading ? (
            <Typography sx={{ color: colors.text }}>
              Loading notifications...
            </Typography>
          ) : (
            <Grid container spacing={3}>
              {notifications.length > 0 ? (
                notifications.map((item) => (
                  <Grid item xs={12} key={item.id}>
                    <Card
                      sx={{
                        borderRadius: 4,
                        boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
                        backgroundColor: item.is_read
                          ? "rgba(255,255,255,0.06)"
                          : "rgba(74,222,128,0.10)",
                        border: item.is_read
                          ? "1px solid rgba(255,255,255,0.10)"
                          : "1px solid rgba(74,222,128,0.35)",
                      }}
                    >
                      <CardContent>
                        <Stack
                          direction={{ xs: "column", md: "row" }}
                          justifyContent="space-between"
                          alignItems={{ xs: "flex-start", md: "center" }}
                          spacing={2}
                        >
                          <Box>
                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="center"
                              mb={1}
                            >
                              <Typography
                                variant="h6"
                                fontWeight="bold"
                                sx={{ color: colors.text }}
                              >
                                Application Update
                              </Typography>

                              {!item.is_read && (
                                <Chip
                                  label="New"
                                  size="small"
                                  sx={{
                                    color: "#6ba27e",
                                    backgroundColor: "rgba(74,222,128,0.18)",
                                    border: "1px solid rgba(74,222,128,0.35)",
                                    fontWeight: 700,
                                  }}
                                />
                              )}
                            </Stack>

                            <Typography
                              variant="body2"
                              sx={{ color: colors.subtext }}
                            >
                              {item.message}
                            </Typography>

                            <Typography
                              variant="caption"
                              sx={{
                                color: colors.subtext,
                                display: "block",
                                mt: 1,
                                opacity: 0.8,
                              }}
                            >
                              {item.created_at
                                ? new Date(item.created_at).toLocaleString()
                                : ""}
                            </Typography>
                          </Box>

                          {!item.is_read && (
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => markAsRead(item.id)}
                              sx={{
                                textTransform: "none",
                                borderRadius: 3,
                                color: colors.text,
                                borderColor: "rgba(255,255,255,0.25)",
                              }}
                            >
                              Mark as read
                            </Button>
                          )}
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <Card
                    sx={{
                      borderRadius: 4,
                      boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
                      backgroundColor: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.10)",
                    }}
                  >
                    <CardContent>
                      <Typography sx={{ color: colors.text }} fontWeight="bold">
                        No notifications yet.
                      </Typography>
                      <Typography sx={{ color: colors.subtext, mt: 1 }}>
                        Application updates will appear here.
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          )}
        </>
      )}
    </CandidateLayout>
  );
}
