/**
 * The `CandidateApplications` function in this code snippet displays job applications and recruitment
 * service updates for a candidate, allowing them to track their application progress.
 * @returns The `CandidateApplications` component is being returned. This component fetches data for
 * job applications and recruitment service updates, displays statistics, and renders different types
 * of cards based on the active tab (applications or recruitment). It also handles loading states,
 * errors, and displays appropriate messages when there are no applications or updates available.
 */

// This file contains the CandidateApplications component which displays a candidate's job applications
// and recruitment service updates. It uses Material-UI components for styling and layout, and fetches
// data from the backend API to populate the application and recruitment update lists.
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import WorkOutlineRoundedIcon from "@mui/icons-material/WorkOutlineRounded";
import BusinessCenterRoundedIcon from "@mui/icons-material/BusinessCenterRounded";
import TrackChangesRoundedIcon from "@mui/icons-material/TrackChangesRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import CandidateLayout from "../../components/CandidateLayout";
import { getApplications } from "../../api/candidate";

const API_BASE_URL = "http://localhost:3001";

function normalizeStatus(status) {
  return String(status || "applied")
    .toLowerCase()
    .trim();
}

function formatStatus(status) {
  return String(status || "applied")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function statusStyle(status, colors, mode) {
  const value = normalizeStatus(status);

  if (["hired", "offered", "offer"].includes(value)) {
    return {
      color: "#22c55e",
      bg: mode === "dark" ? "rgba(34,197,94,0.14)" : "rgba(34,197,94,0.10)",
      border: "rgba(34,197,94,0.26)",
    };
  }

  if (
    [
      "interviewing",
      "interview",
      "interviewed",
      "interview scheduled",
    ].includes(value)
  ) {
    return {
      color: "#f59e0b",
      bg: mode === "dark" ? "rgba(245,158,11,0.15)" : "rgba(245,158,11,0.10)",
      border: "rgba(245,158,11,0.28)",
    };
  }

  if (["rejected"].includes(value)) {
    return {
      color: "#ef4444",
      bg: mode === "dark" ? "rgba(239,68,68,0.14)" : "rgba(239,68,68,0.10)",
      border: "rgba(239,68,68,0.28)",
    };
  }

  if (["waitlist", "on hold"].includes(value)) {
    return {
      color: "#a855f7",
      bg: mode === "dark" ? "rgba(168,85,247,0.14)" : "rgba(168,85,247,0.10)",
      border: "rgba(168,85,247,0.28)",
    };
  }

  if (["cv sent", "ats cv generated", "contacted"].includes(value)) {
    return {
      color: colors.accent,
      bg: mode === "dark" ? "rgba(255,154,61,0.14)" : "rgba(248,81,36,0.10)",
      border: colors.cardBorder,
    };
  }

  return {
    color: colors.accent,
    bg: mode === "dark" ? "rgba(255,154,61,0.12)" : "rgba(248,81,36,0.08)",
    border: colors.cardBorder,
  };
}

function getTrackerSteps(status) {
  const value = normalizeStatus(status);

  if (value === "rejected") return ["applied", "rejected"];
  if (value === "waitlist") return ["applied", "interviewing", "waitlist"];

  return ["applied", "interviewing", "hired"];
}

function getActiveIndex(status, steps) {
  const value = normalizeStatus(status);

  if (value === "submitted") return steps.indexOf("applied");
  if (value === "interview") return steps.indexOf("interviewing");
  if (value === "offered") return steps.indexOf("hired");

  const index = steps.indexOf(value);
  return index >= 0 ? index : 0;
}

function ApplicationTracker({ status, colors, mode }) {
  const steps = getTrackerSteps(status);
  const activeIndex = getActiveIndex(status, steps);

  return (
    <Stack spacing={1.1} sx={{ mt: 1.5 }}>
      <Stack direction="row" alignItems="center" spacing={1}>
        {steps.map((step, index) => {
          const isActive = activeIndex >= 0 && index <= activeIndex;

          return (
            <Box
              key={step}
              sx={{ display: "flex", alignItems: "center", flex: 1 }}
            >
              <Box
                sx={{
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  backgroundColor: isActive
                    ? colors.accent
                    : colors.inputBorder,
                  border: isActive
                    ? `1px solid ${colors.accentHover || colors.accent}`
                    : `1px solid ${colors.cardBorder}`,
                  flexShrink: 0,
                }}
              />

              {index < steps.length - 1 && (
                <Box
                  sx={{
                    flex: 1,
                    height: 3,
                    mx: 0.5,
                    borderRadius: 999,
                    backgroundColor:
                      isActive && index < activeIndex
                        ? colors.accent
                        : mode === "dark"
                          ? "rgba(255,255,255,0.10)"
                          : "rgba(0,0,0,0.08)",
                  }}
                />
              )}
            </Box>
          );
        })}
      </Stack>

      <Stack direction="row" justifyContent="space-between">
        {steps.map((step) => (
          <Typography
            key={step}
            sx={{
              color: colors.subtext,
              fontSize: 11.5,
              fontWeight: 800,
              textTransform: "capitalize",
            }}
          >
            {formatStatus(step)}
          </Typography>
        ))}
      </Stack>
    </Stack>
  );
}

function RecruitmentTracker({ status, colors, mode }) {
  const order = [
    "Applied",
    "Contacted",
    "ATS CV Generated",
    "CV Sent",
    "Interview Scheduled",
    "Interviewed",
    "Offer",
    "Hired",
  ];

  const normalized = String(status || "Applied").trim();
  const currentIndex = Math.max(
    0,
    order.findIndex((item) => item.toLowerCase() === normalized.toLowerCase()),
  );

  const progress = Math.min(
    100,
    Math.round(((currentIndex + 1) / order.length) * 100),
  );

  const style = statusStyle(status, colors, mode);

  return (
    <Stack spacing={1.1} sx={{ mt: 1.4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography
          sx={{ color: colors.subtext, fontSize: 12.5, fontWeight: 800 }}
        >
          Recruitment progress
        </Typography>
        <Typography
          sx={{ color: style.color, fontSize: 12.5, fontWeight: 900 }}
        >
          {progress}%
        </Typography>
      </Stack>

      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          height: 8,
          borderRadius: 999,
          backgroundColor:
            mode === "dark" ? "rgba(255,255,255,0.10)" : "rgba(248,81,36,0.10)",
          "& .MuiLinearProgress-bar": {
            borderRadius: 999,
            background: style.color,
          },
        }}
      />
    </Stack>
  );
}

function StatPill({ label, value, icon, colors, mode }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 1.1, sm: 1.4 },
        borderRadius: 2.6,
        background:
          mode === "dark" ? "rgba(16,23,38,0.84)" : "rgba(255,255,255,0.82)",
        border: `1px solid ${colors.cardBorder}`,
      }}
    >
      <Stack direction="row" spacing={1.1} alignItems="center">
        <Box
          sx={{
            width: 30,
            height: 30,
            borderRadius: 2.2,
            display: "grid",
            placeItems: "center",
            color: "#fff",
            background: colors.buttonBg,
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              color: colors.text,
              fontSize: 18,
              fontWeight: 900,
              lineHeight: 1,
            }}
          >
            {value}
          </Typography>
          <Typography
            sx={{ color: colors.subtext, fontSize: 10.8, fontWeight: 800 }}
          >
            {label}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
}

