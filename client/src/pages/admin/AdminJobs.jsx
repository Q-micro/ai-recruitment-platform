/**
 * The `AdminJobs` function in this React component manages job posts, allowing users to view, create,
 * edit, and close job listings with various features like search, sorting, pagination, and dialogs for
 * confirmation and messages.
 */
import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import Grid from "@mui/material/Grid";
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
  Switch,
  Tooltip,
  FormControlLabel,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import KeyboardArrowLeftRoundedIcon from "@mui/icons-material/KeyboardArrowLeftRounded";
import KeyboardArrowRightRoundedIcon from "@mui/icons-material/KeyboardArrowRightRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import WorkOutlineRoundedIcon from "@mui/icons-material/WorkOutlineRounded";
import LockClockRoundedIcon from "@mui/icons-material/LockClockRounded";

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

const STATUS_STYLES = {
  open: {
    color: "#34d399",
    bg: "rgba(52,211,153,0.16)",
    border: "rgba(52,211,153,0.28)",
  },
  closed: {
    color: "#f87171",
    bg: "rgba(248,113,113,0.16)",
    border: "rgba(248,113,113,0.28)",
  },
  draft: {
    color: "#fbbf24",
    bg: "rgba(251,191,36,0.16)",
    border: "rgba(251,191,36,0.28)",
  },
};

