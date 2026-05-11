/**
 * The `EmployerApplications` component in this code handles the display and management of job
 * applications, including filtering, searching, updating status, and showing applicant details.
 * @returns The code snippet provided is a React functional component called `EmployerApplications`.
 * This component is responsible for displaying a list of job applications, allowing the user to filter
 * and search through the applications based on various criteria such as job title, status, candidate
 * name, skills, and smart search terms.
 */
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Collapse,
  Divider,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import ExpandLessRoundedIcon from "@mui/icons-material/ExpandLessRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import WorkRoundedIcon from "@mui/icons-material/WorkRounded";
import LocalOfferRoundedIcon from "@mui/icons-material/LocalOfferRounded";

const API_BASE_URL = "http://localhost:3001";

const STATUS_OPTIONS = ["applied", "interviewing", "rejected", "hired"];

const STATUS_COLORS = {
  applied: {
    bg: "rgba(255,255,255,0.55)",
    color: "#6a4120",
    border: "rgba(122,86,48,0.16)",
  },
  interviewing: {
    bg: "rgba(255,125,41,0.16)",
    color: "#c2410c",
    border: "rgba(255,125,41,0.28)",
  },
  hired: {
    bg: "rgba(76,175,80,0.15)",
    color: "#2f7d32",
    border: "rgba(76,175,80,0.26)",
  },
  rejected: {
    bg: "rgba(244,67,54,0.14)",
    color: "#b91c1c",
    border: "rgba(244,67,54,0.24)",
  },
};

function getMatchStyle(score) {
  if (score >= 75) {
    return {
      label: "Strong match",
      bg: "rgba(34,197,94,0.16)",
      color: "#166534",
      border: "rgba(34,197,94,0.34)",
    };
  }

  if (score >= 50) {
    return {
      label: "Good match",
      bg: "rgba(245,158,11,0.16)",
      color: "#92400e",
      border: "rgba(245,158,11,0.34)",
    };
  }

  return {
    label: "Low match",
    bg: "rgba(148,163,184,0.18)",
    color: "#475569",
    border: "rgba(148,163,184,0.34)",
  };
}

function normalizeSearchText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function splitSearchTerms(query) {
  return normalizeSearchText(query)
    .split(" ")
    .map((x) => x.trim())
    .filter((x) => x.length >= 2);
}

function expandSearchTerm(term) {
  const synonyms = {
    js: ["javascript"],
    javascript: ["js"],
    reactjs: ["react", "react.js"],
    "react.js": ["react", "reactjs"],
    nodejs: ["node", "node.js"],
    "node.js": ["node", "nodejs"],
    frontend: ["front-end", "front end", "ui"],
    backend: ["back-end", "back end", "api"],
    excel: ["microsoft excel", "spreadsheet", "spreadsheets"],
    accounting: ["accounts", "finance", "bookkeeping"],
    cashier: ["pos", "point of sale", "cash handling"],
    pos: ["point of sale", "cashier", "cash handling"],
    phd: ["phd", "doctorate", "doctoral"],
    customer: ["customer service", "client service"],
    sales: ["selling", "business development"],
    hr: ["human resources", "recruitment"],
    admin: ["administration", "administrative"],
  };

  return [term, ...(synonyms[term] || [])];
}

function buildApplicantSearchText(app) {
  return normalizeSearchText(
    [
      app.full_name,
      app.candidate_name,
      app.name,
      app.email,
      app.candidate_email,
      app.profile_email,
      app.phone,
      app.nationality,
      app.current_position,
      app.desired_position,
      app.candidate_status,
      app.skills,
      app.experience,
      app.education,
      app.summary,
      app.preferred_job_titles,
      app.preferred_industries,
      app.preferred_job_types,
      app.preferred_locations,
      app.work_type_preference,
      app.availability,
      app.job_title,
      app.job_position,
      Array.isArray(app.match_reasons) ? app.match_reasons.join(" ") : "",
      Array.isArray(app.match_missing) ? app.match_missing.join(" ") : "",
    ].join(" "),
  );
}

