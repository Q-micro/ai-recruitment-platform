/* The above code is a React component named `EmployerDashboard` that represents a dashboard for an
employer. It fetches data related to the employer's job postings, applications, hiring statistics,
and recent activities. The dashboard includes various components such as `StatCard`, `PanelCard`,
`ProgressRow`, `ActivityItem`, `SummaryBlock`, `BarMini`, etc., each displaying different
information like job statistics, application trends, hiring overview, pipeline status, recent
applications, and top jobs by application count. */

import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Stack,
  Typography,
  LinearProgress,
  Avatar,
  Divider,
  Chip,
  Skeleton,
  Alert,
  Button,
  Paper,
} from "@mui/material";
import WorkOutlineRoundedIcon from "@mui/icons-material/WorkOutlineRounded";
import Groups2RoundedIcon from "@mui/icons-material/Groups2Rounded";
import AssignmentTurnedInRoundedIcon from "@mui/icons-material/AssignmentTurnedInRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import RemoveCircleRoundedIcon from "@mui/icons-material/RemoveCircleRounded";
import HourglassTopRoundedIcon from "@mui/icons-material/HourglassTopRounded";
import InterviewRoundedIcon from "@mui/icons-material/SchoolRounded";
import { apiFetch } from "../../api/http";

const palette = {
  cream: "#FCECDD",
  peach: "#FFC288",
  orange: "#FEA82F",
  hot: "#FF6701",
  text: "#4A2F1B",
  muted: "#7B5B45",
  border: "rgba(255, 167, 47, 0.16)",
  shadow: "0 10px 28px rgba(255, 162, 47, 0.10)",
  bg: "linear-gradient(180deg, #FFF8F0 0%, #FFFDF9 100%)",
};

const statusMeta = {
  submitted: {
    label: "Submitted",
    color: "#D97706",
    icon: <HourglassTopRoundedIcon fontSize="small" />,
  },
  under_review: {
    label: "Under review",
    color: "#EA580C",
    icon: <VisibilityRoundedIcon fontSize="small" />,
  },
  shortlisted: {
    label: "Shortlisted",
    color: "#C2410C",
    icon: <CheckCircleRoundedIcon fontSize="small" />,
  },
  interview: {
    label: "Interview",
    color: "#B45309",
    icon: <InterviewRoundedIcon fontSize="small" />,
  },
  offered: {
    label: "Offered",
    color: "#F59E0B",
    icon: <OpenInNewRoundedIcon fontSize="small" />,
  },
  hired: {
    label: "Hired",
    color: "#16A34A",
    icon: <CheckCircleRoundedIcon fontSize="small" />,
  },
  rejected: {
    label: "Rejected",
    color: "#DC2626",
    icon: <RemoveCircleRoundedIcon fontSize="small" />,
  },
  withdrawn: {
    label: "Withdrawn",
    color: "#6B7280",
    icon: <RemoveCircleRoundedIcon fontSize="small" />,
  },
};

const emptyStats = {
  jobs: 0,
  activeJobs: 0,
  applications: 0,
  shortlisted: 0,
  interview: 0,
  hired: 0,
  views: 0,
  offers: 0,
};

function StatCard({ title, value, change, icon, loading }) {
  return (
    <Card
      sx={{
        borderRadius: 4,
        background: `linear-gradient(180deg, ${palette.cream} 0%, #FFF7EE 100%)`,
        color: palette.text,
        boxShadow: palette.shadow,
        border: `1px solid ${palette.border}`,
        height: "100%",
      }}
    >
      <CardContent
        sx={{
          p: { xs: 2.2, md: 2.4 },
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <Box>
            <Typography
              variant="body2"
              sx={{ color: palette.muted, mb: 1, fontWeight: 600 }}
            >
              {title}
            </Typography>

            {loading ? (
              <Skeleton width={70} height={40} />
            ) : (
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography
                  variant="h5"
                  fontWeight="bold"
                  sx={{
                    color: palette.text,
                    fontSize: { xs: "2rem", md: "1.5rem" },
                    lineHeight: 1,
                  }}
                >
                  {value}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: palette.hot,
                    backgroundColor: "rgba(255, 103, 1, 0.10)",
                    px: 1,
                    py: 0.4,
                    borderRadius: 1.5,
                    fontWeight: 700,
                  }}
                >
                  {change}
                </Typography>
              </Stack>
            )}
          </Box>

          <Avatar
            sx={{
              width: { xs: 50, md: 44 },
              height: { xs: 50, md: 44 },
              background: `linear-gradient(135deg, ${palette.peach} 0%, ${palette.orange} 100%)`,
              color: "#fff",
              boxShadow: "0 8px 18px rgba(255, 163, 47, 0.18)",
            }}
          >
            {icon}
          </Avatar>
        </Stack>
      </CardContent>
    </Card>
  );
}

