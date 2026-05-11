/**
 * The `CandidateDashboard` function in JavaScript React renders a dashboard for candidates, displaying
 * statistics, recommended jobs, recent applications, and an AI career assistant.
 * @returns The `CandidateDashboard` component is being returned. It consists of various UI elements
 * such as `DashboardStat`, `RecommendedJobListCard`, `AssistantCard`, and `RecentApplicationMini`
 * components. These components display statistics, recommended jobs, AI assistant information, and
 * recent job applications for a candidate. The component fetches data from APIs and renders the
 * dashboard based on the received data.
 */

import { useEffect, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import WorkOutlineRoundedIcon from "@mui/icons-material/WorkOutlineRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import BookmarkBorderRoundedIcon from "@mui/icons-material/BookmarkBorderRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";

import CandidateLayout from "../../components/CandidateLayout";
import {
  getDashboardStats,
  getRecentApplications,
  getRecommendedJobs,
} from "../../api/candidate";

function getFirstName(user) {
  const raw =
    user?.name || user?.full_name || user?.email?.split("@")?.[0] || "";
  return raw ? String(raw).split(" ")[0] : "there";
}

function getInitial(user) {
  const raw = user?.name || user?.full_name || user?.email || "C";
  return String(raw)[0]?.toUpperCase() || "C";
}

function getMatchColor(score) {
  if (score >= 75) return "#22c55e";
  if (score >= 50) return "#f59e0b";
  return "#94a3b8";
}

function recommendedText(count, singular, plural) {
  return `${count || 0} ${Number(count || 0) === 1 ? singular : plural}`;
}

function DashboardStat({ label, value, colors, mode, icon, onClick }) {
  return (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        p: { xs: 1.6, sm: 1.8 },
        minHeight: { xs: 104, sm: 112 },
        borderRadius: 4,
        background:
          mode === "dark" ? "rgba(16, 23, 38, 0.88)" : "rgba(255,255,255,0.82)",
        border: `1px solid ${colors.cardBorder}`,
        boxShadow:
          mode === "dark"
            ? "0 10px 24px rgba(0,0,0,0.20)"
            : "0 10px 24px rgba(80,45,25,0.07)",
        cursor: onClick ? "pointer" : "default",
        transition: "transform 0.18s ease, box-shadow 0.18s ease",
        "&:hover": {
          transform: onClick ? "translateY(-2px)" : "none",
          boxShadow:
            mode === "dark"
              ? "0 14px 28px rgba(0,0,0,0.26)"
              : "0 14px 28px rgba(80,45,25,0.10)",
        },
      }}
    >
      <Stack
        direction="row"
        spacing={1.4}
        alignItems="center"
        sx={{ height: "100%" }}
      >
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            background:
              mode === "dark"
                ? "rgba(255,154,61,0.14)"
                : "rgba(248,81,36,0.10)",
            color: colors.accent,
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              color: colors.text,
              fontWeight: 950,
              fontSize: { xs: 24, sm: 26 },
              lineHeight: 1,
            }}
          >
            {value}
          </Typography>

          <Typography
            sx={{
              color: colors.subtext,
              fontWeight: 800,
              fontSize: 12.5,
              lineHeight: 1.25,
              mt: 0.5,
            }}
          >
            {label}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
}

