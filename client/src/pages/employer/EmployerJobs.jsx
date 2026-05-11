/**
 * The `EmployerJobs` component in this React code manages a list of job postings for an employer,
 * allowing them to view, edit, and close jobs with various functionalities like search, sorting,
 * pagination, and dialog interactions.
 */

import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Stack,
  Chip,
  IconButton,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Switch,
  FormControlLabel,
  Alert,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import KeyboardArrowLeftRoundedIcon from "@mui/icons-material/KeyboardArrowLeftRounded";
import KeyboardArrowRightRoundedIcon from "@mui/icons-material/KeyboardArrowRightRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import LockClockRoundedIcon from "@mui/icons-material/LockClockRounded";
import WorkOutlineRoundedIcon from "@mui/icons-material/WorkOutlineRounded";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:3001";

const STATUS_OPTIONS = ["open", "closed", "draft"];
const JOB_TYPE_OPTIONS = [
  "Full-time",
  "Part-time",
  "Internship",
  "Contract",
  "Remote",
  "Hybrid",
];

const STATUS_STYLES = {
  open: {
    color: "#2f7d32",
    bg: "rgba(76,175,80,0.14)",
    border: "rgba(76,175,80,0.24)",
  },
  closed: {
    color: "#c2410c",
    bg: "rgba(249,115,22,0.16)",
    border: "rgba(249,115,22,0.26)",
  },
  draft: {
    color: "#8a5b34",
    bg: "rgba(255,125,41,0.12)",
    border: "rgba(255,125,41,0.22)",
  },
};

const emptyForm = {
  title: "",
  position: "",
  salary: "",
  location: "",
  job_type: "Full-time",
  source: "",
  contact_email: "",
  contact_phone: "",
  description: "",
  is_visible: true,
  status: "open",
};