function PanelCard({ title, subtitle, children, action, height }) {
  return (
    <Card
      sx={{
        borderRadius: 4,
        background: "rgba(255,255,255,0.76)",
        backdropFilter: "blur(10px)",
        color: palette.text,
        boxShadow: "0 8px 26px rgba(112, 74, 31, 0.08)",
        border: `1px solid rgba(255, 167, 47, 0.10)`,
        height: height || "100%",
      }}
    >
      <CardContent sx={{ height: "100%", p: 2.8 }}>
        <Stack
          direction="row"
          alignItems="flex-start"
          justifyContent="space-between"
          spacing={2}
        >
          <Box>
            <Typography
              variant="body2"
              sx={{ color: palette.muted, fontWeight: 700, letterSpacing: 0.2 }}
            >
              {title}
            </Typography>
            <Typography
              variant="h5"
              fontWeight="bold"
              sx={{
                mt: 1,
                mb: 0.5,
                color: palette.text,
                fontSize: { xs: "1.25rem", md: "1.5rem" },
              }}
            >
              {subtitle}
            </Typography>
          </Box>
          {action}
        </Stack>

        <Box sx={{ mt: 2 }}>{children}</Box>
      </CardContent>
    </Card>
  );
}

function ProgressRow({ label, value }) {
  return (
    <Box sx={{ mb: 2 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 0.6 }}
      >
        <Typography
          sx={{ color: palette.muted, fontWeight: 600, fontSize: 14 }}
        >
          {label}
        </Typography>
        <Typography sx={{ color: palette.hot, fontWeight: 700, fontSize: 13 }}>
          {value}%
        </Typography>
      </Stack>

      <LinearProgress
        variant="determinate"
        value={value}
        sx={{
          height: 8,
          borderRadius: 999,
          backgroundColor: "rgba(255, 194, 136, 0.26)",
          "& .MuiLinearProgress-bar": {
            borderRadius: 999,
            background: `linear-gradient(90deg, ${palette.peach} 0%, ${palette.orange} 60%, ${palette.hot} 100%)`,
          },
        }}
      />
    </Box>
  );
}

function ActivityItem({ title, subtitle, time, status }) {
  const meta = statusMeta[status] || statusMeta.submitted;

  return (
    <Box sx={{ py: 1.25 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "flex-start" }}
        spacing={1}
      >
        <Box sx={{ minWidth: 0 }}>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ mb: 0.4 }}
          >
            {meta.icon}
            <Typography
              sx={{ color: palette.text, fontWeight: 700, fontSize: 14.5 }}
            >
              {title}
            </Typography>
          </Stack>
          <Typography sx={{ color: palette.muted, fontSize: 13, mt: 0.5 }}>
            {subtitle}
          </Typography>
        </Box>

        <Typography
          sx={{ color: "#9A7250", fontSize: 12.5, whiteSpace: "nowrap" }}
        >
          {time}
        </Typography>
      </Stack>
    </Box>
  );
}