function RecommendedJobListCard({ job, colors, mode, onViewJobs }) {
  const score = Number(job.match_score || 0);

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 1.45, sm: 1.7 },
        borderRadius: 3,
        background:
          mode === "dark" ? "rgba(16, 23, 38, 0.88)" : "rgba(255,255,255,0.90)",
        border: `1px solid ${colors.cardBorder}`,
        boxShadow:
          mode === "dark"
            ? "0 10px 24px rgba(0,0,0,0.20)"
            : "0 10px 24px rgba(80,45,25,0.08)",
      }}
    >
      <Stack direction="row" spacing={1.4} alignItems="center">
        <Box
          sx={{
            width: 46,
            height: 46,
            borderRadius: 2.5,
            display: "grid",
            placeItems: "center",
            background: colors.buttonBg,
            color: "#fff",
            flexShrink: 0,
          }}
        >
          <WorkOutlineRoundedIcon />
        </Box>

        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            sx={{
              color: colors.text,
              fontWeight: 900,
              fontSize: 15.5,
              lineHeight: 1.15,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {job.title || "Untitled job"}
          </Typography>

          <Typography
            sx={{
              color: colors.subtext,
              fontSize: 12.5,
              mt: 0.35,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {job.position || "Position not set"}
          </Typography>

          <Typography sx={{ color: colors.subtext, fontSize: 12, mt: 0.25 }}>
            {job.location || "Location not set"} •{" "}
            {job.job_type || "Not specified"}
          </Typography>

          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ mt: 0.9 }}
          >
            <Chip
              size="small"
              label={`${score}% match`}
              sx={{
                height: 24,
                color: getMatchColor(score),
                background:
                  mode === "dark"
                    ? "rgba(255,255,255,0.045)"
                    : "rgba(248,81,36,0.07)",
                border: `1px solid ${colors.cardBorder}`,
                fontWeight: 900,
                fontSize: 11,
              }}
            />

            <Box sx={{ flex: 1 }}>
              <LinearProgress
                variant="determinate"
                value={Math.min(100, Math.max(0, score))}
                sx={{
                  height: 6,
                  borderRadius: 999,
                  backgroundColor:
                    mode === "dark"
                      ? "rgba(255,255,255,0.10)"
                      : "rgba(248,81,36,0.10)",
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 999,
                    background: getMatchColor(score),
                  },
                }}
              />
            </Box>
          </Stack>
        </Box>

        <Stack spacing={1} alignItems="center">
          <BookmarkBorderRoundedIcon
            sx={{ color: colors.accent, fontSize: 22 }}
          />
          <Button
            size="small"
            variant="contained"
            onClick={onViewJobs}
            sx={{
              minWidth: 72,
              borderRadius: 2.2,
              textTransform: "none",
              fontWeight: 900,
              fontSize: 12,
              background: colors.buttonBg,
              boxShadow: "none",
              "&:hover": {
                background: colors.buttonHoverBg,
                boxShadow: "none",
              },
            }}
          >
            View
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}

function AssistantCard({ stats, colors, mode, onProfile, onJobs }) {
  const completion = Number(stats.profileCompletion || 0);

  return (
    <Card
      sx={{
        borderRadius: 3,
        background:
          mode === "dark"
            ? "linear-gradient(135deg, rgba(16,23,38,0.92) 0%, rgba(27,16,22,0.86) 100%)"
            : "linear-gradient(135deg, rgba(255,247,242,0.94) 0%, rgba(255,226,210,0.86) 100%)",
        color: colors.text,
        border: `1px solid ${colors.cardBorder}`,
        boxShadow:
          mode === "dark"
            ? "0 12px 30px rgba(0,0,0,0.24)"
            : "0 12px 30px rgba(80,45,25,0.10)",
      }}
    >
      <CardContent sx={{ p: { xs: 1.8, sm: 2.2 } }}>
        <Stack direction="row" spacing={1.4} alignItems="flex-start">
          <Box
            sx={{
              width: 46,
              height: 46,
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              background: colors.buttonBg,
              color: "#fff",
              flexShrink: 0,
            }}
          >
            <AutoAwesomeRoundedIcon />
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              sx={{ color: colors.text, fontWeight: 900, fontSize: 16 }}
            >
              AI Career Assistant
            </Typography>

            <Stack spacing={0.6} sx={{ mt: 1 }}>
              <Typography sx={{ color: colors.subtext, fontSize: 12.8 }}>
                ✓{" "}
                {recommendedText(
                  stats.applicationsSent,
                  "application",
                  "applications",
                )}{" "}
                tracked
              </Typography>
              <Typography sx={{ color: colors.subtext, fontSize: 12.8 }}>
                ✓ {stats.openJobs || 0} open jobs available
              </Typography>
              <Typography sx={{ color: colors.subtext, fontSize: 12.8 }}>
                ✓ Profile completion: {completion}%
              </Typography>
            </Stack>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              sx={{ mt: 1.6 }}
            >
              <Button
                variant="contained"
                onClick={onJobs}
                sx={{
                  borderRadius: 2.4,
                  textTransform: "none",
                  fontWeight: 900,
                  background: colors.buttonBg,
                  boxShadow: "none",
                  "&:hover": {
                    background: colors.buttonHoverBg,
                    boxShadow: "none",
                  },
                }}
              >
                View recommended jobs
              </Button>

              <Button
                variant="outlined"
                onClick={onProfile}
                endIcon={<ArrowForwardRoundedIcon />}
                sx={{
                  borderRadius: 2.4,
                  textTransform: "none",
                  fontWeight: 900,
                  color: colors.accent,
                  borderColor: colors.cardBorder,
                  "&:hover": {
                    borderColor: colors.accent,
                    background: colors.hoverBg,
                  },
                }}
              >
                Improve profile
              </Button>
            </Stack>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function RecentApplicationMini({ app, colors, mode }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.4,
        borderRadius: 2.6,
        background:
          mode === "dark"
            ? "rgba(255,255,255,0.045)"
            : "rgba(255,255,255,0.66)",
        border: `1px solid ${colors.cardBorder}`,
      }}
    >
      <Stack direction="row" justifyContent="space-between" spacing={1.2}>
        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              color: colors.text,
              fontWeight: 800,
              fontSize: 13.5,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {app.job_title || app.title || "Application"}
          </Typography>
          <Typography sx={{ color: colors.subtext, fontSize: 12, mt: 0.2 }}>
            {app.status || "Applied"}
          </Typography>
        </Box>

        <Chip
          size="small"
          label="Applied"
          sx={{
            height: 24,
            color: colors.accent,
            background:
              mode === "dark"
                ? "rgba(255,154,61,0.12)"
                : "rgba(248,81,36,0.10)",
            fontWeight: 800,
            fontSize: 11,
          }}
        />
      </Stack>
    </Paper>
  );
}

