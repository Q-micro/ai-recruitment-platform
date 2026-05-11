/**
 * The CandidateJobs component in JavaScript React displays job listings with filtering, sorting, and
 * actions like applying and saving jobs.
 * @returns The `CandidateJobs` component is being returned. It contains the UI elements for filtering
 * and displaying job cards, as well as handling job application and saving functionalities. The
 * component fetches job data, filters the jobs based on user input, and displays the filtered jobs in
 * a grid layout. It also includes a modal for displaying detailed job information and actions like
 * applying to a job or saving it.
 */
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  InputAdornment,
  LinearProgress,
  MenuItem,
  Slider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CandidateLayout from "../../components/CandidateLayout";
import {
  getJobs,
  applyToJob,
  getAppliedJobIds,
  getSavedJobIds,
  saveJob,
  unsaveJob,
} from "../../api/candidate";

import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import SearchIcon from "@mui/icons-material/Search";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import WorkOutlineRoundedIcon from "@mui/icons-material/WorkOutlineRounded";

function getMatchColor(score) {
  if (score >= 75) return "#22c55e";
  if (score >= 50) return "#f59e0b";
  return "#94a3b8";
}

function getMatchBadgeStyle(score, colors) {
  if (score >= 75) {
    return {
      bgcolor: "rgba(34,197,94,0.16)",
      color: colors.text,
      border: "1px solid rgba(34,197,94,0.35)",
    };
  }

  if (score >= 50) {
    return {
      bgcolor: "rgba(245,158,11,0.16)",
      color: colors.text,
      border: "1px solid rgba(245,158,11,0.35)",
    };
  }

  return {
    bgcolor: "rgba(148,163,184,0.16)",
    color: colors.text,
    border: "1px solid rgba(148,163,184,0.28)",
  };
}

function parseSalaryNumber(value) {
  if (!value) return 0;
  const match = String(value).replace(/,/g, "").match(/\d+/);
  return match ? Number(match[0]) : 0;
}

function getSortLabel(sortBy) {
  if (sortBy === "best_match") return "Best match first";
  if (sortBy === "newest") return "Newest first";
  if (sortBy === "salary_high") return "Highest salary";
  if (sortBy === "title_az") return "Title A-Z";
  return "Best match first";
}

function filterFieldSx(colors) {
  return {
    "& .MuiOutlinedInput-root": {
      backgroundColor: colors.inputBg,
      borderRadius: 3,
      color: colors.text,
      "& fieldset": { borderColor: colors.inputBorder },
      "&:hover fieldset": { borderColor: colors.accent },
      "&.Mui-focused fieldset": { borderColor: colors.accent },
    },
    "& .MuiInputLabel-root": { color: colors.subtext },
    "& .MuiInputLabel-root.Mui-focused": { color: colors.accent },
    "& .MuiInputBase-input": { color: colors.text },
    "& .MuiSvgIcon-root": { color: colors.subtext },
  };
}

function actionButtonSx(colors, variant = "outlined", active = false) {
  const isContained = variant === "contained" || active;

  return {
    textTransform: "none",
    borderRadius: 3,
    fontWeight: 800,
    borderColor: colors.accent,
    color: isContained ? "#fff" : colors.accent,
    background: isContained ? colors.buttonBg : "transparent",
    boxShadow: "none",
    "&:hover": {
      borderColor: colors.accentHover,
      background: isContained ? colors.buttonHoverBg : colors.hoverBg,
      boxShadow: "none",
    },
  };
}