function SummaryBlock({ label, value }) {
  return (
    <Box
      sx={{
        px: 1.5,
        py: 1.3,
        borderRadius: 3,
        background: "rgba(252, 236, 221, 0.75)",
        border: `1px solid ${palette.border}`,
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography sx={{ color: palette.muted, fontWeight: 600 }}>
          {label}
        </Typography>
        <Typography sx={{ color: palette.text, fontWeight: 800, fontSize: 18 }}>
          {value}
        </Typography>
      </Stack>
    </Box>
  );
}

function BarMini({ value }) {
  return (
    <Box
      sx={{
        flex: 1,
        height: 10,
        borderRadius: 999,
        background: "rgba(255, 194, 136, 0.25)",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          width: `${Math.min(100, value)}%`,
          height: "100%",
          borderRadius: 999,
          background: `linear-gradient(90deg, ${palette.peach} 0%, ${palette.orange} 60%, ${palette.hot} 100%)`,
        }}
      />
    </Box>
  );
}

function timeAgo(dateValue) {
  if (!dateValue) return "";
  const date = new Date(dateValue);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString();
}

export default function EmployerDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState({
    stats: emptyStats,
    statusData: [],
    monthly: [],
    recentApplications: [],
    topJobs: [],
  });

  useEffect(() => {
    fetchDashboard();
  }, []);

  async function fetchDashboard() {
    try {
      setLoading(true);
      setError("");

      const user = JSON.parse(localStorage.getItem("user"));
      const employerId = user?.id || user?.user_id;

      const query = employerId ? `?employerId=${employerId}` : "";
      const result = await apiFetch(`/api/employer/dashboard${query}`);

      setData({
        stats: result.stats || emptyStats,
        statusData: result.statusData || [],
        monthly: result.monthly || [],
        recentApplications: result.recentApplications || [],
        topJobs: result.topJobs || [],
      });
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load employer dashboard");
    } finally {
      setLoading(false);
    }
  }

  const stats = data.stats || emptyStats;
  const statusData = data.statusData || [];
  const monthly = data.monthly || [];
  const recentApplications = data.recentApplications || [];
  const topJobs = data.topJobs || [];

  const interviewRate = stats.applications
    ? Math.round((stats.interview / stats.applications) * 100)
    : 0;

  const hireRate = stats.applications
    ? Math.round((stats.hired / stats.applications) * 100)
    : 0;

  const maxMonthlyApplications = useMemo(() => {
    return Math.max(
      1,
      ...monthly.map((item) => Number(item.applications || 0)),
    );
  }, [monthly]);

  return (
    <Box
      sx={{
        pb: { xs: 11, md: 3 },
        background: palette.bg,
        minHeight: "100%",
        width: "100%",
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", md: "center" }}
        sx={{ mb: { xs: 2, md: 3 } }}
        spacing={2}
      >
        <Box></Box>

        <Button
          variant="contained"
          startIcon={<OpenInNewRoundedIcon />}
          onClick={fetchDashboard}
          sx={{
            background: `linear-gradient(135deg, ${palette.peach} 0%, ${palette.orange} 100%)`,
            color: "#fff",
            borderRadius: 999,
            px: 2.2,
            width: { xs: "100%", md: "auto" },
            textTransform: "none",
            fontWeight: 800,
            boxShadow: "0 10px 22px rgba(255, 167, 47, 0.18)",
            "&:hover": {
              background: `linear-gradient(135deg, ${palette.orange} 0%, ${palette.hot} 100%)`,
            },
          }}
        >
          Refresh
        </Button>
      </Stack>

      {error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : null}

      <Grid container spacing={{ xs: 2, md: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="My Jobs"
            value={stats.jobs}
            change={`${stats.activeJobs} active`}
            icon={<WorkOutlineRoundedIcon />}
            loading={loading}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Posts"
            value={stats.activeJobs}
            change={`${stats.views} views`}
            icon={<TrendingUpRoundedIcon />}
            loading={loading}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Applications"
            value={stats.applications}
            change={`${interviewRate}% interview`}
            icon={<Groups2RoundedIcon />}
            loading={loading}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Shortlisted"
            value={stats.shortlisted}
            change={`${hireRate}% hired`}
            icon={<AssignmentTurnedInRoundedIcon />}
            loading={loading}
          />
        </Grid>

        <Grid item xs={12} md={8}>
          <PanelCard
            title="Hiring overview"
            subtitle="Application trend"
            height={{ xs: "auto", md: "420px" }}
            action={
              <Chip
                label={`${stats.offers} offers`}
                sx={{
                  background: "#FFF3E6",
                  color: palette.hot,
                  fontWeight: 800,
                }}
              />
            }
          >
            {loading ? (
              <Skeleton
                variant="rounded"
                height={290}
                sx={{ borderRadius: 4 }}
              />
            ) : (
              <Box
                sx={{
                  mt: 1,
                  height: { xs: 180, md: 290 },
                  display: "flex",
                  alignItems: "flex-end",
                  gap: { xs: 1, md: 2 },
                  overflowX: { xs: "auto", md: "visible" },
                  pb: { xs: 0.5, md: 0 },
                }}
              >
                {monthly.map((item) => {
                  const applications = Number(item.applications || 0);
                  const height = Math.max(
                    20,
                    (applications / maxMonthlyApplications) * 220,
                  );

                  return (
                    <Box
                      key={item.month}
                      sx={{
                        flex: 1,
                        minWidth: { xs: 46, md: "auto" },
                        textAlign: "center",
                      }}
                    >
                      <Typography
                        sx={{ color: palette.muted, fontSize: 13, mb: 1 }}
                      >
                        {item.month}
                      </Typography>
                      <Box
                        sx={{
                          height: { xs: 140, md: 220 },
                          display: "flex",
                          alignItems: "flex-end",
                          justifyContent: "center",
                          background:
                            "linear-gradient(180deg, rgba(255, 194, 136, 0.08) 0%, rgba(255,255,255,0) 100%)",
                          borderRadius: 3,
                          p: 1.2,
                          border: "1px solid rgba(255,167,47,0.08)",
                        }}
                      >
                        <Box
                          sx={{
                            width: "100%",
                            maxWidth: { xs: 28, md: 36 },
                            height: `${height}px`,
                            borderRadius: 999,
                            background: `linear-gradient(180deg, ${palette.peach} 0%, ${palette.orange} 55%, ${palette.hot} 100%)`,
                            boxShadow: "0 10px 18px rgba(255, 103, 1, 0.15)",
                          }}
                        />
                      </Box>
                      <Typography
                        sx={{ mt: 1, color: palette.text, fontWeight: 800 }}
                      >
                        {applications}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            )}

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.2}
              sx={{ mt: 2 }}
            >
              <Box sx={{ flex: 1 }}>
                <SummaryBlock label="Applications" value={stats.applications} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <SummaryBlock label="Interviewing" value={stats.interview} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <SummaryBlock label="Hired" value={stats.hired} />
              </Box>
            </Stack>
          </PanelCard>
        </Grid>

        <Grid item xs={12} md={4}>
          <Stack spacing={3} sx={{ height: "100%" }}>
            <PanelCard
              title="Pipeline"
              subtitle="By stage"
              height={{ xs: "auto", md: "198px" }}
            >
              <Box sx={{ mt: 1.2 }}>
                <ProgressRow
                  label="Interview stage"
                  value={Math.min(100, interviewRate * 4 + 8)}
                />
                <ProgressRow
                  label="Shortlisted"
                  value={Math.min(100, stats.shortlisted * 7 + 10)}
                />
                <ProgressRow
                  label="Offers sent"
                  value={Math.min(100, stats.offers * 10 + 6)}
                />
              </Box>
            </PanelCard>

            <PanelCard
              title="Status share"
              subtitle="All applications"
              height={{ xs: "auto", md: "198px" }}
            >
              <Stack spacing={1.1} sx={{ mt: 0.5 }}>
                {statusData.length > 0 ? (
                  statusData.map((item) => (
                    <Stack
                      key={item.key}
                      direction="row"
                      spacing={1.2}
                      alignItems="center"
                    >
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          background: item.color,
                          flexShrink: 0,
                        }}
                      />
                      <Typography
                        sx={{
                          minWidth: 110,
                          color: palette.muted,
                          fontSize: 13,
                        }}
                      >
                        {item.label}
                      </Typography>
                      <BarMini
                        value={
                          stats.applications
                            ? (item.value / stats.applications) * 100
                            : 0
                        }
                      />
                      <Typography
                        sx={{
                          minWidth: 28,
                          textAlign: "right",
                          color: palette.text,
                          fontWeight: 800,
                        }}
                      >
                        {item.value}
                      </Typography>
                    </Stack>
                  ))
                ) : (
                  <Typography sx={{ color: palette.muted, fontSize: 13 }}>
                    No application status data yet.
                  </Typography>
                )}
              </Stack>
            </PanelCard>
          </Stack>
        </Grid>

        <Grid item xs={12} md={7}>
          <PanelCard title="Recent applications" subtitle="Latest activity">
            <Stack spacing={0.5}>
              {recentApplications.length > 0 ? (
                recentApplications.map((app, idx) => (
                  <React.Fragment key={app.id}>
                    <ActivityItem
                      title={`${app.candidateName || `Candidate #${app.candidate_id}`} applied`}
                      subtitle={`${app.job || "Job"} · ${app.note || "New application"}`}
                      time={timeAgo(app.applied_at)}
                      status={app.status}
                    />
                    {idx !== recentApplications.length - 1 ? (
                      <Divider
                        sx={{ borderColor: "rgba(255, 167, 47, 0.12)" }}
                      />
                    ) : null}
                  </React.Fragment>
                ))
              ) : (
                <Typography sx={{ color: palette.muted, fontSize: 13 }}>
                  No recent applications yet.
                </Typography>
              )}
            </Stack>
          </PanelCard>
        </Grid>

        <Grid item xs={12} md={5}>
          <PanelCard title="Top jobs" subtitle="By application count">
            <Stack spacing={1.2}>
              {topJobs.length > 0 ? (
                topJobs.map((job) => (
                  <Paper
                    key={job.id || job.name}
                    elevation={0}
                    sx={{
                      p: 1.4,
                      borderRadius: { xs: 4, md: 3 },
                      background: "rgba(252,236,221,0.65)",
                      border: `1px solid ${palette.border}`,
                    }}
                  >
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      spacing={2}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          sx={{
                            fontWeight: 800,
                            color: palette.text,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {job.name}
                        </Typography>
                        <Typography sx={{ color: palette.muted, fontSize: 13 }}>
                          {job.applications} applications · {job.views} views
                        </Typography>
                      </Box>

                      <VisibilityRoundedIcon sx={{ color: palette.hot }} />
                    </Stack>
                  </Paper>
                ))
              ) : (
                <Typography sx={{ color: palette.muted, fontSize: 13 }}>
                  No jobs with applications yet.
                </Typography>
              )}
            </Stack>
          </PanelCard>
        </Grid>
      </Grid>
    </Box>
  );
}