function getSmartSearchResult(app, query) {
  const terms = splitSearchTerms(query);

  if (!terms.length) {
    return {
      passed: true,
      score: 0,
      matchedTerms: [],
    };
  }

  const text = buildApplicantSearchText(app);
  let score = 0;
  const matchedTerms = [];

  terms.forEach((term) => {
    const expandedTerms = expandSearchTerm(term);
    const matched = expandedTerms.some((expanded) =>
      text.includes(normalizeSearchText(expanded)),
    );

    if (matched) {
      matchedTerms.push(term);
      score += 10;
    }
  });

  const directPhrase = normalizeSearchText(query);
  if (directPhrase && text.includes(directPhrase)) {
    score += 25;
  }

  const skillText = normalizeSearchText(app.skills);
  matchedTerms.forEach((term) => {
    const expandedTerms = expandSearchTerm(term);
    if (
      expandedTerms.some((expanded) =>
        skillText.includes(normalizeSearchText(expanded)),
      )
    ) {
      score += 12;
    }
  });

  const experienceText = normalizeSearchText(
    `${app.experience || ""} ${app.summary || ""}`,
  );
  matchedTerms.forEach((term) => {
    const expandedTerms = expandSearchTerm(term);
    if (
      expandedTerms.some((expanded) =>
        experienceText.includes(normalizeSearchText(expanded)),
      )
    ) {
      score += 8;
    }
  });

  const educationText = normalizeSearchText(app.education);
  matchedTerms.forEach((term) => {
    const expandedTerms = expandSearchTerm(term);
    if (
      expandedTerms.some((expanded) =>
        educationText.includes(normalizeSearchText(expanded)),
      )
    ) {
      score += 8;
    }
  });

  return {
    passed: matchedTerms.length > 0,
    score,
    matchedTerms: Array.from(new Set(matchedTerms)),
  };
}