export default function EmployerJobs() {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  const [editOpen, setEditOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const [saving, setSaving] = useState(false);
  const [closingId, setClosingId] = useState(null);

  const [messageOpen, setMessageOpen] = useState(false);
  const [messageType, setMessageType] = useState("success");
  const [messageText, setMessageText] = useState("");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [jobToClose, setJobToClose] = useState(null);

  const rowsPerPage = 10;

  function showMessage(type, text) {
    setMessageType(type);
    setMessageText(text);
    setMessageOpen(true);
  }

  useEffect(() => {
    loadJobs();

    const interval = setInterval(() => {
      loadJobs(false);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  async function loadJobs(showLoader = true) {
    try {
      if (showLoader) setLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("You are not logged in");
      }

      const res = await fetch(`${API_BASE_URL}/employer/jobs`, {
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch jobs");
      }

      setJobs(Array.isArray(data.jobs) ? data.jobs : []);
    } catch (err) {
      console.error(err);
      setJobs([]);
      if (showLoader) {
        showMessage("error", err.message || "Failed to fetch jobs.");
      }
    } finally {
      if (showLoader) setLoading(false);
    }
  }

  function formatDate(value) {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleDateString();
  }

  function getCreatorLabel(job) {
    if (job?.company_name) return job.company_name;

    const role = String(job?.created_by_role || "").toLowerCase();

    if (role === "admin") return "Admin";
    if (role === "employer") return "Employer";
    return job?.created_by_role || "-";
  }

  const filteredJobs = useMemo(() => {
    let rows = [...jobs];

    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter((job) =>
        [
          job.title,
          job.position,
          job.location,
          job.job_type,
          job.source,
          job.contact_email,
          job.created_by_role,
          job.company_name,
          job.status,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(q)),
      );
    }

    if (tab !== "all") {
      rows = rows.filter(
        (job) => String(job.status || "").toLowerCase() === tab,
      );
    }

    if (sortBy === "a-z") {
      rows.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    } else if (sortBy === "z-a") {
      rows.sort((a, b) => (b.title || "").localeCompare(a.title || ""));
    } else if (sortBy === "oldest") {
      rows.sort(
        (a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0),
      );
    } else {
      rows.sort(
        (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0),
      );
    }

    return rows;
  }, [jobs, search, tab, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / rowsPerPage));

  const paginatedJobs = filteredJobs.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage,
  );

  useEffect(() => {
    setPage(1);
  }, [search, tab, sortBy]);

  const visiblePages = useMemo(() => {
    const pages = [];
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, page + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }, [page, totalPages]);

  const tabButtons = [
    { label: "All", value: "all" },
    { label: "Open", value: "open" },
    { label: "Closed", value: "closed" },
    { label: "Draft", value: "draft" },
  ];

  function openDetails(job) {
    setSelectedJob(job);
    setDetailsOpen(true);
  }

  function closeDetails() {
    setSelectedJob(null);
    setDetailsOpen(false);
  }

  function openEdit(job) {
    setEditingJob(job);
    setFormData({
      title: job.title || "",
      position: job.position || "",
      salary: job.salary || "",
      location: job.location || "",
      job_type: job.job_type || "Full-time",
      source: job.source || "",
      contact_email: job.contact_email || "",
      contact_phone: job.contact_phone || "",
      description: job.description || "",
      is_visible: Boolean(job.is_visible),
      status: job.status || "open",
    });
    setEditOpen(true);
  }

  function closeEdit() {
    if (saving) return;
    setEditOpen(false);
    setEditingJob(null);
    setFormData(emptyForm);
  }

  function handleFormChange(field, value) {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function handleSaveEdit() {
    if (!editingJob?.id) return;

    try {
      setSaving(true);

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("You are not logged in");
      }

      const payload = {
        ...formData,
      };

      const res = await fetch(
        `${API_BASE_URL}/employer/jobs/${editingJob.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Failed to update job");
      }

      await loadJobs(false);

      if (selectedJob?.id === editingJob.id) {
        setSelectedJob(data.job || null);
      }

      closeEdit();
      showMessage("success", "Job updated successfully.");
    } catch (err) {
      console.error(err);
      showMessage("error", err.message || "Failed to update job.");
    } finally {
      setSaving(false);
    }
  }

  function requestCloseJob(job) {
    if (!job?.id) return;
    setJobToClose(job);
    setConfirmOpen(true);
  }

  async function handleCloseJobConfirmed() {
    if (!jobToClose?.id) return;

    try {
      setClosingId(jobToClose.id);

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("You are not logged in");
      }

      const res = await fetch(
        `${API_BASE_URL}/employer/jobs/${jobToClose.id}/close`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Failed to close job");
      }

      await loadJobs(false);

      if (selectedJob?.id === jobToClose.id) {
        setSelectedJob(data.job || null);
      }

      setConfirmOpen(false);
      setJobToClose(null);
      showMessage("success", "Job closed successfully.");
    } catch (err) {
      console.error(err);
      showMessage("error", err.message || "Failed to close job.");
    } finally {
      setClosingId(null);
    }
  }

  return (
    <Box>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          borderRadius: 2,
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(6px)",
          border: "1px solid rgba(122, 86, 48, 0.10)",
          boxShadow: "0 10px 28px rgba(122, 86, 48, 0.10)",
        }}
      >
        <Stack
          direction={{ xs: "column", xl: "row" }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", xl: "center" }}
          sx={{ mb: 3 }}
        >
          <Box>
            <Typography
              variant="h4"
              sx={{
                color: "#4a2b12",
                fontWeight: 800,
                letterSpacing: "-0.02em",
              }}
            >
              My Jobs
            </Typography>
          </Box>

          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1.5}
            sx={{ width: { xs: "100%", xl: "auto" }, flexWrap: "wrap" }}
          >
            <TextField
              placeholder="Search title, role, location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "#8a5b34" }} />
                  </InputAdornment>
                ),
              }}
              sx={warmFieldSx(300)}
            />

            <TextField
              select
              size="small"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              sx={warmFieldSx(108)}
            >
              <MenuItem value="newest">New</MenuItem>
              <MenuItem value="oldest">Old</MenuItem>
              <MenuItem value="a-z">A-Z</MenuItem>
              <MenuItem value="z-a">Z-A</MenuItem>
            </TextField>

            <Button
              onClick={() => loadJobs()}
              startIcon={<RefreshRoundedIcon />}
              variant="outlined"
              sx={topActionBtnSx}
            >
              Refresh
            </Button>

            <Button
              onClick={() => navigate("/employer/jobs/create")}
              startIcon={<AddRoundedIcon />}
              variant="contained"
              sx={primaryBtnSx}
            >
              Create Job
            </Button>
          </Stack>
        </Stack>

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1.25}
          alignItems={{ xs: "stretch", md: "center" }}
          justifyContent="space-between"
          sx={{ mb: 2.5 }}
        >
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            {tabButtons.map((item) => {
              const active = tab === item.value;
              return (
                <Button
                  key={item.value}
                  onClick={() => setTab(item.value)}
                  variant="contained"
                  sx={{
                    textTransform: "none",
                    borderRadius: 999,
                    px: 2,
                    py: 1,
                    fontWeight: 700,
                    color: active ? "#fff" : "#6a4120",
                    background: active
                      ? "linear-gradient(135deg, #FF7D29 0%, #F4B63D 100%)"
                      : "rgba(255,255,255,0.35)",
                    border: active
                      ? "1px solid rgba(138,75,18,0.15)"
                      : "1px solid rgba(122,86,48,0.08)",
                    boxShadow: active
                      ? "0 8px 18px rgba(255,125,41,0.22)"
                      : "none",
                    "&:hover": {
                      background: active
                        ? "linear-gradient(135deg, #f97316 0%, #e8a72a 100%)"
                        : "rgba(255,255,255,0.5)",
                    },
                  }}
                >
                  {item.label}
                </Button>
              );
            })}
          </Stack>

          <Chip
            label={`Total jobs: ${filteredJobs.length}`}
            sx={{
              alignSelf: { xs: "flex-start", md: "center" },
              color: "#6a4120",
              backgroundColor: "rgba(255,255,255,0.38)",
              border: "1px solid rgba(122,86,48,0.08)",
              borderRadius: 999,
              fontWeight: 700,
            }}
          />
        </Stack>

        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            background: "rgba(255,255,255,0.38)",
            borderRadius: 2,
            overflow: "auto",
            border: "1px solid rgba(122, 86, 48, 0.10)",
          }}
        >
          <Table sx={{ minWidth: 1400, tableLayout: "fixed" }}>
            <TableHead>
              <TableRow
                sx={{
                  "& th": {
                    position: "sticky",
                    top: 0,
                    zIndex: 2,
                    background: "#FFE7A2",
                  },
                }}
              >
                <TableCell sx={{ ...headCellSx, width: "18%" }}>Job</TableCell>
                <TableCell sx={{ ...headCellSx, width: "11%" }}>
                  Position
                </TableCell>
                <TableCell sx={{ ...headCellSx, width: "10%" }}>
                  Location
                </TableCell>
                <TableCell sx={{ ...headCellSx, width: "9%" }}>Type</TableCell>
                <TableCell sx={{ ...headCellSx, width: "10%" }}>
                  Salary
                </TableCell>
                <TableCell sx={{ ...headCellSx, width: "9%" }}>
                  Status
                </TableCell>
                <TableCell sx={{ ...headCellSx, width: "8%" }}>
                  Visible
                </TableCell>
                <TableCell sx={{ ...headCellSx, width: "7%" }}>Views</TableCell>
                <TableCell sx={{ ...headCellSx, width: "7%" }}>Apps</TableCell>
                <TableCell sx={{ ...headCellSx, width: "10%" }}>
                  Company
                </TableCell>
                <TableCell sx={{ ...headCellSx, width: "9%" }}>
                  Created
                </TableCell>
                <TableCell sx={{ ...headCellSx, width: "10%" }} align="right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {paginatedJobs.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={12}
                    sx={{
                      color: "#8a6a3c",
                      textAlign: "center",
                      py: 6,
                      borderBottom: "none",
                    }}
                  >
                    {loading ? "Loading..." : "No jobs found."}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedJobs.map((job, index) => {
                  const status = (job.status || "open").toLowerCase();
                  const statusStyle =
                    STATUS_STYLES[status] || STATUS_STYLES.open;

                  return (
                    <TableRow
                      key={`${job.id || job.title || "job"}-${index}`}
                      sx={{
                        transition: "all 0.18s ease",
                        "& td": {
                          borderBottom: "1px solid rgba(122,86,48,0.08)",
                        },
                        "&:nth-of-type(even)": {
                          backgroundColor: "rgba(255,255,255,0.16)",
                        },
                        "&:hover": {
                          backgroundColor: "rgba(255,125,41,0.08)",
                        },
                      }}
                    >
                      <TableCell sx={{ ...bodyCellSx, width: "18%" }}>
                        <Stack
                          direction="row"
                          spacing={1.5}
                          alignItems="center"
                        >
                          <Box
                            sx={{
                              width: 42,
                              height: 42,
                              borderRadius: "50%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              background:
                                "linear-gradient(135deg, rgba(255,125,41,0.95), rgba(244,182,61,0.95))",
                              color: "#fff",
                              flexShrink: 0,
                            }}
                          >
                            <WorkOutlineRoundedIcon />
                          </Box>

                          <Box sx={{ minWidth: 0 }}>
                            <Typography
                              onClick={() => openDetails(job)}
                              sx={{
                                cursor: "pointer",
                                fontWeight: 700,
                                color: "#4a2b12",
                                transition: "0.15s ease",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                textDecoration: "underline",
                                textDecorationColor: "rgba(74,43,18,0.25)",
                                textUnderlineOffset: "3px",
                                "&:hover": {
                                  color: "#c2410c",
                                },
                              }}
                            >
                              {job.title || "-"}
                            </Typography>
                            <Typography
                              sx={{
                                color: "#8a6a3c",
                                fontSize: 12.5,
                                mt: 0.25,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {job.source || "No source"}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>

                      <TableCell sx={{ ...bodyCellSx, width: "11%" }}>
                        <Typography sx={truncateTextSx}>
                          {job.position || "-"}
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ ...bodyCellSx, width: "10%" }}>
                        <Typography sx={truncateTextSx}>
                          {job.location || "-"}
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ ...bodyCellSx, width: "9%" }}>
                        <Typography sx={truncateTextSx}>
                          {job.job_type || "-"}
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ ...bodyCellSx, width: "10%" }}>
                        <Typography sx={truncateTextSx}>
                          {job.salary || "-"}
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ ...bodyCellSx, width: "9%" }}>
                        <Chip
                          label={status}
                          size="small"
                          sx={{
                            borderRadius: 999,
                            fontWeight: 700,
                            color: statusStyle.color,
                            backgroundColor: statusStyle.bg,
                            border: `1px solid ${statusStyle.border}`,
                            textTransform: "capitalize",
                          }}
                        />
                      </TableCell>

                      <TableCell sx={{ ...bodyCellSx, width: "8%" }}>
                        <Chip
                          label={job.is_visible ? "Yes" : "No"}
                          size="small"
                          sx={{
                            borderRadius: 999,
                            fontWeight: 700,
                            color: job.is_visible ? "#2f7d32" : "#8a6a3c",
                            backgroundColor: job.is_visible
                              ? "rgba(76,175,80,0.12)"
                              : "rgba(255,255,255,0.28)",
                            border: `1px solid ${
                              job.is_visible
                                ? "rgba(76,175,80,0.24)"
                                : "rgba(122,86,48,0.10)"
                            }`,
                          }}
                        />
                      </TableCell>

                      <TableCell sx={{ ...bodyCellSx, width: "7%" }}>
                        <Typography>{job.views_count ?? 0}</Typography>
                      </TableCell>

                      <TableCell sx={{ ...bodyCellSx, width: "7%" }}>
                        <Typography>{job.applications_count ?? 0}</Typography>
                      </TableCell>

                      <TableCell sx={{ ...bodyCellSx, width: "10%" }}>
                        <Typography sx={truncateTextSx}>
                          {getCreatorLabel(job)}
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ ...bodyCellSx, width: "9%" }}>
                        <Typography sx={{ whiteSpace: "nowrap" }}>
                          {formatDate(job.created_at)}
                        </Typography>
                      </TableCell>

                      <TableCell align="right" sx={{ width: "10%" }}>
                        <Stack
                          direction="row"
                          spacing={0.75}
                          justifyContent="flex-end"
                        >
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              sx={actionIconBtnSx}
                              onClick={() => openEdit(job)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Close job">
                            <span>
                              <IconButton
                                size="small"
                                sx={{
                                  ...actionIconBtnSx,
                                  color: "#c2410c",
                                }}
                                disabled={
                                  closingId === job.id ||
                                  job.status === "closed"
                                }
                                onClick={() => requestCloseJob(job)}
                              >
                                <LockClockRoundedIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
          sx={{ mt: 2.5, gap: 2 }}
        >
          <Typography sx={{ color: "#7a5630" }}>
            Showing{" "}
            {filteredJobs.length === 0 ? 0 : (page - 1) * rowsPerPage + 1}-
            {Math.min(page * rowsPerPage, filteredJobs.length)} of{" "}
            {filteredJobs.length}
          </Typography>

          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            <Button
              variant="outlined"
              disabled={page === 1}
              onClick={() => setPage(1)}
              sx={pagerBtnSx}
            >
              First
            </Button>

            <Button
              variant="outlined"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              sx={pagerBtnSx}
            >
              <KeyboardArrowLeftRoundedIcon />
            </Button>

            {visiblePages.map((pageNumber) => (
              <Button
                key={pageNumber}
                variant="contained"
                onClick={() => setPage(pageNumber)}
                sx={{
                  ...pagerBtnSx,
                  minWidth: 42,
                  background:
                    page === pageNumber
                      ? "linear-gradient(135deg, #FF7D29 0%, #F4B63D 100%)"
                      : "rgba(255,255,255,0.35)",
                  color: page === pageNumber ? "#fff" : "#6a4120",
                  border:
                    page === pageNumber
                      ? "1px solid rgba(138,75,18,0.15)"
                      : "1px solid rgba(122,86,48,0.08)",
                  "&:hover": {
                    background:
                      page === pageNumber
                        ? "linear-gradient(135deg, #f97316 0%, #e8a72a 100%)"
                        : "rgba(255,255,255,0.5)",
                  },
                }}
              >
                {pageNumber}
              </Button>
            ))}

            <Button
              variant="outlined"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              sx={pagerBtnSx}
            >
              <KeyboardArrowRightRoundedIcon />
            </Button>

            <Button
              variant="outlined"
              disabled={page === totalPages}
              onClick={() => setPage(totalPages)}
              sx={pagerBtnSx}
            >
              Last
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Dialog
        open={detailsOpen}
        onClose={closeDetails}
        fullWidth
        maxWidth="md"
        PaperProps={{ sx: dialogPaperSx }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: 3,
            py: 2,
            borderBottom: "1px solid rgba(122,86,48,0.08)",
          }}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: "#4a2b12" }}>
              {selectedJob?.title || "Job Details"}
            </Typography>
            <Typography sx={{ color: "rgba(74,43,18,0.55)", mt: 0.4 }}>
              Full job information
            </Typography>
          </Box>

          <IconButton onClick={closeDetails} sx={closeIconSx}>
            <CloseRoundedIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 2.5, px: 0 }}>
          {selectedJob && (
            <Box sx={{ px: 3, pb: 1 }}>
              <Box
                sx={{
                  borderTop: "1px solid rgba(122,86,48,0.08)",
                  borderBottom: "1px solid rgba(122,86,48,0.08)",
                }}
              >
                <SimpleDetailItem label="Title" value={selectedJob.title} />
                <SimpleDetailItem
                  label="Position"
                  value={selectedJob.position}
                />
                <SimpleDetailItem
                  label="Location"
                  value={selectedJob.location}
                />
                <SimpleDetailItem
                  label="Job Type"
                  value={selectedJob.job_type}
                />
                <SimpleDetailItem label="Salary" value={selectedJob.salary} />
                <SimpleDetailItem label="Source" value={selectedJob.source} />
                <SimpleDetailItem
                  label="Contact Email"
                  value={selectedJob.contact_email}
                />
                <SimpleDetailItem
                  label="Contact Phone"
                  value={selectedJob.contact_phone}
                />
                <SimpleDetailItem
                  label="Company"
                  value={getCreatorLabel(selectedJob)}
                />
                <SimpleDetailItem
                  label="Status"
                  value={selectedJob.status}
                  isStatus
                />
                <SimpleDetailItem
                  label="Visible"
                  value={selectedJob.is_visible ? "Yes" : "No"}
                />
                <SimpleDetailItem
                  label="Views"
                  value={String(selectedJob.views_count ?? 0)}
                />
                <SimpleDetailItem
                  label="Applications"
                  value={String(selectedJob.applications_count ?? 0)}
                />
                <SimpleDetailItem
                  label="Created At"
                  value={formatDate(selectedJob.created_at)}
                />
                <SimpleDetailItem
                  label="Description"
                  value={selectedJob.description}
                  noBorder
                />
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={dialogActionsSx}>
          {selectedJob && (
            <>
              <Button
                onClick={() => openEdit(selectedJob)}
                variant="contained"
                sx={primaryBtnSx}
              >
                Edit
              </Button>

              <Button
                onClick={closeDetails}
                variant="outlined"
                sx={secondaryBtnSx}
              >
                Close
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      <Dialog
        open={editOpen}
        onClose={closeEdit}
        fullWidth
        maxWidth="md"
        PaperProps={{ sx: dialogPaperSx }}
      >
        <DialogTitle sx={dialogTitleSx}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography variant="h5" fontWeight={800} color="#4a2b12">
                Edit Job
              </Typography>
              <Typography sx={{ color: "rgba(74,43,18,0.62)", mt: 0.3 }}>
                Update your job information
              </Typography>
            </Box>

            <IconButton onClick={closeEdit} sx={closeIconSx}>
              <CloseRoundedIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={2}>
            <TextField
              label="Job Title"
              fullWidth
              value={formData.title}
              onChange={(e) => handleFormChange("title", e.target.value)}
              sx={fieldSx}
            />

            <TextField
              label="Position"
              fullWidth
              value={formData.position}
              onChange={(e) => handleFormChange("position", e.target.value)}
              sx={fieldSx}
            />

            <TextField
              label="Salary"
              fullWidth
              value={formData.salary}
              onChange={(e) => handleFormChange("salary", e.target.value)}
              sx={fieldSx}
            />

            <TextField
              label="Location"
              fullWidth
              value={formData.location}
              onChange={(e) => handleFormChange("location", e.target.value)}
              sx={fieldSx}
            />

            <TextField
              select
              label="Job Type"
              fullWidth
              value={formData.job_type}
              onChange={(e) => handleFormChange("job_type", e.target.value)}
              sx={fieldSx}
            >
              {JOB_TYPE_OPTIONS.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Status"
              fullWidth
              value={formData.status}
              onChange={(e) => handleFormChange("status", e.target.value)}
              sx={fieldSx}
            >
              {STATUS_OPTIONS.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Source"
              fullWidth
              value={formData.source}
              onChange={(e) => handleFormChange("source", e.target.value)}
              sx={fieldSx}
            />

            <TextField
              label="Contact Email"
              fullWidth
              value={formData.contact_email}
              onChange={(e) =>
                handleFormChange("contact_email", e.target.value)
              }
              sx={fieldSx}
            />

            <TextField
              label="Contact Phone"
              fullWidth
              value={formData.contact_phone}
              onChange={(e) =>
                handleFormChange("contact_phone", e.target.value)
              }
              sx={fieldSx}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_visible}
                  onChange={(e) =>
                    handleFormChange("is_visible", e.target.checked)
                  }
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": {
                      color: "#FF7D29",
                    },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                      backgroundColor: "#F4B63D",
                      opacity: 1,
                    },
                    "& .MuiSwitch-track": {
                      backgroundColor: "rgba(122,86,48,0.20)",
                      opacity: 1,
                    },
                  }}
                />
              }
              label={
                <Typography sx={{ color: "#4a2b12", fontWeight: 600 }}>
                  Visible to candidates
                </Typography>
              }
            />

            <TextField
              label="Description"
              fullWidth
              multiline
              minRows={5}
              value={formData.description}
              onChange={(e) => handleFormChange("description", e.target.value)}
              sx={fieldSx}
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={dialogActionsSx}>
          <Button
            onClick={closeEdit}
            variant="outlined"
            disabled={saving}
            sx={secondaryBtnSx}
          >
            Cancel
          </Button>

          <Button
            onClick={handleSaveEdit}
            variant="contained"
            disabled={saving}
            sx={primaryBtnSx}
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={confirmOpen}
        onClose={() => {
          if (!closingId) {
            setConfirmOpen(false);
            setJobToClose(null);
          }
        }}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: dialogPaperSx }}
      >
        <DialogTitle sx={dialogTitleSx}>
          <Typography variant="h6" fontWeight={800} color="#4a2b12">
            Close Job
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          <Typography sx={{ color: "#6a4120" }}>
            Are you sure you want to close "{jobToClose?.title || "this job"}"?
          </Typography>
        </DialogContent>

        <DialogActions sx={dialogActionsSx}>
          <Button
            onClick={() => {
              setConfirmOpen(false);
              setJobToClose(null);
            }}
            disabled={Boolean(closingId)}
            variant="outlined"
            sx={secondaryBtnSx}
          >
            Cancel
          </Button>

          <Button
            onClick={handleCloseJobConfirmed}
            disabled={Boolean(closingId)}
            variant="contained"
            sx={primaryBtnSx}
          >
            {closingId ? "Closing..." : "Close Job"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={messageOpen}
        onClose={() => setMessageOpen(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: dialogPaperSx }}
      >
        <DialogTitle sx={dialogTitleSx}>
          <Typography variant="h6" fontWeight={800} color="#4a2b12">
            {messageType === "success" ? "Success" : "Notice"}
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          <Alert severity={messageType} sx={{ borderRadius: 2 }}>
            {messageText}
          </Alert>
        </DialogContent>

        <DialogActions sx={dialogActionsSx}>
          <Button
            onClick={() => setMessageOpen(false)}
            variant="contained"
            sx={primaryBtnSx}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function SimpleDetailItem({
  label,
  value,
  isStatus = false,
  noBorder = false,
}) {
  const statusStyle = STATUS_STYLES[String(value).toLowerCase()] || {
    color: "#8a6a3c",
    bg: "rgba(255,255,255,0.28)",
    border: "rgba(122,86,48,0.10)",
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        alignItems: { xs: "flex-start", sm: "center" },
        justifyContent: "space-between",
        gap: 1.2,
        py: 1.8,
        px: 0.5,
        borderBottom: noBorder ? "none" : "1px solid rgba(122,86,48,0.08)",
      }}
    >
      <Typography
        sx={{
          minWidth: { sm: 180 },
          color: "rgba(74,43,18,0.55)",
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: "0.03em",
        }}
      >
        {label}
      </Typography>

      {isStatus ? (
        <Chip
          label={value || "-"}
          size="small"
          sx={{
            borderRadius: 999,
            fontWeight: 700,
            color: statusStyle.color,
            backgroundColor: statusStyle.bg,
            border: `1px solid ${statusStyle.border}`,
            textTransform: "capitalize",
          }}
        />
      ) : (
        <Typography
          sx={{
            flex: 1,
            textAlign: { xs: "left", sm: "right" },
            color: "#4a2b12",
            fontSize: 14.5,
            fontWeight: 500,
            wordBreak: "break-word",
          }}
        >
          {value || "-"}
        </Typography>
      )}
    </Box>
  );
}

const headCellSx = {
  color: "#8a5b34",
  fontWeight: 800,
  fontSize: 12,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  borderBottom: "1px solid rgba(122,86,48,0.08)",
  whiteSpace: "nowrap",
};

const bodyCellSx = {
  color: "#4a2b12",
  verticalAlign: "middle",
  py: 1.6,
};

const truncateTextSx = {
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const pagerBtnSx = {
  minWidth: 42,
  color: "#6a4120",
  borderColor: "rgba(122,86,48,0.10)",
  borderRadius: 2.5,
  textTransform: "none",
};

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    color: "#4a2b12",
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.72)",
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "rgba(122,86,48,0.12)",
  },
  "& .MuiInputLabel-root": {
    color: "rgba(74,43,18,0.70)",
  },
  "& .MuiSvgIcon-root": {
    color: "#8a5b34",
  },
};

function warmFieldSx(minWidth) {
  return {
    minWidth,
    flexShrink: 0,
    "& .MuiOutlinedInput-root": {
      color: "#4a2b12",
      borderRadius: 3,
      backgroundColor: "rgba(255,255,255,0.72)",
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(122,86,48,0.10)",
    },
    "& .MuiInputBase-input::placeholder": {
      color: "#8a6a3c",
      opacity: 1,
    },
    "& .MuiSvgIcon-root": {
      color: "#8a5b34",
    },
  };
}

const topActionBtnSx = {
  color: "#6a4120",
  borderColor: "rgba(122,86,48,0.12)",
  borderRadius: 3,
  px: 1.8,
  minWidth: 110,
  flexShrink: 0,
  textTransform: "none",
  fontWeight: 700,
  backgroundColor: "rgba(255,255,255,0.20)",
  "&:hover": {
    borderColor: "rgba(122,86,48,0.18)",
    backgroundColor: "rgba(255,255,255,0.35)",
  },
};

const actionIconBtnSx = {
  color: "#6a4120",
  backgroundColor: "rgba(255,255,255,0.28)",
  border: "1px solid rgba(122,86,48,0.08)",
  "&:hover": {
    backgroundColor: "rgba(255,255,255,0.45)",
  },
};

const dialogPaperSx = {
  background:
    "linear-gradient(180deg, rgba(255,252,245,0.98) 0%, rgba(255,247,237,0.98) 100%)",
  color: "#4a2b12",
  borderRadius: 4,
  border: "1px solid rgba(122,86,48,0.10)",
  boxShadow: "0 24px 60px rgba(122,86,48,0.18)",
};

const dialogTitleSx = {
  borderBottom: "1px solid rgba(122,86,48,0.08)",
  px: 3,
  py: 2.2,
};

const dialogActionsSx = {
  p: 2,
  borderTop: "1px solid rgba(122,86,48,0.08)",
};

const closeIconSx = {
  color: "#6a4120",
  backgroundColor: "rgba(255,255,255,0.28)",
  border: "1px solid rgba(122,86,48,0.08)",
  "&:hover": {
    backgroundColor: "rgba(255,255,255,0.45)",
  },
};

const primaryBtnSx = {
  textTransform: "none",
  fontWeight: 800,
  borderRadius: 3,
  px: 2,
  minWidth: 120,
  background: "linear-gradient(135deg, #FF7D29 0%, #F4B63D 100%)",
  boxShadow: "0 8px 18px rgba(255,125,41,0.22)",
  "&:hover": {
    background: "linear-gradient(135deg, #f97316 0%, #e8a72a 100%)",
  },
};

const secondaryBtnSx = {
  color: "#6a4120",
  borderColor: "rgba(122,86,48,0.16)",
  borderRadius: 3,
  textTransform: "none",
  fontWeight: 700,
  minWidth: 110,
  "&:hover": {
    borderColor: "rgba(122,86,48,0.22)",
    backgroundColor: "rgba(255,255,255,0.20)",
  },
};