function JobApplicationCard({ app, colors, mode }) {
  const style = statusStyle(app.status, colors, mode);

  return (
    <Card
      sx={{
        borderRadius: 2.6,
        backgroundColor:
          mode === "dark" ? "rgba(16,23,38,0.88)" : "rgba(255,255,255,0.86)",
        color: colors.text,
        border: `1px solid ${colors.cardBorder}`,
        boxShadow: colors.cardShadow,
      }}
    >
      <CardContent sx={{ p: { xs: 1.45, sm: 2 } }}>
        <Stack spacing={1.4}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
            spacing={1.5}
          >
            <Stack direction="row" spacing={1.2} sx={{ minWidth: 0 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2.5,
                  display: "grid",
                  placeItems: "center",
                  color: "#fff",
                  background: colors.buttonBg,
                  flexShrink: 0,
                }}
              >
                <WorkOutlineRoundedIcon />
              </Box>

              <Box sx={{ minWidth: 0 }}>
                <Typography
                  sx={{
                    color: colors.text,
                    fontWeight: 900,
                    fontSize: 15.5,
                    lineHeight: 1.15,
                  }}
                >
                  {app.title || "Job Application"}
                </Typography>

                <Typography
                  sx={{ color: colors.subtext, fontSize: 12.5, mt: 0.25 }}
                >
                  {app.position || "Position not set"}
                </Typography>
              </Box>
            </Stack>

            <Chip
              label={formatStatus(app.status)}
              size="small"
              sx={{
                color: style.color,
                backgroundColor: style.bg,
                border: `1px solid ${style.border}`,
                fontWeight: 900,
                flexShrink: 0,
              }}
            />
          </Stack>

          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            <Chip
              size="small"
              label={app.location || "Location not set"}
              sx={{
                color: colors.subtext,
                backgroundColor:
                  mode === "dark"
                    ? "rgba(255,255,255,0.045)"
                    : "rgba(0,0,0,0.035)",
                border: `1px solid ${colors.cardBorder}`,
                fontWeight: 700,
              }}
            />
            <Chip
              size="small"
              label={app.job_type || "Not specified"}
              sx={{
                color: colors.subtext,
                backgroundColor:
                  mode === "dark"
                    ? "rgba(255,255,255,0.045)"
                    : "rgba(0,0,0,0.035)",
                border: `1px solid ${colors.cardBorder}`,
                fontWeight: 700,
              }}
            />
            <Chip
              size="small"
              icon={<PaymentsRoundedIcon sx={{ fontSize: 15 }} />}
              label={app.salary || "Salary not specified"}
              sx={{
                color: colors.subtext,
                backgroundColor:
                  mode === "dark"
                    ? "rgba(255,255,255,0.045)"
                    : "rgba(0,0,0,0.035)",
                border: `1px solid ${colors.cardBorder}`,
                fontWeight: 700,
                "& .MuiChip-icon": { color: colors.subtext },
              }}
            />
          </Stack>

          <Typography sx={{ color: colors.subtext, fontSize: 12.5 }}>
            Applied on:{" "}
            {app.applied_at
              ? new Date(app.applied_at).toLocaleDateString()
              : "Not available"}
          </Typography>

          <ApplicationTracker status={app.status} colors={colors} mode={mode} />
        </Stack>
      </CardContent>
    </Card>
  );
}