export default function EmployerApplications() {
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [skillSearch, setSkillSearch] = useState("");
  const [smartSearch, setSmartSearch] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setErr("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("You are not logged in");
      }

      const res = await fetch(`${API_BASE_URL}/employer/applications`, {
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch applications");
      }

      const incomingApplications = Array.isArray(data.applications)
        ? data.applications
        : [];

      const jobsMap = new Map();

      incomingApplications.forEach((app) => {
        if (app.job_id && !jobsMap.has(app.job_id)) {
          jobsMap.set(app.job_id, {
            id: app.job_id,
            title: app.job_title || app.title || `Job #${app.job_id}`,
          });
        }
      });

      setApplications(incomingApplications);
      setJobs(Array.from(jobsMap.values()));
    } catch (error) {
      console.error(error);
      setErr(error.message || "Failed to load applications");
      setApplications([]);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id, status) {
    try {
      setUpdatingId(id);

      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE_URL}/applications/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          data.error || data.message || "Failed to update status",
        );
      }

      await loadData();
    } catch (error) {
      console.error(error);
      setErr(error.message || "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  }

  const filteredApps = useMemo(() => {
    return applications
      .map((app) => {
        const smart = getSmartSearchResult(app, smartSearch);

        return {
          ...app,
          smart_search_score: smart.score,
          smart_search_terms: smart.matchedTerms,
          smart_search_passed: smart.passed,
        };
      })
      .filter((app) =>
        selectedJob === "all"
          ? true
          : Number(app.job_id) === Number(selectedJob),
      )
      .filter((app) =>
        statusFilter === "all"
          ? true
          : String(app.status || "").toLowerCase() === statusFilter,
      )
      .filter((app) => {
        if (!search.trim()) return true;

        const q = search.toLowerCase();

        return [
          app.full_name,
          app.candidate_name,
          app.name,
          app.email,
          app.candidate_email,
          app.profile_email,
          app.phone,
          app.current_position,
          app.desired_position,
          app.job_title,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(q));
      })
      .filter((app) => {
        if (!skillSearch.trim()) return true;

        return String(app.skills || "")
          .toLowerCase()
          .includes(skillSearch.toLowerCase());
      })
      .filter((app) => {
        if (!smartSearch.trim()) return true;
        return app.smart_search_passed;
      })
      .sort((a, b) => {
        if (smartSearch.trim()) {
          const smartDiff =
            Number(b.smart_search_score || 0) -
            Number(a.smart_search_score || 0);
          if (smartDiff !== 0) return smartDiff;
        }

        return Number(b.match_score || 0) - Number(a.match_score || 0);
      });
  }, [
    applications,
    selectedJob,
    statusFilter,
    search,
    skillSearch,
    smartSearch,
  ]);

  const averageMatch = useMemo(() => {
    if (!filteredApps.length) return 0;
    const total = filteredApps.reduce(
      (sum, app) => sum + Number(app.match_score || 0),
      0,
    );
    return Math.round(total / filteredApps.length);
  }, [filteredApps]);

  return (
    <Box sx={{ px: { xs: 0, sm: 1 }, pb: 3 }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          borderRadius: 4,
          background: "rgba(255,255,255,0.88)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(122, 86, 48, 0.10)",
          boxShadow: "0 14px 36px rgba(122, 86, 48, 0.10)",
        }}
      >
        <Stack spacing={2.5}>
          <Stack
            direction={{ xs: "column", lg: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", lg: "center" }}
            spacing={2}
          >
            <Box>
              <Typography
                variant="h4"
                sx={{
                  color: "#4a2b12",
                  fontWeight: 900,
                  letterSpacing: "-0.03em",
                  fontSize: { xs: "1.8rem", md: "2.25rem" },
                }}
              >
                Applications
              </Typography>

              <Typography sx={{ color: "#7a5630", mt: 0.5 }}>
                Review applicants, compare AI match scores, and manage hiring
                status.
              </Typography>
            </Box>

            <Button
              onClick={loadData}
              startIcon={<RefreshRoundedIcon />}
              variant="outlined"
              sx={topActionBtnSx}
            >
              {loading ? "Loading..." : "Refresh"}
            </Button>
          </Stack>

          {err && (
            <Alert severity="error" sx={{ borderRadius: 3 }}>
              {err}
            </Alert>
          )}

          <Paper
            elevation={0}
            sx={{
              p: { xs: 1.5, sm: 2 },
              borderRadius: 4,
              background:
                "linear-gradient(135deg, rgba(255,125,41,0.10) 0%, rgba(244,182,61,0.12) 100%)",
              border: "1px solid rgba(255,125,41,0.16)",
            }}
          >
            <Stack spacing={1}>
              <Typography sx={{ color: "#4a2b12", fontWeight: 900 }}>
                Smart applicant search
              </Typography>
              <Typography sx={{ color: "#7a5630", fontSize: 13 }}>
                Search across skills, experience, education, summary,
                preferences, and match reasons. Try: Excel, POS system, Java,
                accounting, PhD, customer service.
              </Typography>

              <TextField
                fullWidth
                size="small"
                placeholder="Example: Excel accounting POS system"
                value={smartSearch}
                onChange={(e) => setSmartSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: "#8a5b34" }} />
                    </InputAdornment>
                  ),
                }}
                sx={warmFieldSx}
              />
            </Stack>
          </Paper>

          <Grid container spacing={1.5}>
            <Grid item xs={12} sm={6} lg={3}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search candidate..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: "#8a5b34" }} />
                    </InputAdornment>
                  ),
                }}
                sx={warmFieldSx}
              />
            </Grid>

            <Grid item xs={12} sm={6} lg={2.4}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search skills..."
                value={skillSearch}
                onChange={(e) => setSkillSearch(e.target.value)}
                sx={warmFieldSx}
              />
            </Grid>

            <Grid item xs={12} sm={6} lg={3.4}>
              <TextField
                fullWidth
                select
                size="small"
                value={selectedJob}
                onChange={(e) => setSelectedJob(e.target.value)}
                sx={warmFieldSx}
              >
                <MenuItem value="all">All Jobs</MenuItem>
                {jobs.map((job) => (
                  <MenuItem key={job.id} value={job.id}>
                    {job.title}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6} lg={2.2}>
              <TextField
                fullWidth
                select
                size="small"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                sx={warmFieldSx}
              >
                <MenuItem value="all">All Status</MenuItem>
                {STATUS_OPTIONS.map((status) => (
                  <MenuItem key={status} value={status}>
                    {formatStatus(status)}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>

          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            <Chip
              label={`Applications: ${filteredApps.length}`}
              sx={summaryChipSx}
            />
            <Chip
              label={`Average match: ${averageMatch}%`}
              sx={summaryChipSx}
            />
            <Chip
              label={
                smartSearch.trim()
                  ? "Sorted by smart search"
                  : "Sorted by best match"
              }
              sx={summaryChipSx}
            />
          </Stack>

          {loading ? (
            <Typography sx={{ color: "#8a6a3c", py: 4, textAlign: "center" }}>
              Loading applications...
            </Typography>
          ) : filteredApps.length === 0 ? (
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 4,
                textAlign: "center",
                background: "rgba(255,255,255,0.45)",
                border: "1px solid rgba(122,86,48,0.10)",
              }}
            >
              <Typography sx={{ color: "#8a6a3c" }}>
                No applications found.
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={2}>
              {filteredApps.map((app) => {
                const status = String(app.status || "applied").toLowerCase();
                const statusStyle =
                  STATUS_COLORS[status] || STATUS_COLORS.applied;
                const candidateName =
                  app.full_name ||
                  app.candidate_name ||
                  app.name ||
                  "Unnamed candidate";
                const candidateEmail =
                  app.profile_email ||
                  app.candidate_email ||
                  app.email ||
                  "N/A";
                const appliedDate =
                  app.applied_at || app.created_at || app.updated_at;
                const isExpanded = expandedId === app.id;
                const matchScore = Number(app.match_score || 0);
                const matchStyle = getMatchStyle(matchScore);
                const reasons = Array.isArray(app.match_reasons)
                  ? app.match_reasons
                  : [];
                const missing = Array.isArray(app.match_missing)
                  ? app.match_missing
                  : [];

                return (
                  <Grid item xs={12} md={6} xl={4} key={app.id}>
                    <Card
                      sx={{
                        height: "100%",
                        borderRadius: 4,
                        background: "rgba(255,255,255,0.74)",
                        border: "1px solid rgba(122,86,48,0.10)",
                        boxShadow: "0 12px 28px rgba(122,86,48,0.09)",
                        overflow: "hidden",
                      }}
                    >
                      <CardContent sx={{ p: { xs: 2, sm: 2.2 } }}>
                        <Stack spacing={1.6}>
                          <Stack
                            direction="row"
                            spacing={1.4}
                            alignItems="flex-start"
                          >
                            <Box
                              sx={{
                                width: 46,
                                height: 46,
                                borderRadius: "50%",
                                display: "grid",
                                placeItems: "center",
                                background:
                                  "linear-gradient(135deg, #FF7D29 0%, #F4B63D 100%)",
                                color: "#fff",
                                fontWeight: 900,
                                flexShrink: 0,
                              }}
                            >
                              {candidateName
                                .split(" ")
                                .filter(Boolean)
                                .slice(0, 2)
                                .map((x) => x[0]?.toUpperCase())
                                .join("") || "C"}
                            </Box>

                            <Box sx={{ minWidth: 0, flex: 1 }}>
                              <Typography
                                sx={{
                                  color: "#4a2b12",
                                  fontWeight: 900,
                                  lineHeight: 1.15,
                                }}
                              >
                                {candidateName}
                              </Typography>
                              <Typography sx={subTextSx}>
                                {candidateEmail}
                              </Typography>
                              <Typography sx={subTextSx}>
                                {app.phone || "No phone"}
                              </Typography>
                            </Box>
                          </Stack>

                          <Divider
                            sx={{ borderColor: "rgba(122,86,48,0.08)" }}
                          />

                          <Stack
                            direction="row"
                            spacing={1}
                            useFlexGap
                            flexWrap="wrap"
                          >
                            <Chip
                              icon={
                                <LocalOfferRoundedIcon sx={{ fontSize: 16 }} />
                              }
                              label={`${matchScore}% ${matchStyle.label}`}
                              sx={{
                                fontWeight: 900,
                                background: matchStyle.bg,
                                color: matchStyle.color,
                                border: `1px solid ${matchStyle.border}`,
                                "& .MuiChip-icon": { color: matchStyle.color },
                              }}
                            />

                            <Chip
                              label={formatStatus(status)}
                              sx={{
                                fontWeight: 800,
                                background: statusStyle.bg,
                                color: statusStyle.color,
                                border: `1px solid ${statusStyle.border}`,
                              }}
                            />
                          </Stack>

                          <Box>
                            <Typography
                              sx={{ color: "#4a2b12", fontWeight: 800 }}
                            >
                              {app.job_title || app.title || "Job"}
                            </Typography>
                            <Typography sx={subTextSx}>
                              Applied:{" "}
                              {appliedDate
                                ? new Date(appliedDate).toLocaleDateString()
                                : "N/A"}
                            </Typography>
                          </Box>

                          <LinearProgress
                            variant="determinate"
                            value={Math.min(100, Math.max(0, matchScore))}
                            sx={{
                              height: 8,
                              borderRadius: 999,
                              backgroundColor: "rgba(122,86,48,0.10)",
                              "& .MuiLinearProgress-bar": {
                                borderRadius: 999,
                                background:
                                  matchScore >= 75
                                    ? "#22c55e"
                                    : matchScore >= 50
                                      ? "#f59e0b"
                                      : "#94a3b8",
                              },
                            }}
                          />

                          {reasons.length > 0 && (
                            <Typography sx={{ color: "#7a5630", fontSize: 13 }}>
                              ✓ {reasons[0]}
                            </Typography>
                          )}

                          {smartSearch.trim() &&
                            Array.isArray(app.smart_search_terms) &&
                            app.smart_search_terms.length > 0 && (
                              <Stack
                                direction="row"
                                spacing={0.7}
                                useFlexGap
                                flexWrap="wrap"
                              >
                                {app.smart_search_terms
                                  .slice(0, 5)
                                  .map((term) => (
                                    <Chip
                                      key={term}
                                      size="small"
                                      label={`Matched: ${term}`}
                                      sx={{
                                        color: "#6a4120",
                                        background: "rgba(255,255,255,0.55)",
                                        border:
                                          "1px solid rgba(122,86,48,0.12)",
                                        fontWeight: 700,
                                      }}
                                    />
                                  ))}
                              </Stack>
                            )}

                          <Stack
                            direction={{ xs: "column", sm: "row" }}
                            spacing={1}
                          >
                            <FormControl size="small" fullWidth>
                              <InputLabel>Status</InputLabel>
                              <Select
                                value={status}
                                label="Status"
                                disabled={updatingId === app.id}
                                onChange={(e) =>
                                  updateStatus(app.id, e.target.value)
                                }
                                sx={{
                                  borderRadius: 3,
                                  color: statusStyle.color,
                                  fontWeight: 800,
                                  backgroundColor: statusStyle.bg,
                                  "& .MuiOutlinedInput-notchedOutline": {
                                    borderColor: statusStyle.border,
                                  },
                                  "& .MuiSvgIcon-root": {
                                    color: statusStyle.color,
                                  },
                                }}
                              >
                                {STATUS_OPTIONS.map((option) => (
                                  <MenuItem key={option} value={option}>
                                    {formatStatus(option)}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>

                            <Button
                              variant="outlined"
                              onClick={() =>
                                setExpandedId(isExpanded ? null : app.id)
                              }
                              endIcon={
                                isExpanded ? (
                                  <ExpandLessRoundedIcon />
                                ) : (
                                  <ExpandMoreRoundedIcon />
                                )
                              }
                              sx={secondarySmallBtnSx}
                              fullWidth
                            >
                              {isExpanded ? "Hide" : "Details"}
                            </Button>
                          </Stack>

                          <Collapse
                            in={isExpanded}
                            timeout="auto"
                            unmountOnExit
                          >
                            <Stack spacing={2} sx={{ pt: 1 }}>
                              <MatchDetails
                                reasons={reasons}
                                missing={missing}
                              />

                              <Box
                                sx={{
                                  borderTop: "1px solid rgba(122,86,48,0.08)",
                                  borderBottom:
                                    "1px solid rgba(122,86,48,0.08)",
                                }}
                              >
                                <InfoRow
                                  label="Current Position"
                                  value={app.current_position}
                                />
                                <InfoRow
                                  label="Desired Position"
                                  value={app.desired_position}
                                />
                                <InfoRow
                                  label="Expected Salary"
                                  value={app.expected_salary}
                                />
                                <InfoRow
                                  label="Nationality"
                                  value={app.nationality}
                                />
                                <InfoRow
                                  label="Skills"
                                  value={app.skills}
                                  multiline
                                />
                                <InfoRow
                                  label="Experience"
                                  value={app.experience}
                                  multiline
                                />
                                <InfoRow
                                  label="Education"
                                  value={app.education}
                                  multiline
                                />
                                <InfoRow
                                  label="Summary"
                                  value={app.summary}
                                  multiline
                                  noBorder
                                />
                              </Box>

                              <Stack
                                direction={{ xs: "column", sm: "row" }}
                                spacing={1}
                              >
                                <Button
                                  variant="contained"
                                  disabled={!app.cv_url}
                                  startIcon={<DescriptionRoundedIcon />}
                                  onClick={() =>
                                    window.open(
                                      app.cv_url,
                                      "_blank",
                                      "noreferrer",
                                    )
                                  }
                                  sx={primarySmallBtnSx}
                                  fullWidth
                                >
                                  View CV
                                </Button>

                                <Button
                                  variant="outlined"
                                  disabled={!app.linkedin}
                                  startIcon={<OpenInNewRoundedIcon />}
                                  onClick={() =>
                                    window.open(
                                      app.linkedin,
                                      "_blank",
                                      "noreferrer",
                                    )
                                  }
                                  sx={secondarySmallBtnSx}
                                  fullWidth
                                >
                                  LinkedIn
                                </Button>

                                <Button
                                  variant="outlined"
                                  disabled={!app.portfolio}
                                  startIcon={<OpenInNewRoundedIcon />}
                                  onClick={() =>
                                    window.open(
                                      app.portfolio,
                                      "_blank",
                                      "noreferrer",
                                    )
                                  }
                                  sx={secondarySmallBtnSx}
                                  fullWidth
                                >
                                  Portfolio
                                </Button>
                              </Stack>
                            </Stack>
                          </Collapse>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}

function MatchDetails({ reasons, missing }) {
  if (!reasons.length && !missing.length) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 1.5,
          borderRadius: 3,
          background: "rgba(255,255,255,0.45)",
          border: "1px solid rgba(122,86,48,0.10)",
        }}
      >
        <Typography sx={{ color: "#8a6a3c", fontSize: 13 }}>
          No match explanation available yet.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.5,
        borderRadius: 3,
        background: "rgba(255,255,255,0.45)",
        border: "1px solid rgba(122,86,48,0.10)",
      }}
    >
      <Stack spacing={0.8}>
        {reasons.slice(0, 4).map((reason, index) => (
          <Typography
            key={`reason-${index}`}
            sx={{ color: "#4a2b12", fontSize: 13 }}
          >
            ✓ {reason}
          </Typography>
        ))}

        {missing.slice(0, 3).map((item, index) => (
          <Typography
            key={`missing-${index}`}
            sx={{ color: "#8a6a3c", fontSize: 13 }}
          >
            Missing: {item}
          </Typography>
        ))}
      </Stack>
    </Paper>
  );
}

function InfoRow({ label, value, multiline = false, noBorder = false }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        alignItems: { xs: "flex-start", sm: "center" },
        justifyContent: "space-between",
        gap: 1,
        py: 1.4,
        px: 0.5,
        borderBottom: noBorder ? "none" : "1px solid rgba(122,86,48,0.08)",
      }}
    >
      <Typography
        sx={{
          minWidth: { sm: 150 },
          color: "rgba(74,43,18,0.55)",
          fontSize: 12.5,
          fontWeight: 800,
          letterSpacing: "0.03em",
        }}
      >
        {label}
      </Typography>

      <Typography
        sx={{
          flex: 1,
          textAlign: { xs: "left", sm: "right" },
          color: "#4a2b12",
          fontSize: 14,
          fontWeight: 500,
          wordBreak: "break-word",
          whiteSpace: multiline ? "pre-wrap" : "normal",
        }}
      >
        {value || "-"}
      </Typography>
    </Box>
  );
}

function formatStatus(status) {
  return String(status || "")
    .replace("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

const subTextSx = {
  color: "#8a6a3c",
  fontSize: 12.5,
  mt: 0.35,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const warmFieldSx = {
  "& .MuiOutlinedInput-root": {
    color: "#4a2b12",
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.76)",
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "rgba(122,86,48,0.12)",
  },
  "& .MuiInputBase-input::placeholder": {
    color: "#8a6a3c",
    opacity: 1,
  },
  "& .MuiSvgIcon-root": {
    color: "#8a5b34",
  },
};

const summaryChipSx = {
  color: "#6a4120",
  backgroundColor: "rgba(255,255,255,0.48)",
  border: "1px solid rgba(122,86,48,0.10)",
  borderRadius: 999,
  fontWeight: 800,
};

const topActionBtnSx = {
  color: "#6a4120",
  borderColor: "rgba(122,86,48,0.16)",
  borderRadius: 3,
  px: 2,
  minWidth: { xs: "100%", sm: 120 },
  textTransform: "none",
  fontWeight: 800,
  backgroundColor: "rgba(255,255,255,0.24)",
  "&:hover": {
    borderColor: "rgba(122,86,48,0.24)",
    backgroundColor: "rgba(255,255,255,0.40)",
  },
};

const primarySmallBtnSx = {
  textTransform: "none",
  fontWeight: 900,
  borderRadius: 3,
  px: 2,
  background: "linear-gradient(135deg, #FF7D29 0%, #F4B63D 100%)",
  boxShadow: "0 8px 18px rgba(255,125,41,0.18)",
  "&:hover": {
    background: "linear-gradient(135deg, #f97316 0%, #e8a72a 100%)",
  },
};

const secondarySmallBtnSx = {
  color: "#6a4120",
  borderColor: "rgba(122,86,48,0.18)",
  borderRadius: 3,
  textTransform: "none",
  fontWeight: 800,
  backgroundColor: "rgba(255,255,255,0.24)",
  "&:hover": {
    borderColor: "rgba(122,86,48,0.25)",
    backgroundColor: "rgba(255,255,255,0.40)",
  },
};