export default function AdminJobs() {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const [saving, setSaving] = useState(false);
  const [closingId, setClosingId] = useState(null);

  const [messageDialog, setMessageDialog] = useState({
    open: false,
    title: "",
    message: "",
  });

  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: "",
    message: "",
    confirmText: "Confirm",
    onConfirm: null,
  });

  const rowsPerPage = 10;

  useEffect(() => {
    loadJobs();

    const interval = setInterval(() => {
      loadJobs(false);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  function showMessage(title, message) {
    setMessageDialog({ open: true, title, message });
  }

  function closeMessageDialog() {
    setMessageDialog({ open: false, title: "", message: "" });
  }

  function openConfirmDialog({
    title,
    message,
    confirmText = "Confirm",
    onConfirm,
  }) {
    setConfirmDialog({
      open: true,
      title,
      message,
      confirmText,
      onConfirm,
    });
  }

  function closeConfirmDialog() {
    setConfirmDialog({
      open: false,
      title: "",
      message: "",
      confirmText: "Confirm",
      onConfirm: null,
    });
  }

  function handleConfirmAction() {
    const action = confirmDialog.onConfirm;
    closeConfirmDialog();
    if (typeof action === "function") action();
  }

  async function loadJobs(showLoader = true) {
    try {
      if (showLoader) setLoading(true);

      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE_URL}/admin/jobs`, {
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch jobs");
      }

      setJobs(Array.isArray(data.jobs) ? data.jobs : []);
    } catch (err) {
      console.error(err);
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

  function formatCreatorRole(role) {
    if (!role) return "Admin";
    const value = String(role).toLowerCase();
    if (value === "employer") return "Employer";
    if (value === "admin") return "Admin";
    return value.charAt(0).toUpperCase() + value.slice(1);
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

  function openCreate() {
    setEditingJob(null);
    setFormData(emptyForm);
    setFormOpen(true);
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
    setFormOpen(true);
  }

  function closeForm() {
    if (saving) return;
    setFormOpen(false);
    setEditingJob(null);
    setFormData(emptyForm);
  }

  function handleFormChange(field, value) {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function handleSaveJob() {
    try {
      setSaving(true);

      const payload = {
        ...formData,
      };

      const isEditing = Boolean(editingJob?.id);

      const res = await fetch(
        isEditing
          ? `${API_BASE_URL}/admin/jobs/${editingJob.id}`
          : `${API_BASE_URL}/admin/jobs`,
        {
          method: isEditing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save job");
      }

      await loadJobs(false);

      if (selectedJob?.id === editingJob?.id) {
        setSelectedJob(data.job || null);
      }

      closeForm();
    } catch (err) {
      console.error(err);
      showMessage("Could not save job", err.message || "Failed to save job.");
    } finally {
      setSaving(false);
    }
  }

  function handleCloseJob(job) {
    if (!job?.id) {
      showMessage("Missing job ID", "Job ID is missing.");
      return;
    }

    openConfirmDialog({
      title: "Close Job",
      message: `Are you sure you want to close "${job.title || "this job"}"? Candidates will no longer see it as open.`,
      confirmText: "Close Job",
      onConfirm: () => performCloseJob(job),
    });
  }

  async function performCloseJob(job) {
    try {
      setClosingId(job.id);

      const res = await fetch(`${API_BASE_URL}/admin/jobs/${job.id}/close`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to close job");
      }

      await loadJobs(false);

      if (selectedJob?.id === job.id) {
        setSelectedJob(data.job || null);
      }
    } catch (err) {
      console.error(err);
      showMessage("Could not close job", err.message || "Failed to close job.");
    } finally {
      setClosingId(null);
    }
  }

  return (
    <AdminLayout>
      <Box
        sx={{
          minHeight: "100vh",
          background:
            "radial-gradient(circle at top left, rgba(37,99,235,0.10), transparent 30%), #071120",
          p: { xs: 2, md: 3 },
        }}
      >
        <Box sx={{ maxWidth: "1600px", mx: "auto" }}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, md: 3 },
              borderRadius: 5,
              background:
                "linear-gradient(180deg, rgba(15,23,42,0.96) 0%, rgba(10,15,28,0.98) 100%)",
              border: "1px solid rgba(148,163,184,0.10)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
              backdropFilter: "blur(10px)",
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
                    color: "#fff",
                    fontWeight: 800,
                    letterSpacing: "-0.02em",
                  }}
                >
                  Jobs
                </Typography>
                <Typography sx={{ color: "rgba(255,255,255,0.65)", mt: 0.75 }}>
                  Manage all job posts from admin and employer side in one place
                </Typography>
              </Box>

              <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
                <TextField
                  placeholder="Search title, role, location, source..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: "#94a3b8" }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={darkFieldSx(320)}
                />

                <TextField
                  select
                  size="small"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  sx={darkFieldSx(150)}
                >
                  <MenuItem value="newest">Newest</MenuItem>
                  <MenuItem value="oldest">Oldest</MenuItem>
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
                  onClick={openCreate}
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
                        color: active ? "#fff" : "rgba(255,255,255,0.78)",
                        background: active
                          ? "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)"
                          : "rgba(255,255,255,0.04)",
                        border: active
                          ? "1px solid rgba(59,130,246,0.45)"
                          : "1px solid rgba(255,255,255,0.06)",
                        boxShadow: active
                          ? "0 10px 25px rgba(37,99,235,0.25)"
                          : "none",
                        "&:hover": {
                          background: active
                            ? "linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)"
                            : "rgba(255,255,255,0.07)",
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
                  color: "#cbd5e1",
                  backgroundColor: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 999,
                  fontWeight: 700,
                }}
              />
            </Stack>

            <TableContainer
              component={Box}
              sx={{
                background: "transparent",
                borderRadius: 0,
                overflow: "auto",
                border: "none",
              }}
            >
              <Table sx={{ minWidth: 1380, tableLayout: "fixed" }}>
                <TableHead>
                  <TableRow
                    sx={{
                      "& th": {
                        position: "sticky",
                        top: 0,
                        zIndex: 2,
                        backdropFilter: "blur(8px)",
                        background: "rgba(15,23,42,0.96)",
                      },
                    }}
                  >
                    <TableCell sx={{ ...headCellSx, width: "20%" }}>
                      Job
                    </TableCell>
                    <TableCell sx={{ ...headCellSx, width: "12%" }}>
                      Position
                    </TableCell>
                    <TableCell sx={{ ...headCellSx, width: "10%" }}>
                      Location
                    </TableCell>
                    <TableCell sx={{ ...headCellSx, width: "10%" }}>
                      Type
                    </TableCell>
                    <TableCell sx={{ ...headCellSx, width: "10%" }}>
                      Salary
                    </TableCell>
                    <TableCell sx={{ ...headCellSx, width: "10%" }}>
                      Posted By
                    </TableCell>
                    <TableCell sx={{ ...headCellSx, width: "9%" }}>
                      Status
                    </TableCell>
                    <TableCell sx={{ ...headCellSx, width: "8%" }}>
                      Visible
                    </TableCell>
                    <TableCell sx={{ ...headCellSx, width: "6%" }}>
                      Views
                    </TableCell>
                    <TableCell sx={{ ...headCellSx, width: "6%" }}>
                      Apps
                    </TableCell>
                    <TableCell sx={{ ...headCellSx, width: "10%" }}>
                      Created
                    </TableCell>
                    <TableCell
                      sx={{ ...headCellSx, width: "9%" }}
                      align="right"
                    >
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
                          color: "#94a3b8",
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
                      const creatorRole = String(
                        job.created_by_role || "admin",
                      ).toLowerCase();

                      return (
                        <TableRow
                          key={`${job.id || job.title || "job"}-${index}`}
                          sx={{
                            transition: "all 0.18s ease",
                            "& td": {
                              borderBottom: "1px solid rgba(255,255,255,0.05)",
                            },
                            "&:nth-of-type(even)": {
                              backgroundColor: "rgba(255,255,255,0.015)",
                            },
                            "&:hover": {
                              backgroundColor: "rgba(59,130,246,0.07)",
                            },
                          }}
                        >
                          <TableCell sx={{ ...bodyCellSx, width: "20%" }}>
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
                                    "linear-gradient(135deg, rgba(37,99,235,0.85), rgba(99,102,241,0.85))",
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
                                    color: "#e2e8f0",
                                    transition: "0.15s ease",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    textDecoration: "underline",
                                    textDecorationColor:
                                      "rgba(96,165,250,0.35)",
                                    textUnderlineOffset: "3px",
                                    "&:hover": {
                                      color: "#60a5fa",
                                      textDecorationColor: "#60a5fa",
                                    },
                                  }}
                                >
                                  {job.title || "-"}
                                </Typography>
                                <Typography
                                  sx={{
                                    color: "#8fa2c4",
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

                          <TableCell sx={{ ...bodyCellSx, width: "12%" }}>
                            <Typography sx={truncateTextSx}>
                              {job.position || "-"}
                            </Typography>
                          </TableCell>

                          <TableCell sx={{ ...bodyCellSx, width: "10%" }}>
                            <Typography sx={truncateTextSx}>
                              {job.location || "-"}
                            </Typography>
                          </TableCell>

                          <TableCell sx={{ ...bodyCellSx, width: "10%" }}>
                            <Typography sx={truncateTextSx}>
                              {job.job_type || "-"}
                            </Typography>
                          </TableCell>

                          <TableCell sx={{ ...bodyCellSx, width: "10%" }}>
                            <Typography sx={truncateTextSx}>
                              {job.salary || "-"}
                            </Typography>
                          </TableCell>

                          <TableCell sx={{ ...bodyCellSx, width: "10%" }}>
                            <Chip
                              label={
                                job.company_name ||
                                formatCreatorRole(job.created_by_role)
                              }
                              size="small"
                              sx={{
                                borderRadius: 999,
                                fontWeight: 700,
                                color:
                                  creatorRole === "employer"
                                    ? "#fbbf24"
                                    : "#93c5fd",
                                backgroundColor:
                                  creatorRole === "employer"
                                    ? "rgba(251,191,36,0.14)"
                                    : "rgba(147,197,253,0.14)",
                                border:
                                  creatorRole === "employer"
                                    ? "1px solid rgba(251,191,36,0.24)"
                                    : "1px solid rgba(147,197,253,0.24)",
                              }}
                            />
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
                                color: job.is_visible ? "#34d399" : "#cbd5e1",
                                backgroundColor: job.is_visible
                                  ? "rgba(52,211,153,0.14)"
                                  : "rgba(255,255,255,0.06)",
                                border: `1px solid ${
                                  job.is_visible
                                    ? "rgba(52,211,153,0.24)"
                                    : "rgba(255,255,255,0.08)"
                                }`,
                              }}
                            />
                          </TableCell>

                          <TableCell sx={{ ...bodyCellSx, width: "6%" }}>
                            <Typography>{job.views_count ?? 0}</Typography>
                          </TableCell>

                          <TableCell sx={{ ...bodyCellSx, width: "6%" }}>
                            <Typography>
                              {job.applications_count ?? 0}
                            </Typography>
                          </TableCell>

                          <TableCell sx={{ ...bodyCellSx, width: "10%" }}>
                            <Typography sx={{ whiteSpace: "nowrap" }}>
                              {formatDate(job.created_at)}
                            </Typography>
                          </TableCell>

                          <TableCell align="right" sx={{ width: "9%" }}>
                            <Stack
                              direction="row"
                              spacing={0.75}
                              justifyContent="flex-end"
                            >
                              <Tooltip title="Edit">
                                {job.created_by_role === "admin" && (
                                  <IconButton
                                    size="small"
                                    sx={actionIconBtnSx}
                                    onClick={() => openEdit(job)}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                )}
                              </Tooltip>

                              <Tooltip title="Close job">
                                <span>
                                  {job.created_by_role === "admin" && (
                                    <IconButton
                                      size="small"
                                      sx={{
                                        ...actionIconBtnSx,
                                        color: "#fbbf24",
                                      }}
                                      disabled={
                                        closingId === job.id ||
                                        job.status === "closed"
                                      }
                                      onClick={() => handleCloseJob(job)}
                                    >
                                      <LockClockRoundedIcon fontSize="small" />
                                    </IconButton>
                                  )}
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
              <Typography sx={{ color: "rgba(255,255,255,0.68)" }}>
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
                          ? "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)"
                          : "rgba(255,255,255,0.04)",
                      color: "#fff",
                      border:
                        page === pageNumber
                          ? "1px solid rgba(59,130,246,0.38)"
                          : "1px solid rgba(255,255,255,0.06)",
                      "&:hover": {
                        background:
                          page === pageNumber
                            ? "linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)"
                            : "rgba(255,255,255,0.08)",
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
        </Box>
      </Box>

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
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: "#fff" }}>
              {selectedJob?.title || "Job Details"}
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.55)", mt: 0.4 }}>
              Full job information
            </Typography>
          </Box>

          <IconButton onClick={closeDetails} sx={{ color: "#fff" }}>
            <CloseRoundedIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 2.5, px: 0 }}>
          {selectedJob && (
            <Box sx={{ px: 3, pb: 1 }}>
              <Box
                sx={{
                  borderTop: "1px solid rgba(255,255,255,0.08)",
                  borderBottom: "1px solid rgba(255,255,255,0.08)",
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
                  label="Posted By"
                  value={formatCreatorRole(selectedJob.created_by_role)}
                />
                <SimpleDetailItem
                  label="Company"
                  value={selectedJob.company_name || "-"}
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
        open={formOpen}
        onClose={closeForm}
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
              <Typography variant="h5" fontWeight={800} color="#fff">
                {editingJob ? "Edit Job" : "Create Job"}
              </Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.62)", mt: 0.3 }}>
                Add or update job information
              </Typography>
            </Box>

            <IconButton onClick={closeForm} sx={closeIconSx}>
              <CloseRoundedIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Job Title"
                fullWidth
                value={formData.title}
                onChange={(e) => handleFormChange("title", e.target.value)}
                sx={fieldSx}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Position"
                fullWidth
                value={formData.position}
                onChange={(e) => handleFormChange("position", e.target.value)}
                sx={fieldSx}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Salary"
                fullWidth
                value={formData.salary}
                onChange={(e) => handleFormChange("salary", e.target.value)}
                sx={fieldSx}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Location"
                fullWidth
                value={formData.location}
                onChange={(e) => handleFormChange("location", e.target.value)}
                sx={fieldSx}
              />
            </Grid>

            <Grid item xs={12} md={6}>
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
            </Grid>

            <Grid item xs={12} md={6}>
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
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Source"
                fullWidth
                value={formData.source}
                onChange={(e) => handleFormChange("source", e.target.value)}
                sx={fieldSx}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Contact Email"
                fullWidth
                value={formData.contact_email}
                onChange={(e) =>
                  handleFormChange("contact_email", e.target.value)
                }
                sx={fieldSx}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Contact Phone"
                fullWidth
                value={formData.contact_phone}
                onChange={(e) =>
                  handleFormChange("contact_phone", e.target.value)
                }
                sx={fieldSx}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_visible}
                    onChange={(e) =>
                      handleFormChange("is_visible", e.target.checked)
                    }
                    sx={{
                      "& .MuiSwitch-switchBase.Mui-checked": {
                        color: "#60a5fa",
                      },
                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                        {
                          backgroundColor: "#2563eb",
                          opacity: 1,
                        },
                      "& .MuiSwitch-track": {
                        backgroundColor: "rgba(255,255,255,0.2)",
                        opacity: 1,
                      },
                    }}
                  />
                }
                label={
                  <Typography sx={{ color: "#fff", fontWeight: 600 }}>
                    Visible to candidates
                  </Typography>
                }
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Description"
                fullWidth
                multiline
                minRows={5}
                value={formData.description}
                onChange={(e) =>
                  handleFormChange("description", e.target.value)
                }
                sx={fieldSx}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={dialogActionsSx}>
          <Button
            onClick={closeForm}
            variant="outlined"
            disabled={saving}
            sx={secondaryBtnSx}
          >
            Cancel
          </Button>

          <Button
            onClick={handleSaveJob}
            variant="contained"
            disabled={saving}
            sx={primaryBtnSx}
          >
            {saving ? "Saving..." : editingJob ? "Save Changes" : "Create Job"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={confirmDialog.open}
        onClose={closeConfirmDialog}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: confirmDialogPaperSx }}
      >
        <DialogTitle sx={confirmDialogTitleSx}>
          {confirmDialog.title || "Confirm Action"}
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          <Typography sx={{ color: "rgba(255,255,255,0.72)", lineHeight: 1.7 }}>
            {confirmDialog.message}
          </Typography>
        </DialogContent>

        <DialogActions sx={dialogActionsSx}>
          <Button
            onClick={closeConfirmDialog}
            variant="outlined"
            sx={secondaryBtnSx}
          >
            Cancel
          </Button>

          <Button
            onClick={handleConfirmAction}
            variant="contained"
            sx={warningBtnSx}
          >
            {confirmDialog.confirmText || "Confirm"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={messageDialog.open}
        onClose={closeMessageDialog}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: confirmDialogPaperSx }}
      >
        <DialogTitle sx={confirmDialogTitleSx}>
          {messageDialog.title || "Notice"}
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          <Typography sx={{ color: "rgba(255,255,255,0.72)", lineHeight: 1.7 }}>
            {messageDialog.message}
          </Typography>
        </DialogContent>

        <DialogActions sx={dialogActionsSx}>
          <Button
            onClick={closeMessageDialog}
            variant="contained"
            sx={primaryBtnSx}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
}

function SimpleDetailItem({
  label,
  value,
  isStatus = false,
  noBorder = false,
}) {
  const statusStyle = STATUS_STYLES[String(value).toLowerCase()] || {
    color: "#cbd5e1",
    bg: "rgba(255,255,255,0.06)",
    border: "rgba(255,255,255,0.10)",
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
        borderBottom: noBorder ? "none" : "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <Typography
        sx={{
          minWidth: { sm: 180 },
          color: "rgba(255,255,255,0.52)",
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
            color: "#f8fafc",
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
  color: "#94a3b8",
  fontWeight: 800,
  fontSize: 12,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  borderBottom: "1px solid rgba(255,255,255,0.08)",
  whiteSpace: "nowrap",
};

const bodyCellSx = {
  color: "#dbe7ff",
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
  color: "#fff",
  borderColor: "rgba(255,255,255,0.10)",
  borderRadius: 2.5,
  textTransform: "none",
};

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    color: "#fff",
    borderRadius: 3,
    backgroundColor: "rgba(15,23,42,0.8)",
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "rgba(255,255,255,0.10)",
  },
  "& .MuiInputLabel-root": {
    color: "rgba(255,255,255,0.7)",
  },
  "& .MuiSvgIcon-root": {
    color: "#fff",
  },
};

function darkFieldSx(minWidth) {
  return {
    minWidth,
    "& .MuiOutlinedInput-root": {
      color: "#fff",
      borderRadius: 3,
      backgroundColor: "rgba(15,23,42,0.85)",
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(255,255,255,0.08)",
    },
    "& .MuiInputBase-input::placeholder": {
      color: "#94a3b8",
      opacity: 1,
    },
    "& .MuiSvgIcon-root": {
      color: "#fff",
    },
  };
}

const topActionBtnSx = {
  color: "#fff",
  borderColor: "rgba(255,255,255,0.12)",
  borderRadius: 3,
  px: 1.6,
  textTransform: "none",
  fontWeight: 700,
  backgroundColor: "rgba(255,255,255,0.03)",
  "&:hover": {
    borderColor: "rgba(255,255,255,0.18)",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
};

const actionIconBtnSx = {
  color: "#dbeafe",
  backgroundColor: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.06)",
  "&:hover": {
    backgroundColor: "rgba(255,255,255,0.08)",
  },
};

const dialogPaperSx = {
  background:
    "linear-gradient(180deg, rgba(15,23,42,0.98) 0%, rgba(9,13,25,0.98) 100%)",
  color: "#fff",
  borderRadius: 4,
  border: "1px solid rgba(255,255,255,0.08)",
  boxShadow: "0 24px 60px rgba(0,0,0,0.45)",
};

const dialogTitleSx = {
  borderBottom: "1px solid rgba(255,255,255,0.08)",
  px: 3,
  py: 2.2,
};

const dialogActionsSx = {
  p: 2,
  borderTop: "1px solid rgba(255,255,255,0.08)",
};

const closeIconSx = {
  color: "#fff",
  backgroundColor: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.06)",
  "&:hover": {
    backgroundColor: "rgba(255,255,255,0.08)",
  },
};

const primaryBtnSx = {
  textTransform: "none",
  fontWeight: 800,
  borderRadius: 3,
  px: 2,
  background: "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)",
  boxShadow: "0 10px 25px rgba(37,99,235,0.25)",
  "&:hover": {
    background: "linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)",
  },
};

const secondaryBtnSx = {
  color: "#fff",
  borderColor: "rgba(255,255,255,0.16)",
  borderRadius: 3,
  textTransform: "none",
  fontWeight: 700,
  "&:hover": {
    borderColor: "rgba(255,255,255,0.22)",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
};

const confirmDialogPaperSx = {
  background:
    "linear-gradient(180deg, rgba(15,23,42,0.98) 0%, rgba(9,13,25,0.98) 100%)",
  color: "#fff",
  borderRadius: 4,
  border: "1px solid rgba(255,255,255,0.10)",
  boxShadow: "0 24px 70px rgba(0,0,0,0.50)",
};

const confirmDialogTitleSx = {
  color: "#fff",
  fontWeight: 900,
  px: 3,
  py: 2.2,
  borderBottom: "1px solid rgba(255,255,255,0.08)",
};

const warningBtnSx = {
  textTransform: "none",
  fontWeight: 800,
  borderRadius: 3,
  px: 2,
  color: "#fff",
  background: "linear-gradient(135deg, #f59e0b 0%, #f97316 100%)",
  boxShadow: "0 10px 25px rgba(249,115,22,0.22)",
  "&:hover": {
    background: "linear-gradient(135deg, #d97706 0%, #ea580c 100%)",
  },
};