function RecruitmentUpdateCard({ item, colors, mode }) {
  const style = statusStyle(item.status, colors, mode);

  return (
    <Card
      sx={{
        borderRadius: 2.6,
        backgroundColor:
          mode === "dark" ? "rgba(16,23,38,0.88)" : "rgba(255,255,255,0.86)",
        color: colors.text,
        border: `1px solid ${colors.cardBorder}`,
        boxShadow: colors.cardShadow,
      }}
    >
      <CardContent sx={{ p: { xs: 1.45, sm: 2 } }}>
        <Stack spacing={1.4}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
            spacing={1.5}
          >
            <Stack direction="row" spacing={1.2} sx={{ minWidth: 0 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2.5,
                  display: "grid",
                  placeItems: "center",
                  color: "#fff",
                  background: colors.buttonBg,
                  flexShrink: 0,
                }}
              >
                <AutoAwesomeRoundedIcon />
              </Box>

              <Box sx={{ minWidth: 0 }}>
                <Typography
                  sx={{
                    color: colors.text,
                    fontWeight: 900,
                    fontSize: 15.5,
                    lineHeight: 1.15,
                  }}
                >
                  {item.client_name || "Recruitment Service"}
                </Typography>

                <Typography
                  sx={{ color: colors.subtext, fontSize: 12.5, mt: 0.25 }}
                >
                  Managed by Khutwa recruitment team
                </Typography>
              </Box>
            </Stack>

            <Chip
              label={item.status || "Applied"}
              size="small"
              sx={{
                color: style.color,
                backgroundColor: style.bg,
                border: `1px solid ${style.border}`,
                fontWeight: 900,
                flexShrink: 0,
              }}
            />
          </Stack>

          {item.notes && (
            <Typography
              sx={{
                color: colors.subtext,
                fontSize: 13,
                lineHeight: 1.55,
                p: 1.3,
                borderRadius: 2.5,
                background:
                  mode === "dark"
                    ? "rgba(255,255,255,0.045)"
                    : "rgba(0,0,0,0.035)",
                border: `1px solid ${colors.cardBorder}`,
              }}
            >
              {item.notes}
            </Typography>
          )}

          <Typography sx={{ color: colors.subtext, fontSize: 12.5 }}>
            Updated:{" "}
            {item.updated_at
              ? new Date(item.updated_at).toLocaleString()
              : "Not available"}
          </Typography>

          <RecruitmentTracker
            status={item.status}
            colors={colors}
            mode={mode}
          />
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function CandidateApplications() {
  const [applications, setApplications] = useState([]);
  const [recruitmentUpdates, setRecruitmentUpdates] = useState([]);
  const [activeTab, setActiveTab] = useState("applications");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));
  const candidateId = user?.candidate_id;

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchRecruitmentUpdates() {
    const token = localStorage.getItem("token");

    const res = await fetch(
      `${API_BASE_URL}/api/candidate/recruitment-tracks`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.error || "Failed to load recruitment updates");
    }

    return Array.isArray(data.tracks) ? data.tracks : [];
  }

  async function fetchData() {
    try {
      setErr("");

      if (!candidateId) return;

      setLoading(true);

      const [applicationsData, recruitmentData] = await Promise.all([
        getApplications(candidateId),
        fetchRecruitmentUpdates(),
      ]);

      setApplications(Array.isArray(applicationsData) ? applicationsData : []);
      setRecruitmentUpdates(
        Array.isArray(recruitmentData) ? recruitmentData : [],
      );
    } catch (error) {
      console.error(error);
      setErr(error.message || "Failed to load applications");
    } finally {
      setLoading(false);
    }
  }

  const activeList =
    activeTab === "applications" ? applications : recruitmentUpdates;

  const stats = useMemo(() => {
    const activeApps = applications.filter(
      (item) => !["rejected"].includes(normalizeStatus(item.status)),
    ).length;

    const activeRecruitment = recruitmentUpdates.filter(
      (item) => !["rejected", "hired"].includes(normalizeStatus(item.status)),
    ).length;

    return {
      applications: applications.length,
      recruitment: recruitmentUpdates.length,
      active: activeApps + activeRecruitment,
    };
  }, [applications, recruitmentUpdates]);

  return (
    <CandidateLayout>
      {(colors, mode) => (
        <Box sx={{ pb: { xs: 1, md: 0 } }}>
          <Stack spacing={2}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 1.45, sm: 2.2 },
                borderRadius: 2.6,
                background:
                  mode === "dark"
                    ? "rgba(16, 23, 38, 0.82)"
                    : "rgba(255,255,255,0.82)",
                border: `1px solid ${colors.cardBorder}`,
                boxShadow: colors.cardShadow,
              }}
            >
              <Stack spacing={1.8}>
                <Box>
                  <Typography
                    sx={{
                      color: colors.text,
                      fontWeight: 900,
                      fontSize: { xs: "1.65rem", sm: "2rem" },
                      letterSpacing: "-0.04em",
                      lineHeight: 1.05,
                    }}
                  >
                    Applications
                  </Typography>
                  <Typography
                    sx={{ color: colors.subtext, mt: 0.6, fontSize: 13.5 }}
                  >
                    Track job applications and Khutwa recruitment service
                    updates.
                  </Typography>
                </Box>

                <Grid container spacing={1.2}>
                  <Grid item xs={4}>
                    <StatPill
                      label="My Apps"
                      value={stats.applications}
                      icon={<WorkOutlineRoundedIcon sx={{ fontSize: 18 }} />}
                      colors={colors}
                      mode={mode}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <StatPill
                      label="Service"
                      value={stats.recruitment}
                      icon={<BusinessCenterRoundedIcon sx={{ fontSize: 18 }} />}
                      colors={colors}
                      mode={mode}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <StatPill
                      label="Active"
                      value={stats.active}
                      icon={<TrackChangesRoundedIcon sx={{ fontSize: 18 }} />}
                      colors={colors}
                      mode={mode}
                    />
                  </Grid>
                </Grid>
              </Stack>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                p: 0.55,
                borderRadius: 2.6,
                background:
                  mode === "dark"
                    ? "rgba(16,23,38,0.78)"
                    : "rgba(255,255,255,0.78)",
                border: `1px solid ${colors.cardBorder}`,
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 0.55,
              }}
            >
              <Button
                onClick={() => setActiveTab("applications")}
                sx={{
                  borderRadius: 2.4,
                  py: { xs: 0.95, sm: 1.15 },
                  textTransform: "none",
                  fontWeight: 900,
                  fontSize: { xs: 12.5, sm: 14 },
                  color: activeTab === "applications" ? "#fff" : colors.subtext,
                  background:
                    activeTab === "applications"
                      ? colors.buttonBg
                      : "transparent",
                  "&:hover": {
                    background:
                      activeTab === "applications"
                        ? colors.buttonHoverBg
                        : colors.hoverBg,
                  },
                }}
              >
                My Applications
              </Button>

              <Button
                onClick={() => setActiveTab("recruitment")}
                sx={{
                  borderRadius: 2.4,
                  py: { xs: 0.95, sm: 1.15 },
                  textTransform: "none",
                  fontWeight: 900,
                  fontSize: { xs: 12.5, sm: 14 },
                  color: activeTab === "recruitment" ? "#fff" : colors.subtext,
                  background:
                    activeTab === "recruitment"
                      ? colors.buttonBg
                      : "transparent",
                  "&:hover": {
                    background:
                      activeTab === "recruitment"
                        ? colors.buttonHoverBg
                        : colors.hoverBg,
                  },
                }}
              >
                Service Updates
              </Button>
            </Paper>

            {!candidateId && (
              <Alert severity="error" sx={{ borderRadius: 3 }}>
                candidate_id is missing from localStorage user object.
              </Alert>
            )}

            {err && (
              <Alert severity="error" sx={{ borderRadius: 3 }}>
                {err}
              </Alert>
            )}

            {loading ? (
              <Typography sx={{ color: colors.subtext }}>Loading...</Typography>
            ) : (
              <Stack spacing={1.4}>
                {activeList.length > 0 ? (
                  activeTab === "applications" ? (
                    applications.map((app) => (
                      <JobApplicationCard
                        key={app.id}
                        app={app}
                        colors={colors}
                        mode={mode}
                      />
                    ))
                  ) : (
                    recruitmentUpdates.map((item) => (
                      <RecruitmentUpdateCard
                        key={item.id}
                        item={item}
                        colors={colors}
                        mode={mode}
                      />
                    ))
                  )
                ) : (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 2.6,
                      background:
                        mode === "dark"
                          ? "rgba(16,23,38,0.82)"
                          : "rgba(255,255,255,0.82)",
                      border: `1px solid ${colors.cardBorder}`,
                    }}
                  >
                    <Typography sx={{ color: colors.text, fontWeight: 900 }}>
                      {activeTab === "applications"
                        ? "No job applications yet."
                        : "No recruitment service updates yet."}
                    </Typography>
                    <Typography
                      sx={{ color: colors.subtext, mt: 0.6, fontSize: 14 }}
                    >
                      {activeTab === "applications"
                        ? "Jobs you apply to will appear here."
                        : "Updates from the recruitment team will appear here when available."}
                    </Typography>
                  </Paper>
                )}
              </Stack>
            )}
          </Stack>
        </Box>
      )}
    </CandidateLayout>
  );
}