function JobDetailsModal({
  open,
  onClose,
  job,
  onApply,
  isApplied,
  isApplying,
  onToggleSave,
  isSaved,
  isSaving,
  colors,
}) {
  if (!job) return null;

  const score = Number(job.match_score || 0);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          backgroundColor: colors.card,
          color: colors.text,
          border: `1px solid ${colors.cardBorder}`,
          borderRadius: 3,
          boxShadow: colors.cardShadow,
          m: { xs: 1.5, sm: 3 },
        },
      }}
    >
      <DialogTitle sx={{ color: colors.text, fontWeight: 900 }}>
        {job.title || "Untitled job"}
      </DialogTitle>

      <DialogContent dividers sx={{ borderColor: colors.cardBorder }}>
        <Stack spacing={2.5}>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            <Chip
              label={job.position || "Position not set"}
              sx={{ bgcolor: colors.chipBg, color: colors.chipText }}
            />
            <Chip
              label={job.location || "Location not set"}
              sx={{ bgcolor: colors.chipBg, color: colors.chipText }}
            />
            <Chip
              label={job.job_type || "Not specified"}
              sx={{ bgcolor: colors.chipBg, color: colors.chipText }}
            />
            <Chip
              label={`Salary: ${job.salary || "Not specified"}`}
              sx={{ bgcolor: colors.chipBg, color: colors.chipText }}
            />
          </Stack>

          <Box
            sx={{
              p: 2,
              borderRadius: 3,
              backgroundColor: colors.inputBg || colors.hoverBg,
              border: `1px solid ${colors.cardBorder}`,
            }}
          >
            <Chip
              label={`${score}% Match`}
              sx={{
                mb: 1.5,
                fontWeight: 900,
                ...getMatchBadgeStyle(score, colors),
              }}
            />

            {Array.isArray(job.match_reasons) &&
              job.match_reasons.length > 0 && (
                <Stack spacing={0.8} sx={{ mb: 1.5 }}>
                  {job.match_reasons.map((reason, index) => (
                    <Typography
                      key={index}
                      variant="body2"
                      sx={{ color: colors.subtext }}
                    >
                      ✓ {reason}
                    </Typography>
                  ))}
                </Stack>
              )}

            {Array.isArray(job.match_missing) &&
              job.match_missing.length > 0 && (
                <Stack spacing={0.8}>
                  {job.match_missing.map((item, index) => (
                    <Typography
                      key={index}
                      variant="body2"
                      sx={{ color: colors.subtext }}
                    >
                      Missing: {item}
                    </Typography>
                  ))}
                </Stack>
              )}
          </Box>

          <Box>
            <Typography
              variant="subtitle1"
              fontWeight="bold"
              gutterBottom
              sx={{ color: colors.text }}
            >
              Job Description
            </Typography>
            <Typography
              variant="body2"
              sx={{ whiteSpace: "pre-line", color: colors.subtext }}
            >
              {job.description || "No description available."}
            </Typography>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          p: 2,
          borderTop: `1px solid ${colors.cardBorder}`,
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "stretch", sm: "center" },
          gap: 1,
        }}
      >
        <Button
          onClick={onClose}
          sx={{ textTransform: "none", color: colors.text }}
        >
          Close
        </Button>

        <Button
          variant={isSaved ? "contained" : "outlined"}
          onClick={() => onToggleSave(job.id)}
          disabled={isSaving}
          sx={actionButtonSx(colors, "outlined", isSaved)}
        >
          {isSaving ? "Saving..." : isSaved ? "Saved" : "Save"}
        </Button>

        <Button
          variant="contained"
          onClick={() => onApply(job.id)}
          disabled={isApplied || isApplying}
          sx={actionButtonSx(colors, "contained")}
        >
          {isApplied ? "Applied" : isApplying ? "Applying..." : "Apply"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function JobCard({
  job,
  colors,
  onApply,
  onView,
  onToggleSave,
  isApplied,
  isApplying,
  isSaved,
  isSaving,
}) {
  const score = Number(job.match_score || 0);

  return (
    <Card
      sx={{
        width: "100%",
        height: "100%",
        minWidth: 0,
        borderRadius: 3,
        background: colors.card,
        border: `1px solid ${colors.cardBorder}`,
        boxShadow: colors.cardShadow,
        overflow: "hidden",
        transition: "transform 0.18s ease, box-shadow 0.18s ease",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: colors.cardHoverShadow,
        },
      }}
    >
      <CardContent sx={{ height: "100%", p: { xs: 1.6, sm: 2 } }}>
        <Stack spacing={1.4} sx={{ height: "100%" }}>
          <Box>
            <Typography
              sx={{
                color: colors.text,
                fontWeight: 900,
                fontSize: { xs: 17, sm: 18.5 },
                lineHeight: 1.25,
                wordBreak: "break-word",
              }}
            >
              {job.title || "Untitled job"}
            </Typography>

            <Stack
              direction="row"
              spacing={0.7}
              alignItems="center"
              sx={{ mt: 0.6 }}
            >
              <WorkOutlineRoundedIcon
                sx={{ fontSize: 17, color: colors.subtext }}
              />
              <Typography sx={{ color: colors.subtext, fontSize: 13 }}>
                {job.position || "Position not set"}
              </Typography>
            </Stack>
          </Box>

          <Typography sx={{ color: colors.subtext, fontSize: 13 }}>
            {job.location || "Location not set"} •{" "}
            {job.job_type || "Not specified"}
          </Typography>

          <Typography sx={{ color: colors.subtext, fontSize: 13 }}>
            Salary: {job.salary || "Not specified"}
          </Typography>

          <Box>
            <Chip
              size="small"
              label={`${score}% Match`}
              sx={{
                height: 28,
                color: getMatchColor(score),
                background: "rgba(248,81,36,0.08)",
                border: `1px solid ${colors.cardBorder}`,
                fontWeight: 900,
                fontSize: 12,
              }}
            />

            <LinearProgress
              variant="determinate"
              value={Math.min(100, Math.max(0, score))}
              sx={{
                mt: 1,
                height: 7,
                borderRadius: 999,
                backgroundColor: "rgba(248,81,36,0.10)",
                "& .MuiLinearProgress-bar": {
                  borderRadius: 999,
                  background: getMatchColor(score),
                },
              }}
            />
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          <Stack spacing={1}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => onView(job)}
              sx={{
                minHeight: 42,
                borderRadius: 2.5,
                textTransform: "none",
                fontWeight: 900,
                borderColor: colors.accent,
                color: colors.accent,
                "&:hover": {
                  borderColor: colors.accentHover,
                  background: colors.hoverBg,
                },
              }}
            >
              View Job
            </Button>

            <Button
              fullWidth
              variant="contained"
              disabled={isApplied || isApplying}
              onClick={() => onApply(job.id)}
              sx={{
                minHeight: 42,
                borderRadius: 2.5,
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
              {isApplied ? "Applied" : isApplying ? "Applying..." : "Apply"}
            </Button>

            <Button
              fullWidth
              variant={isSaved ? "contained" : "outlined"}
              startIcon={isSaved ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              disabled={isSaving}
              onClick={() => onToggleSave(job.id)}
              sx={{
                minHeight: 42,
                borderRadius: 2.5,
                textTransform: "none",
                fontWeight: 900,
                borderColor: isSaved ? colors.accent : colors.cardBorder,
                color: isSaved ? "#fff" : colors.accent,
                background: isSaved ? colors.buttonBg : "transparent",
                "&:hover": {
                  borderColor: colors.accent,
                  background: isSaved ? colors.buttonHoverBg : colors.hoverBg,
                },
              }}
            >
              {isSaving ? "Saving..." : isSaved ? "Saved" : "Save"}
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function CandidateJobs() {
  const [jobs, setJobs] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [jobTypeFilter, setJobTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("best_match");
  const [minMatch, setMinMatch] = useState(0);
  const [loading, setLoading] = useState(false);
  const [appliedJobIds, setAppliedJobIds] = useState([]);
  const [savedJobIds, setSavedJobIds] = useState([]);
  const [applyingJobId, setApplyingJobId] = useState(null);
  const [savingJobId, setSavingJobId] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const candidateId = user?.candidate_id;

  useEffect(() => {
    fetchPageData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchPageData() {
    try {
      setErr("");
      setSuccess("");
      setLoading(true);

      const jobsData = await getJobs(candidateId);
      setJobs(Array.isArray(jobsData) ? jobsData : []);

      if (candidateId) {
        const [appliedIds, savedIds] = await Promise.all([
          getAppliedJobIds(candidateId),
          getSavedJobIds(candidateId),
        ]);

        setAppliedJobIds(Array.isArray(appliedIds) ? appliedIds : []);
        setSavedJobIds(Array.isArray(savedIds) ? savedIds : []);
      }
    } catch (error) {
      console.error(error);
      setErr("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  }

  async function handleApply(jobId) {
    try {
      setErr("");
      setSuccess("");

      if (!candidateId) {
        setErr("Candidate profile not linked yet. Please login again.");
        return;
      }

      if (appliedJobIds.includes(jobId)) return;

      setApplyingJobId(jobId);
      await applyToJob(candidateId, jobId);
      setAppliedJobIds((prev) => [...prev, jobId]);
      setSuccess("Application submitted successfully");
    } catch (error) {
      console.error(error);
      setErr(error?.response?.data?.message || "Failed to apply");
    } finally {
      setApplyingJobId(null);
    }
  }

  async function handleToggleSave(jobId) {
    try {
      setErr("");
      setSuccess("");

      if (!candidateId) {
        setErr("Candidate profile not linked yet. Please login again.");
        return;
      }

      setSavingJobId(jobId);

      if (savedJobIds.includes(jobId)) {
        await unsaveJob(candidateId, jobId);
        setSavedJobIds((prev) => prev.filter((id) => id !== jobId));
      } else {
        await saveJob(candidateId, jobId);
        setSavedJobIds((prev) => [...prev, jobId]);
      }
    } catch (error) {
      console.error(error);
      setErr(error?.response?.data?.message || "Failed to update saved jobs");
    } finally {
      setSavingJobId(null);
    }
  }

  function handleViewJob(job) {
    setSelectedJob(job);
    setDetailsOpen(true);
  }

  function handleCloseDetails() {
    setDetailsOpen(false);
    setSelectedJob(null);
  }

  const jobTypes = [
    "Full Time",
    "Part Time",
    "Internship",
    "Remote",
    "Hybrid",
    "Contract",
    "Temporary",
    "Freelance",
  ];

  const filteredJobs = useMemo(() => {
    let result = Array.isArray(jobs) ? [...jobs] : [];

    if (activeTab === "saved") {
      result = result.filter((job) => savedJobIds.includes(job.id));
    }

    if (activeTab === "applied") {
      result = result.filter((job) => appliedJobIds.includes(job.id));
    }

    if (keyword.trim()) {
      const q = keyword.toLowerCase();
      result = result.filter(
        (job) =>
          String(job.title || "")
            .toLowerCase()
            .includes(q) ||
          String(job.position || "")
            .toLowerCase()
            .includes(q) ||
          String(job.description || "")
            .toLowerCase()
            .includes(q),
      );
    }

    if (location.trim()) {
      const q = location.toLowerCase();
      result = result.filter((job) =>
        String(job.location || "")
          .toLowerCase()
          .includes(q),
      );
    }

    if (jobTypeFilter !== "all") {
      const selectedType = String(jobTypeFilter)
        .toLowerCase()
        .replace(/[-_]/g, " ");

      result = result.filter((job) => {
        const jobType = String(job.job_type || "")
          .toLowerCase()
          .replace(/[-_]/g, " ");
        return jobType === selectedType;
      });
    }

    if (minMatch > 0) {
      result = result.filter(
        (job) => Number(job.match_score || 0) >= Number(minMatch),
      );
    }

    if (sortBy === "newest") {
      result.sort(
        (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0),
      );
    } else if (sortBy === "salary_high") {
      result.sort(
        (a, b) => parseSalaryNumber(b.salary) - parseSalaryNumber(a.salary),
      );
    } else if (sortBy === "title_az") {
      result.sort((a, b) =>
        String(a.title || "").localeCompare(String(b.title || "")),
      );
    } else {
      result.sort(
        (a, b) => Number(b.match_score || 0) - Number(a.match_score || 0),
      );
    }

    return result;
  }, [
    jobs,
    keyword,
    location,
    jobTypeFilter,
    minMatch,
    sortBy,
    savedJobIds,
    appliedJobIds,
    activeTab,
  ]);

  function clearFilters() {
    setKeyword("");
    setLocation("");
    setJobTypeFilter("all");
    setSortBy("best_match");
    setMinMatch(0);
    setActiveTab("all");
  }

  return (
    <CandidateLayout>
      {(themeColors) => {
        const colors = {
          ...themeColors,
          card: themeColors.card ?? themeColors.cardBg,
          chipBg: themeColors.chipBg ?? themeColors.hoverBg,
          chipText: themeColors.chipText ?? themeColors.accent,
          cardShadow: themeColors.cardShadow ?? "0 8px 24px rgba(0,0,0,0.10)",
          cardHoverShadow:
            themeColors.cardHoverShadow ?? "0 12px 30px rgba(0,0,0,0.14)",
        };

        return (
          <>
            <Box
              sx={{
                mb: 3,
                p: { xs: 1.55, sm: 2.4 },
                borderRadius: 3,
                background: colors.card,
                border: `1px solid ${colors.cardBorder}`,
                boxShadow: colors.cardShadow,
              }}
            >
              <Stack spacing={1.2}>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 900,
                    fontSize: { xs: "1.45rem", sm: "2rem" },
                    color: colors.text,
                    letterSpacing: "-0.03em",
                  }}
                >
                  Find your next role
                </Typography>

                <Typography sx={{ color: colors.subtext, fontSize: 14 }}>
                  Browse jobs tailored to your profile, compare matches, and
                  apply fast.
                </Typography>

                <Button
                  variant="contained"
                  startIcon={<RefreshRoundedIcon />}
                  sx={{
                    ...actionButtonSx(colors, "contained"),
                    mt: 1,
                    width: { xs: "100%", sm: "fit-content" },
                  }}
                  onClick={fetchPageData}
                >
                  Refresh jobs
                </Button>
              </Stack>
            </Box>

            {err && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>
                {err}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 2, borderRadius: 3 }}>
                {success}
              </Alert>
            )}

            <Card
              sx={{
                borderRadius: 3,
                mb: 3,
                backgroundColor: colors.card,
                border: `1px solid ${colors.cardBorder}`,
                boxShadow: colors.cardShadow,
              }}
            >
              <CardContent sx={{ p: { xs: 1.55, sm: 2.2, md: 2.6 } }}>
                <Stack spacing={{ xs: 1.6, sm: 2.1 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Box
                      sx={{
                        width: 42,
                        height: 42,
                        borderRadius: 3,
                        display: "grid",
                        placeItems: "center",
                        background: colors.buttonBg,
                        color: "#fff",
                      }}
                    >
                      <TuneRoundedIcon />
                    </Box>

                    <Box>
                      <Typography fontWeight={900} sx={{ color: colors.text }}>
                        Filter jobs
                      </Typography>
                      <Typography sx={{ color: colors.subtext, fontSize: 13 }}>
                        Showing {filteredJobs.length} of {jobs.length} jobs •{" "}
                        {getSortLabel(sortBy)}
                      </Typography>
                    </Box>
                  </Stack>

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label="Job title or keyword"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon sx={{ color: colors.subtext }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={filterFieldSx(colors)}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label="Location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LocationOnOutlinedIcon
                                sx={{ color: colors.subtext }}
                              />
                            </InputAdornment>
                          ),
                        }}
                        sx={filterFieldSx(colors)}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <TextField
                        fullWidth
                        select
                        label="Job type"
                        value={jobTypeFilter}
                        onChange={(e) => setJobTypeFilter(e.target.value)}
                        sx={filterFieldSx(colors)}
                      >
                        <MenuItem value="all">All job types</MenuItem>
                        {jobTypes.map((type) => (
                          <MenuItem key={type} value={type}>
                            {type}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <TextField
                        fullWidth
                        select
                        label="Sort by"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        sx={filterFieldSx(colors)}
                      >
                        <MenuItem value="best_match">Best match first</MenuItem>
                        <MenuItem value="newest">Newest first</MenuItem>
                        <MenuItem value="salary_high">Highest salary</MenuItem>
                        <MenuItem value="title_az">Title A-Z</MenuItem>
                      </TextField>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <Box
                        sx={{
                          p: 1.4,
                          borderRadius: 3,
                          backgroundColor: colors.inputBg,
                          border: `1px solid ${colors.inputBorder}`,
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            mb: 0.5,
                          }}
                        >
                          <Typography
                            sx={{ color: colors.subtext, fontSize: 13 }}
                          >
                            Minimum match
                          </Typography>
                          <Typography
                            sx={{
                              color: colors.text,
                              fontWeight: 800,
                              fontSize: 13,
                            }}
                          >
                            {minMatch}%
                          </Typography>
                        </Box>

                        <Slider
                          value={minMatch}
                          min={0}
                          max={100}
                          step={5}
                          onChange={(event, value) =>
                            setMinMatch(Number(value))
                          }
                          sx={{
                            color: colors.accent,
                            "& .MuiSlider-thumb": {
                              backgroundColor: colors.accent,
                              border: "2px solid #fff",
                            },
                            "& .MuiSlider-rail": {
                              color: colors.inputBorder,
                              opacity: 1,
                            },
                          }}
                        />
                      </Box>
                    </Grid>
                  </Grid>

                  <Divider sx={{ borderColor: colors.cardBorder }} />

                  <Stack
                    direction="row"
                    spacing={1}
                    useFlexGap
                    flexWrap="wrap"
                    sx={{ overflowX: "auto" }}
                  >
                    <Button
                      variant={activeTab === "all" ? "contained" : "outlined"}
                      sx={actionButtonSx(
                        colors,
                        "outlined",
                        activeTab === "all",
                      )}
                      onClick={() => setActiveTab("all")}
                    >
                      All Jobs
                    </Button>

                    <Button
                      variant={activeTab === "saved" ? "contained" : "outlined"}
                      startIcon={
                        activeTab === "saved" ? (
                          <FavoriteIcon />
                        ) : (
                          <FavoriteBorderIcon />
                        )
                      }
                      sx={actionButtonSx(
                        colors,
                        "outlined",
                        activeTab === "saved",
                      )}
                      onClick={() => setActiveTab("saved")}
                    >
                      Saved
                    </Button>

                    <Button
                      variant={
                        activeTab === "applied" ? "contained" : "outlined"
                      }
                      sx={actionButtonSx(
                        colors,
                        "outlined",
                        activeTab === "applied",
                      )}
                      onClick={() => setActiveTab("applied")}
                    >
                      Applied
                    </Button>

                    <Button
                      variant="outlined"
                      sx={actionButtonSx(colors)}
                      onClick={clearFilters}
                    >
                      Clear filters
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>

            {loading ? (
              <Typography sx={{ color: colors.subtext }}>
                Loading jobs...
              </Typography>
            ) : (
              <Grid container spacing={{ xs: 1.4, sm: 2.2 }}>
                {filteredJobs.length > 0 ? (
                  filteredJobs.map((job) => (
                    <Grid size={{ xs: 12, md: 6, xl: 4 }} key={job.id}>
                      <JobCard
                        job={job}
                        colors={colors}
                        onApply={handleApply}
                        onView={handleViewJob}
                        onToggleSave={handleToggleSave}
                        isApplied={appliedJobIds.includes(job.id)}
                        isApplying={applyingJobId === job.id}
                        isSaved={savedJobIds.includes(job.id)}
                        isSaving={savingJobId === job.id}
                      />
                    </Grid>
                  ))
                ) : (
                  <Grid size={12}>
                    <Typography sx={{ color: colors.subtext }}>
                      {activeTab === "saved"
                        ? "No saved jobs yet."
                        : activeTab === "applied"
                          ? "No applied jobs yet."
                          : "No jobs found."}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            )}

            <JobDetailsModal
              open={detailsOpen}
              onClose={handleCloseDetails}
              job={selectedJob}
              onApply={handleApply}
              isApplied={
                selectedJob ? appliedJobIds.includes(selectedJob.id) : false
              }
              isApplying={
                selectedJob ? applyingJobId === selectedJob.id : false
              }
              onToggleSave={handleToggleSave}
              isSaved={
                selectedJob ? savedJobIds.includes(selectedJob.id) : false
              }
              isSaving={selectedJob ? savingJobId === selectedJob.id : false}
              colors={colors}
            />
          </>
        );
      }}
    </CandidateLayout>
  );
}
