/**
 * The `AdminSettings` function in JavaScript React manages user account settings, preferences, and
 * security features within an admin dashboard interface.
 */
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import LockResetIcon from "@mui/icons-material/LockReset";
import AdminLayout from "../../components/AdminLayout";
//import { useAppThemeMode } from "../../theme/AppThemeProvider";

const glassCardSx = (theme) => ({
  borderRadius: 3,
  bgcolor:
    theme.palette.mode === "dark"
      ? "rgba(15, 23, 42, 0.45)"
      : "rgba(255, 255, 255, 0.78)",
  border: `1px solid ${theme.palette.divider}`,
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
  boxShadow:
    theme.palette.mode === "dark"
      ? "0 8px 30px rgba(0,0,0,0.18)"
      : "0 8px 30px rgba(15,23,42,0.08)",
});

export default function AdminSettings() {
  const { mode, setMode } = useAppThemeMode();

  const storedUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    role: "Admin",
    timezone: "Asia/Bahrain",
    language: "English",
    dark_mode: mode === "dark",
    email_notifications: true,
    sales_alerts: true,
    weekly_reports: false,
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      dark_mode: mode === "dark",
    }));
  }, [mode]);

  useEffect(() => {
    if (!storedUser) return;

    setForm((prev) => ({
      ...prev,
      full_name: storedUser.full_name || storedUser.name || "",
      email: storedUser.email || "",
      phone: storedUser.phone || "",
      role: storedUser.role || "Admin",
      timezone: storedUser.timezone || "Asia/Bahrain",
      language: storedUser.language || "English",
      dark_mode:
        typeof storedUser.dark_mode === "boolean"
          ? storedUser.dark_mode
          : mode === "dark",
      email_notifications:
        typeof storedUser.email_notifications === "boolean"
          ? storedUser.email_notifications
          : true,
      sales_alerts:
        typeof storedUser.sales_alerts === "boolean"
          ? storedUser.sales_alerts
          : true,
      weekly_reports:
        typeof storedUser.weekly_reports === "boolean"
          ? storedUser.weekly_reports
          : false,
    }));
  }, [storedUser, mode]);

  const initial = form.email?.[0]?.toUpperCase() || "A";

  const handleChange = (field) => (event) => {
    setForm((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleToggle = (field) => (event) => {
    const checked = event.target.checked;

    setForm((prev) => ({
      ...prev,
      [field]: checked,
    }));

    if (field === "dark_mode") {
      setMode(checked ? "dark" : "light");
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSavingProfile(true);
      setSaveMessage("");
      setSaveError("");

      if (!form.full_name.trim()) {
        throw new Error("Full name is required");
      }

      if (!form.email.trim()) {
        throw new Error("Email is required");
      }

      const updatedUser = {
        ...(storedUser || {}),
        full_name: form.full_name.trim(),
        name: form.full_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        role: form.role,
        timezone: form.timezone,
        language: form.language,
        dark_mode: form.dark_mode,
        email_notifications: form.email_notifications,
        sales_alerts: form.sales_alerts,
        weekly_reports: form.weekly_reports,
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));

      setSaveMessage("Settings saved successfully.");
    } catch (err) {
      setSaveError(err.message || "Failed to save settings");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      setSavingPassword(true);
      setPasswordMessage("");
      setPasswordError("");

      if (!form.current_password) {
        throw new Error("Current password is required");
      }

      if (!form.new_password) {
        throw new Error("New password is required");
      }

      if (form.new_password.length < 6) {
        throw new Error("New password must be at least 6 characters");
      }

      if (form.new_password !== form.confirm_password) {
        throw new Error("New password and confirm password do not match");
      }

      setPasswordMessage("Password updated successfully.");

      setForm((prev) => ({
        ...prev,
        current_password: "",
        new_password: "",
        confirm_password: "",
      }));
    } catch (err) {
      setPasswordError(err.message || "Failed to update password");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <AdminLayout title="Settings">
      <Box
        sx={(theme) => ({
          minHeight: "100vh",
          bgcolor: theme.palette.background.default,
          color: theme.palette.text.primary,
          backgroundImage:
            theme.palette.mode === "dark"
              ? "radial-gradient(circle at top left, rgba(59,130,246,0.12), transparent 30%), radial-gradient(circle at top right, rgba(168,85,247,0.10), transparent 28%)"
              : "radial-gradient(circle at top left, rgba(59,130,246,0.10), transparent 32%), radial-gradient(circle at top right, rgba(168,85,247,0.08), transparent 28%)",
          p: { xs: 2, md: 4 },
        })}
      >
        <Box sx={{ maxWidth: 1100, mx: "auto" }}>
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="h4"
              sx={(theme) => ({
                color: theme.palette.text.primary,
                fontWeight: 700,
                letterSpacing: -0.5,
                mb: 0.5,
              })}
            >
              Settings
            </Typography>
            <Typography
              variant="body2"
              sx={(theme) => ({ color: theme.palette.text.secondary })}
            >
              Manage your account, preferences, and security.
            </Typography>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card elevation={0} sx={(theme) => glassCardSx(theme)}>
                <CardContent sx={{ p: 3 }}>
                  <Stack spacing={2} alignItems="center">
                    <Avatar
                      sx={{
                        width: 82,
                        height: 82,
                        bgcolor: "#FF6500",
                        fontSize: 28,
                        fontWeight: 800,
                      }}
                    >
                      {initial}
                    </Avatar>

                    <Box sx={{ textAlign: "center", width: "100%" }}>
                      <Typography
                        sx={(theme) => ({
                          color: theme.palette.text.primary,
                          fontWeight: 700,
                          fontSize: 18,
                        })}
                      >
                        {form.full_name || "Admin User"}
                      </Typography>

                      <Typography
                        sx={(theme) => ({
                          color: theme.palette.text.secondary,
                          fontSize: 13,
                          mt: 0.5,
                          wordBreak: "break-word",
                        })}
                      >
                        {form.email || "admin@email.com"}
                      </Typography>

                      <Box sx={{ mt: 1.5 }}>
                        <Chip
                          label={form.role || "Admin"}
                          size="small"
                          sx={(theme) => ({
                            bgcolor:
                              theme.palette.mode === "dark"
                                ? "rgba(37,99,235,0.18)"
                                : "rgba(37,99,235,0.10)",
                            color:
                              theme.palette.mode === "dark"
                                ? "#93c5fd"
                                : "#1d4ed8",
                            border: `1px solid ${theme.palette.divider}`,
                          })}
                        />
                      </Box>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={8}>
              <Stack spacing={3}>
                <Card elevation={0} sx={(theme) => glassCardSx(theme)}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography
                      sx={(theme) => ({
                        color: theme.palette.text.primary,
                        fontWeight: 700,
                        fontSize: 16,
                        mb: 2,
                      })}
                    >
                      Profile / Account
                    </Typography>

                    {!!saveError && (
                      <Alert severity="error" sx={{ mb: 2 }}>
                        {saveError}
                      </Alert>
                    )}

                    {!!saveMessage && (
                      <Alert severity="success" sx={{ mb: 2 }}>
                        {saveMessage}
                      </Alert>
                    )}

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Full name"
                          value={form.full_name}
                          onChange={handleChange("full_name")}
                          fullWidth
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Email"
                          value={form.email}
                          onChange={handleChange("email")}
                          fullWidth
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Phone"
                          value={form.phone}
                          onChange={handleChange("phone")}
                          fullWidth
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Role"
                          value={form.role}
                          onChange={handleChange("role")}
                          fullWidth
                          disabled
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <TextField
                          select
                          label="Timezone"
                          value={form.timezone}
                          onChange={handleChange("timezone")}
                          fullWidth
                          SelectProps={{ native: true }}
                        >
                          <option value="Asia/Bahrain">Asia/Bahrain</option>
                          <option value="Asia/Dubai">Asia/Dubai</option>
                          <option value="Asia/Riyadh">Asia/Riyadh</option>
                          <option value="Europe/London">Europe/London</option>
                        </TextField>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <TextField
                          select
                          label="Language"
                          value={form.language}
                          onChange={handleChange("language")}
                          fullWidth
                          SelectProps={{ native: true }}
                        >
                          <option value="English">English</option>
                          <option value="Arabic">Arabic</option>
                        </TextField>
                      </Grid>
                    </Grid>

                    <Box
                      sx={{
                        mt: 2.5,
                        display: "flex",
                        justifyContent: "flex-end",
                      }}
                    >
                      <Button
                        variant="contained"
                        startIcon={<SaveIcon />}
                        onClick={handleSaveProfile}
                        disabled={savingProfile}
                        sx={{
                          textTransform: "none",
                          borderRadius: 2,
                          bgcolor: "#2563eb",
                          "&:hover": {
                            bgcolor: "#1d4ed8",
                          },
                        }}
                      >
                        {savingProfile ? "Saving..." : "Save Changes"}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>

                <Card elevation={0} sx={(theme) => glassCardSx(theme)}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography
                      sx={(theme) => ({
                        color: theme.palette.text.primary,
                        fontWeight: 700,
                        fontSize: 16,
                        mb: 2,
                      })}
                    >
                      Preferences
                    </Typography>

                    <Stack spacing={2}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 2,
                        }}
                      >
                        <Box>
                          <Typography
                            sx={(theme) => ({
                              color: theme.palette.text.primary,
                              fontWeight: 600,
                            })}
                          >
                            Dark mode
                          </Typography>
                          <Typography
                            sx={(theme) => ({
                              color: theme.palette.text.secondary,
                              fontSize: 13,
                            })}
                          >
                            Switch between dark and light mode instantly.
                          </Typography>
                        </Box>
                        <Switch
                          checked={form.dark_mode}
                          onChange={handleToggle("dark_mode")}
                        />
                      </Box>

                      <Divider
                        sx={(theme) => ({ borderColor: theme.palette.divider })}
                      />

                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 2,
                        }}
                      >
                        <Box>
                          <Typography
                            sx={(theme) => ({
                              color: theme.palette.text.primary,
                              fontWeight: 600,
                            })}
                          >
                            Email notifications
                          </Typography>
                          <Typography
                            sx={(theme) => ({
                              color: theme.palette.text.secondary,
                              fontSize: 13,
                            })}
                          >
                            Receive updates and important account activity
                            emails.
                          </Typography>
                        </Box>
                        <Switch
                          checked={form.email_notifications}
                          onChange={handleToggle("email_notifications")}
                        />
                      </Box>

                      <Divider
                        sx={(theme) => ({ borderColor: theme.palette.divider })}
                      />

                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 2,
                        }}
                      >
                        <Box>
                          <Typography
                            sx={(theme) => ({
                              color: theme.palette.text.primary,
                              fontWeight: 600,
                            })}
                          >
                            Sales alerts
                          </Typography>
                          <Typography
                            sx={(theme) => ({
                              color: theme.palette.text.secondary,
                              fontSize: 13,
                            })}
                          >
                            Get notified when new sales activity is recorded.
                          </Typography>
                        </Box>
                        <Switch
                          checked={form.sales_alerts}
                          onChange={handleToggle("sales_alerts")}
                        />
                      </Box>

                      <Divider
                        sx={(theme) => ({ borderColor: theme.palette.divider })}
                      />

                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 2,
                        }}
                      >
                        <Box>
                          <Typography
                            sx={(theme) => ({
                              color: theme.palette.text.primary,
                              fontWeight: 600,
                            })}
                          >
                            Weekly reports
                          </Typography>
                          <Typography
                            sx={(theme) => ({
                              color: theme.palette.text.secondary,
                              fontSize: 13,
                            })}
                          >
                            Receive a weekly summary of sales and performance.
                          </Typography>
                        </Box>
                        <Switch
                          checked={form.weekly_reports}
                          onChange={handleToggle("weekly_reports")}
                        />
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>

                <Card elevation={0} sx={(theme) => glassCardSx(theme)}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography
                      sx={(theme) => ({
                        color: theme.palette.text.primary,
                        fontWeight: 700,
                        fontSize: 16,
                        mb: 2,
                      })}
                    >
                      Security
                    </Typography>

                    {!!passwordError && (
                      <Alert severity="error" sx={{ mb: 2 }}>
                        {passwordError}
                      </Alert>
                    )}

                    {!!passwordMessage && (
                      <Alert severity="success" sx={{ mb: 2 }}>
                        {passwordMessage}
                      </Alert>
                    )}

                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          label="Current password"
                          type="password"
                          value={form.current_password}
                          onChange={handleChange("current_password")}
                          fullWidth
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="New password"
                          type="password"
                          value={form.new_password}
                          onChange={handleChange("new_password")}
                          fullWidth
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Confirm new password"
                          type="password"
                          value={form.confirm_password}
                          onChange={handleChange("confirm_password")}
                          fullWidth
                        />
                      </Grid>
                    </Grid>

                    <Box
                      sx={{
                        mt: 2.5,
                        display: "flex",
                        justifyContent: "flex-end",
                      }}
                    >
                      <Button
                        variant="outlined"
                        startIcon={<LockResetIcon />}
                        onClick={handleChangePassword}
                        disabled={savingPassword}
                        sx={(theme) => ({
                          textTransform: "none",
                          borderRadius: 2,
                          color: theme.palette.text.primary,
                          borderColor: theme.palette.divider,
                        })}
                      >
                        {savingPassword ? "Updating..." : "Update Password"}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </AdminLayout>
  );
}