export default function CandidateDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const candidateId = user?.candidate_id;

  const [stats, setStats] = useState({
    applicationsSent: 0,
    openJobs: 0,
    profileCompletion: 0,
  });
  const [recentApplications, setRecentApplications] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (candidateId) fetchDashboardData();
  }, [candidateId]);

  async function fetchDashboardData() {
    try {
      setLoading(true);
      setError("");

      const [statsData, recentAppsData, recommendedJobsData] =
        await Promise.all([
          getDashboardStats(candidateId),
          getRecentApplications(candidateId),
          getRecommendedJobs(candidateId),
        ]);

      setStats(statsData || {});
      setRecentApplications(
        Array.isArray(recentAppsData) ? recentAppsData : [],
      );
      setRecommendedJobs(
        Array.isArray(recommendedJobsData) ? recommendedJobsData : [],
      );
    } catch (error) {
      console.error(error);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }

  return (
    <CandidateLayout noShell>
      {(themeColors, mode) => {
        const c = {
          ...themeColors,
          cardShadow:
            themeColors.cardShadow ||
            (mode === "dark"
              ? "0 10px 30px rgba(0,0,0,0.24)"
              : "0 10px 26px rgba(0,0,0,0.06)"),
        };

        return (
          <Box
            sx={{
              minHeight: "100%",
              px: { xs: 0, sm: 1, md: 2 },
              py: { xs: 0.5, md: 2 },
            }}
          >
            {error && (
              <Alert
                severity="error"
                sx={{
                  mb: 2,
                  borderRadius: 2.5,
                  backgroundColor: c.cardBg,
                  color: c.text,
                  border: `1px solid ${c.cardBorder}`,
                }}
              >
                {error}
              </Alert>
            )}

            <Stack spacing={2.1}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 1.8, sm: 2.4 },
                  borderRadius: 5,
                  background:
                    mode === "dark"
                      ? "rgba(16, 23, 38, 0.72)"
                      : "rgba(255,255,255,0.78)",
                  border: `1px solid ${c.cardBorder}`,
                  boxShadow: c.cardShadow,
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  spacing={2}
                >
                  <Box>
                    <Typography
                      sx={{
                        color: c.text,
                        fontWeight: 950,
                        letterSpacing: "-0.04em",
                        lineHeight: 1.05,
                        fontSize: { xs: "1.85rem", md: "2.5rem" },
                      }}
                    >
                      Hi, {getFirstName(user)} 👋
                    </Typography>

                    <Typography
                      sx={{
                        color: c.subtext,
                        mt: 0.7,
                        fontSize: { xs: 13.5, md: 15 },
                      }}
                    >
                      Let&apos;s get you closer to your next opportunity.
                    </Typography>
                  </Box>

                  <Avatar
                    sx={{
                      width: { xs: 54, md: 68 },
                      height: { xs: 54, md: 68 },
                      background: c.buttonBg,
                      color: "#fff",
                      fontWeight: 900,
                      fontSize: { xs: 22, md: 28 },
                      border: `2px solid ${c.cardBorder}`,
                    }}
                  >
                    {getInitial(user)}
                  </Avatar>
                </Stack>
              </Paper>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                <TextField
                  fullWidth
                  placeholder="Search jobs"
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          pr: 1,
                          color: c.subtext,
                        }}
                      >
                        <SearchRoundedIcon fontSize="small" />
                      </Box>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor:
                        mode === "dark"
                          ? "rgba(16, 23, 38, 0.80)"
                          : "rgba(255,255,255,0.84)",
                      borderRadius: 4,
                      color: c.text,
                      boxShadow:
                        mode === "dark"
                          ? "0 8px 20px rgba(0,0,0,0.18)"
                          : "0 8px 20px rgba(80,45,25,0.07)",
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: c.cardBorder,
                    },
                    "& .MuiInputBase-input": {
                      color: c.text,
                    },
                    "& .MuiInputBase-input::placeholder": {
                      opacity: 0.75,
                      color: c.subtext,
                    },
                  }}
                />

                <Button
                  variant="contained"
                  onClick={() => navigate("/candidate/jobs")}
                  sx={{
                    minWidth: { xs: "100%", sm: 150 },
                    textTransform: "none",
                    borderRadius: 4,
                    px: 3,
                    py: 1.45,
                    fontWeight: 900,
                    background: c.buttonBg,
                    boxShadow: "none",
                    "&:hover": {
                      background: c.buttonHoverBg,
                      boxShadow: "none",
                    },
                  }}
                >
                  Browse
                </Button>
              </Stack>

              <Grid container spacing={1.2}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <DashboardStat
                    label="Jobs matched"
                    value={loading ? "..." : recommendedJobs.length}
                    icon={<StarRoundedIcon sx={{ fontSize: 19 }} />}
                    colors={c}
                    mode={mode}
                    onClick={() => navigate("/candidate/jobs")}
                  />
                </Grid>

                <Grid size={{ xs: 6, sm: 4 }}>
                  <DashboardStat
                    label="Applied jobs"
                    value={loading ? "..." : stats.applicationsSent || 0}
                    icon={<ReceiptLongRoundedIcon sx={{ fontSize: 19 }} />}
                    colors={c}
                    mode={mode}
                    onClick={() => navigate("/candidate/applications")}
                  />
                </Grid>

                <Grid size={{ xs: 6, sm: 4 }}>
                  <DashboardStat
                    label="Open jobs"
                    value={loading ? "..." : stats.openJobs || 0}
                    icon={<WorkOutlineRoundedIcon sx={{ fontSize: 19 }} />}
                    colors={c}
                    mode={mode}
                    onClick={() => navigate("/candidate/jobs")}
                  />
                </Grid>
              </Grid>

              <Stack spacing={1.3}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Box>
                    <Typography
                      sx={{ color: c.text, fontSize: 20, fontWeight: 900 }}
                    >
                      Recommended Jobs
                    </Typography>
                    <Typography sx={{ color: c.subtext, fontSize: 12.8 }}>
                      Best matches from your profile
                    </Typography>
                  </Box>

                  <Button
                    onClick={() => navigate("/candidate/jobs")}
                    sx={{
                      textTransform: "none",
                      fontWeight: 900,
                      color: c.accent,
                      minWidth: "auto",
                    }}
                  >
                    See all
                  </Button>
                </Stack>

                {recommendedJobs.length > 0 ? (
                  recommendedJobs
                    .slice(0, 4)
                    .map((job) => (
                      <RecommendedJobListCard
                        key={job.id}
                        job={job}
                        colors={c}
                        mode={mode}
                        onViewJobs={() => navigate("/candidate/jobs")}
                      />
                    ))
                ) : (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      background:
                        mode === "dark"
                          ? "rgba(16,23,38,0.82)"
                          : "rgba(255,255,255,0.80)",
                      border: `1px solid ${c.cardBorder}`,
                    }}
                  >
                    <Typography sx={{ color: c.subtext }}>
                      No recommendations available yet.
                    </Typography>
                  </Paper>
                )}
              </Stack>

              <AssistantCard
                stats={stats}
                colors={c}
                mode={mode}
                onJobs={() => navigate("/candidate/jobs")}
                onProfile={() => navigate("/candidate/profile")}
              />

              <Card
                sx={{
                  borderRadius: 3,
                  background:
                    mode === "dark"
                      ? "rgba(16,23,38,0.82)"
                      : "rgba(255,255,255,0.80)",
                  border: `1px solid ${c.cardBorder}`,
                  color: c.text,
                  boxShadow: c.cardShadow,
                }}
              >
                <CardContent sx={{ p: { xs: 1.8, sm: 2.2 } }}>
                  <Stack spacing={1.3}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography
                        sx={{ color: c.text, fontSize: 18, fontWeight: 900 }}
                      >
                        Recent applications
                      </Typography>

                      <Button
                        onClick={() => navigate("/candidate/applications")}
                        sx={{
                          textTransform: "none",
                          color: c.accent,
                          fontWeight: 900,
                        }}
                      >
                        View
                      </Button>
                    </Stack>

                    {recentApplications.length > 0 ? (
                      recentApplications
                        .slice(0, 3)
                        .map((app) => (
                          <RecentApplicationMini
                            key={app.id || `${app.job_title}-${app.status}`}
                            app={app}
                            colors={c}
                            mode={mode}
                          />
                        ))
                    ) : (
                      <Typography sx={{ color: c.subtext, fontSize: 14 }}>
                        No applications yet.
                      </Typography>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Box>
        );
      }}
    </CandidateLayout>
  );
}
