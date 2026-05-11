// This component provides an admin interface for managing candidates. It includes features such as:
// - Displaying a list of candidates with pagination
// - Searching candidates by name, email, phone, role, and a smart search across multiple fields
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
  Divider,
  Avatar,
  Switch,
  FormControlLabel,
  Tooltip,
  Select,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import KeyboardArrowLeftRoundedIcon from "@mui/icons-material/KeyboardArrowLeftRounded";
import KeyboardArrowRightRoundedIcon from "@mui/icons-material/KeyboardArrowRightRounded";
import WorkOutlineRoundedIcon from "@mui/icons-material/WorkOutlineRounded";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";

const API_BASE_URL = "http://localhost:3001";

const STATUS_OPTIONS = [
  "Applied",
  "Contacted",
  "ATS CV Generated",
  "CV Sent",
  "Interview Scheduled",
  "Interviewed",
  "Offer",
  "Hired",
  "Rejected",
  "Waitlist",
];

const emptyForm = {
  date: "",
  full_name: "",
  phone: "",
  email: "",
  interview_showed_up: false,
  vip: false,
  ats_cv_generated: false,
  sold_by: "",
  nationality: "",
  current_position: "",
  candidate_status: "Applied",
  recruitment_status: "Applied",
  recruitment_client: "",
  recruitment_notes: "",
  desired_position: "",
  expected_salary: "",
  plan_type: "",
  payment_screenshot_url: "",
};

const STATUS_STYLES = {
  Applied: {
    color: "#60a5fa",
    bg: "rgba(96,165,250,0.16)",
    border: "rgba(96,165,250,0.34)",
  },
  Contacted: {
    color: "#38bdf8",
    bg: "rgba(56,189,248,0.16)",
    border: "rgba(56,189,248,0.34)",
  },
  "ATS CV Generated": {
    color: "#f472b6",
    bg: "rgba(244,114,182,0.16)",
    border: "rgba(244,114,182,0.34)",
  },
  "CV Sent": {
    color: "#818cf8",
    bg: "rgba(129,140,248,0.16)",
    border: "rgba(129,140,248,0.34)",
  },
  "Interview Scheduled": {
    color: "#fbbf24",
    bg: "rgba(251,191,36,0.16)",
    border: "rgba(251,191,36,0.34)",
  },
  Interviewed: {
    color: "#a78bfa",
    bg: "rgba(167,139,250,0.16)",
    border: "rgba(167,139,250,0.34)",
  },
  Offer: {
    color: "#fb923c",
    bg: "rgba(251,146,60,0.16)",
    border: "rgba(251,146,60,0.34)",
  },
  Hired: {
    color: "#34d399",
    bg: "rgba(52,211,153,0.16)",
    border: "rgba(52,211,153,0.34)",
  },
  Rejected: {
    color: "#f87171",
    bg: "rgba(248,113,113,0.16)",
    border: "rgba(248,113,113,0.34)",
  },
  Waitlist: {
    color: "#c084fc",
    bg: "rgba(192,132,252,0.16)",
    border: "rgba(192,132,252,0.34)",
  },
};

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
    react: ["reactjs", "react.js"],
    reactjs: ["react", "react.js"],
    node: ["nodejs", "node.js"],
    nodejs: ["node", "node.js"],
    frontend: ["front-end", "front end", "ui"],
    backend: ["back-end", "back end", "api"],
    excel: ["microsoft excel", "spreadsheet", "spreadsheets"],
    accounting: ["accounts", "finance", "bookkeeping"],
    finance: ["accounting", "accounts", "bookkeeping"],
    cashier: ["pos", "point of sale", "cash handling"],
    pos: ["point of sale", "cashier", "cash handling"],
    phd: ["doctorate", "doctoral"],
    customer: ["customer service", "client service"],
    sales: ["selling", "business development"],
    hr: ["human resources", "recruitment"],
    admin: ["administration", "administrative"],
    manager: ["management", "supervisor", "leadership"],
    marketing: ["social media", "digital marketing", "content"],
  };

  return [term, ...(synonyms[term] || [])];
}

function buildCandidateSearchText(candidate) {
  return normalizeSearchText(
    [
      candidate.full_name,
      candidate.email,
      candidate.user_email,
      candidate.phone,
      candidate.nationality,
      candidate.current_position,
      candidate.desired_position,
      candidate.candidate_status,
      candidate.sold_by,
      candidate.plan_type,
      candidate.skills,
      candidate.experience,
      candidate.education,
      candidate.summary,
      candidate.linkedin,
      candidate.portfolio,
      candidate.preferred_job_titles,
      candidate.preferred_industries,
      candidate.preferred_job_types,
      candidate.preferred_locations,
      candidate.work_type_preference,
      candidate.availability,
    ].join(" "),
  );
}

function getSmartCandidateSearchResult(candidate, query) {
  const terms = splitSearchTerms(query);

  if (!terms.length) {
    return {
      passed: true,
      score: 0,
      matchedTerms: [],
    };
  }

  const text = buildCandidateSearchText(candidate);
  const skillText = normalizeSearchText(candidate.skills);
  const experienceText = normalizeSearchText(
    `${candidate.experience || ""} ${candidate.summary || ""}`,
  );
  const educationText = normalizeSearchText(candidate.education);
  const preferenceText = normalizeSearchText(
    `${candidate.preferred_job_titles || ""} ${candidate.preferred_industries || ""} ${candidate.preferred_job_types || ""} ${candidate.preferred_locations || ""}`,
  );

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

    if (
      expandedTerms.some((expanded) =>
        skillText.includes(normalizeSearchText(expanded)),
      )
    ) {
      score += 14;
    }

    if (
      expandedTerms.some((expanded) =>
        experienceText.includes(normalizeSearchText(expanded)),
      )
    ) {
      score += 10;
    }

    if (
      expandedTerms.some((expanded) =>
        educationText.includes(normalizeSearchText(expanded)),
      )
    ) {
      score += 10;
    }

    if (
      expandedTerms.some((expanded) =>
        preferenceText.includes(normalizeSearchText(expanded)),
      )
    ) {
      score += 6;
    }
  });

  const directPhrase = normalizeSearchText(query);
  if (directPhrase && text.includes(directPhrase)) {
    score += 25;
  }

  return {
    passed: matchedTerms.length > 0,
    score,
    matchedTerms: Array.from(new Set(matchedTerms)),
  };
}

export default function AdminCandidates() {
  const [candidates, setCandidates] = useState([]);
  const [search, setSearch] = useState("");
  const [smartSearch, setSmartSearch] = useState("");
  const [tab, setTab] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const [editOpen, setEditOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  const [imagePreview, setImagePreview] = useState("");

  const [notice, setNotice] = useState({
    open: false,
    title: "",
    message: "",
    type: "info",
  });

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [candidateToDelete, setCandidateToDelete] = useState(null);

  const rowsPerPage = 20;

  useEffect(() => {
    loadCandidates();

    const interval = setInterval(() => {
      loadCandidates(false);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  async function loadCandidates(showLoader = true) {
    try {
      if (showLoader) setLoading(true);

      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE_URL}/admin/candidates`, {
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch candidates");
      }

      const rows = Array.isArray(data.candidates) ? data.candidates : [];
      setCandidates(rows);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      if (showLoader) setLoading(false);
    }
  }

  function showNotice(title, message, type = "info") {
    setNotice({ open: true, title, message, type });
  }

  function closeNotice() {
    setNotice((prev) => ({ ...prev, open: false }));
  }

  function openDeleteDialog(candidate) {
    if (!candidate?.id) {
      showNotice(
        "Missing Candidate ID",
        "This candidate cannot be deleted because the ID is missing.",
        "error",
      );
      return;
    }

    setCandidateToDelete(candidate);
    setDeleteDialogOpen(true);
  }

  function closeDeleteDialog() {
    if (deletingId) return;
    setDeleteDialogOpen(false);
    setCandidateToDelete(null);
  }

  function getCandidateStatus(candidate) {
    const status =
      candidate?.recruitment_status ||
      candidate?.latest_recruitment_status ||
      candidate?.candidate_status;

    if (status && String(status).trim() !== "") {
      const clean = String(status).trim().toLowerCase();

      if (clean === "applied") return "Applied";
      if (clean === "new") return "Applied";
      if (clean === "interview") return "Interviewed";
      if (clean === "interview scheduled") return "Interview Scheduled";
      if (clean === "hired") return "Hired";
      if (clean === "placed") return "Hired";
      if (clean === "cv sent") return "CV Sent";
      if (clean === "on hold") return "Waitlist";
      if (clean === "rejected") return "Rejected";

      return status;
    }

    if (candidate?.interview_showed_up === true) {
      return "Interviewed";
    }

    return "Applied";
  }

  function getRecruitmentClient(candidate) {
    return (
      candidate?.recruitment_client ||
      candidate?.client_name ||
      candidate?.sold_by ||
      ""
    );
  }

  function getRecruitmentNotes(candidate) {
    return candidate?.recruitment_notes || "";
  }

  function formatDate(value) {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleDateString();
  }

  function DetailRow({ label, value, isStatus = false }) {
    const statusStyle = STATUS_STYLES[value] || {
      color: "#cbd5e1",
      bg: "rgba(255,255,255,0.06)",
      border: "rgba(255,255,255,0.08)",
    };

    return (
      <Box
        sx={{
          px: 2,
          py: 1.8,
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          borderRight: { xs: "none", md: "1px solid rgba(255,255,255,0.08)" },
          backgroundColor: "transparent",
        }}
      >
        <Typography
          sx={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.48)",
            mb: 0.8,
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
            }}
          />
        ) : (
          <Typography
            sx={{
              color: "#f8fafc",
              fontWeight: 500,
              fontSize: 15,
              wordBreak: "break-word",
              lineHeight: 1.5,
            }}
          >
            {value || "-"}
          </Typography>
        )}
      </Box>
    );
  }

  const filteredCandidates = useMemo(() => {
    let rows = candidates.map((candidate) => {
      const smart = getSmartCandidateSearchResult(candidate, smartSearch);

      return {
        ...candidate,
        smart_search_score: smart.score,
        smart_search_terms: smart.matchedTerms,
        smart_search_passed: smart.passed,
      };
    });

    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter((candidate) =>
        [
          candidate.full_name,
          candidate.email,
          candidate.user_email,
          candidate.phone,
          candidate.nationality,
          candidate.current_position,
          candidate.desired_position,
          candidate.sold_by,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(q)),
      );
    }

    if (smartSearch.trim()) {
      rows = rows.filter((candidate) => candidate.smart_search_passed);
    }

    if (tab !== "all") {
      rows = rows.filter(
        (candidate) => getCandidateStatus(candidate).toLowerCase() === tab,
      );
    }

    if (smartSearch.trim()) {
      rows.sort(
        (a, b) =>
          Number(b.smart_search_score || 0) - Number(a.smart_search_score || 0),
      );
    } else if (sortBy === "a-z") {
      rows.sort((a, b) => (a.full_name || "").localeCompare(b.full_name || ""));
    } else if (sortBy === "z-a") {
      rows.sort((a, b) => (b.full_name || "").localeCompare(a.full_name || ""));
    } else if (sortBy === "oldest") {
      rows.sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
    } else {
      rows.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
    }

    return rows;
  }, [candidates, search, smartSearch, tab, sortBy]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCandidates.length / rowsPerPage),
  );

  const paginatedCandidates = filteredCandidates.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage,
  );

  useEffect(() => {
    setPage(1);
  }, [search, smartSearch, tab, sortBy]);

  const visiblePages = useMemo(() => {
    const pages = [];
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, page + 2);

    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }, [page, totalPages]);

  const tabButtons = [
    { label: "All", value: "all" },
    { label: "Applied", value: "applied" },
    { label: "Contacted", value: "contacted" },
    { label: "ATS CV", value: "ats cv generated" },
    { label: "CV Sent", value: "cv sent" },
    { label: "Interview", value: "interview scheduled" },
    { label: "Offer", value: "offer" },
    { label: "Hired", value: "hired" },
    { label: "Rejected", value: "rejected" },
    { label: "Waitlist", value: "waitlist" },
  ];

  function openDetails(candidate) {
    setSelectedCandidate(candidate);
    setDetailsOpen(true);
  }

  function closeDetails() {
    setSelectedCandidate(null);
    setDetailsOpen(false);
  }

  function openEdit(candidate) {
    setEditingCandidate(candidate);
    setFormData({
      date: candidate.date ? String(candidate.date).slice(0, 10) : "",
      full_name: candidate.full_name || "",
      phone: candidate.phone || "",
      email: candidate.email || "",
      interview_showed_up: Boolean(candidate.interview_showed_up),
      vip: Boolean(candidate.vip),
      ats_cv_generated: Boolean(candidate.ats_cv_generated),
      sold_by: candidate.sold_by || "",
      nationality: candidate.nationality || "",
      current_position: candidate.current_position || "",
      candidate_status: getCandidateStatus(candidate),
      recruitment_status: getCandidateStatus(candidate),
      recruitment_client: getRecruitmentClient(candidate),
      recruitment_notes: getRecruitmentNotes(candidate),
      desired_position: candidate.desired_position || "",
      expected_salary:
        candidate.expected_salary !== null &&
        candidate.expected_salary !== undefined
          ? String(candidate.expected_salary)
          : "",
      plan_type: candidate.plan_type || "",
      payment_screenshot_url: candidate.payment_screenshot_url || "",
    });
    setImagePreview(candidate.payment_screenshot_url || "");
    setEditOpen(true);
  }

  function closeEdit() {
    if (saving) return;
    setEditOpen(false);
    setEditingCandidate(null);
    setFormData(emptyForm);
    setImagePreview("");
  }

  function handleFormChange(field, value) {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function SimpleDetailItem({
    label,
    value,
    isStatus = false,
    noBorder = false,
  }) {
    const statusStyle = STATUS_STYLES[value] || {
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

  function handleImagePick(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);

    setFormData((prev) => ({
      ...prev,
      payment_screenshot_url: file.name,
    }));
  }

  async function saveRecruitmentTrack(candidateId, payload) {
    const token = localStorage.getItem("token");

    const res = await fetch(
      `${API_BASE_URL}/api/admin/candidates/${candidateId}/recruitment-track`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      },
    );

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.error || "Failed to save recruitment track");
    }

    return data;
  }

  async function handleSaveEdit() {
    if (!editingCandidate?.id) {
      showNotice(
        "Missing Candidate ID",
        "This candidate cannot be updated because the ID is missing.",
        "error",
      );
      return;
    }

    try {
      setSaving(true);

      const payload = {
        ...formData,
        expected_salary:
          formData.expected_salary === ""
            ? null
            : Number(formData.expected_salary),
      };

      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_BASE_URL}/admin/candidates/${editingCandidate.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update candidate");
      }

      await saveRecruitmentTrack(editingCandidate.id, {
        status:
          formData.recruitment_status || formData.candidate_status || "Applied",
        client_name: formData.recruitment_client || formData.sold_by || null,
        notes: formData.recruitment_notes || null,
      });

      await loadCandidates(false);

      if (selectedCandidate?.id === editingCandidate.id) {
        setSelectedCandidate(data.candidate || null);
      }

      closeEdit();
      showNotice(
        "Candidate Updated",
        "The candidate information was saved successfully.",
        "success",
      );
    } catch (err) {
      console.error(err);
      showNotice(
        "Update Failed",
        err.message || "Failed to update candidate.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!candidateToDelete?.id) {
      showNotice(
        "Missing Candidate ID",
        "This candidate cannot be deleted because the ID is missing.",
        "error",
      );
      return;
    }

    try {
      setDeletingId(candidateToDelete.id);

      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_BASE_URL}/admin/candidates/${candidateToDelete.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete candidate");
      }

      await loadCandidates(false);

      if (selectedCandidate?.id === candidateToDelete.id) closeDetails();
      if (editingCandidate?.id === candidateToDelete.id) closeEdit();

      closeDeleteDialog();
      showNotice(
        "Candidate Deleted",
        "The candidate was deleted successfully.",
        "success",
      );
    } catch (err) {
      console.error(err);
      showNotice(
        "Delete Failed",
        err.message || "Failed to delete candidate.",
        "error",
      );
    } finally {
      setDeletingId(null);
    }
  }

  async function handleInlineStatusChange(candidate, newStatus) {
    if (!candidate?.id) {
      showNotice(
        "Missing Candidate ID",
        "This candidate cannot be updated because the ID is missing.",
        "error",
      );
      return;
    }

    try {
      setUpdatingStatusId(candidate.id);

      const data = await saveRecruitmentTrack(candidate.id, {
        status: newStatus,
        client_name: getRecruitmentClient(candidate) || null,
        notes: getRecruitmentNotes(candidate) || null,
      });

      const updatedTrack = data.track || {};

      setCandidates((prev) =>
        prev.map((item) =>
          item.id === candidate.id
            ? {
                ...item,
                recruitment_status: updatedTrack.status || newStatus,
                latest_recruitment_status: updatedTrack.status || newStatus,
                recruitment_client:
                  updatedTrack.client_name || getRecruitmentClient(item),
                client_name:
                  updatedTrack.client_name || getRecruitmentClient(item),
                recruitment_notes:
                  updatedTrack.notes || getRecruitmentNotes(item),
              }
            : item,
        ),
      );

      if (selectedCandidate?.id === candidate.id) {
        setSelectedCandidate((prev) =>
          prev
            ? {
                ...prev,
                recruitment_status: updatedTrack.status || newStatus,
                latest_recruitment_status: updatedTrack.status || newStatus,
                recruitment_client:
                  updatedTrack.client_name || getRecruitmentClient(prev),
                client_name:
                  updatedTrack.client_name || getRecruitmentClient(prev),
                recruitment_notes:
                  updatedTrack.notes || getRecruitmentNotes(prev),
              }
            : prev,
        );
      }

      showNotice(
        "Recruitment Status Updated",
        "The internal recruitment progress was saved.",
        "success",
      );
    } catch (err) {
      console.error(err);
      showNotice(
        "Status Update Failed",
        err.message || "Failed to update recruitment status.",
        "error",
      );
    } finally {
      setUpdatingStatusId(null);
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
        <Box
          sx={{
            maxWidth: "1600px",
            mx: "auto",
          }}
        >
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
                  Candidates
                </Typography>
                <Typography sx={{ color: "rgba(255,255,255,0.65)", mt: 0.75 }}>
                  Search and manage candidates with smart keyword filtering
                </Typography>
              </Box>

              <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
                <TextField
                  placeholder="Search name, email, phone, role..."
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
                  onClick={() => loadCandidates()}
                  startIcon={<RefreshRoundedIcon />}
                  variant="outlined"
                  sx={topActionBtnSx}
                >
                  Refresh
                </Button>
              </Stack>
            </Stack>

            <Paper
              elevation={0}
              sx={{
                p: { xs: 1.6, md: 2 },
                mb: 2.5,
                borderRadius: 4,
                background:
                  "linear-gradient(135deg, rgba(37,99,235,0.14) 0%, rgba(99,102,241,0.10) 100%)",
                border: "1px solid rgba(96,165,250,0.18)",
              }}
            >
              <Stack spacing={1}>
                <Typography sx={{ color: "#fff", fontWeight: 900 }}>
                  Smart candidate search
                </Typography>
                <Typography
                  sx={{ color: "rgba(255,255,255,0.65)", fontSize: 13 }}
                >
                  Search across skills, experience, education, summary,
                  preferences, and profile data. Try: Excel accounting, POS
                  cashier, JavaScript React, PhD education, customer service.
                </Typography>

                <TextField
                  fullWidth
                  placeholder="Example: Excel accounting POS system"
                  value={smartSearch}
                  onChange={(e) => setSmartSearch(e.target.value)}
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: "#94a3b8" }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={darkFieldSx("100%")}
                />
              </Stack>
            </Paper>

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

              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                <Chip
                  label={`Total records: ${filteredCandidates.length}`}
                  sx={{
                    alignSelf: { xs: "flex-start", md: "center" },
                    color: "#cbd5e1",
                    backgroundColor: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 999,
                    fontWeight: 700,
                  }}
                />
                {smartSearch.trim() && (
                  <Chip
                    label="Sorted by smart relevance"
                    sx={{
                      alignSelf: { xs: "flex-start", md: "center" },
                      color: "#93c5fd",
                      backgroundColor: "rgba(59,130,246,0.12)",
                      border: "1px solid rgba(59,130,246,0.22)",
                      borderRadius: 999,
                      fontWeight: 700,
                    }}
                  />
                )}
              </Stack>
            </Stack>

            <TableContainer
              component={Paper}
              elevation={0}
              sx={{
                background: "rgba(2,6,23,0.76)",
                borderRadius: 4,
                overflow: "auto",
                border: "1px solid rgba(148,163,184,0.10)",
              }}
            >
              <Table sx={{ minWidth: 1280, tableLayout: "fixed" }}>
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
                    <TableCell sx={{ ...headCellSx, width: "26%" }}>
                      Candidate
                    </TableCell>
                    <TableCell sx={{ ...headCellSx, width: "20%" }}>
                      Contact
                    </TableCell>
                    <TableCell sx={{ ...headCellSx, width: "14%" }}>
                      Role
                    </TableCell>
                    <TableCell sx={{ ...headCellSx, width: "12%" }}>
                      Recruitment
                    </TableCell>
                    <TableCell sx={{ ...headCellSx, width: "8%" }}>
                      VIP
                    </TableCell>
                    <TableCell sx={{ ...headCellSx, width: "10%" }}>
                      Client
                    </TableCell>
                    <TableCell sx={{ ...headCellSx, width: "10%" }}>
                      Date
                    </TableCell>
                    <TableCell
                      sx={{ ...headCellSx, width: "10%" }}
                      align="right"
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {paginatedCandidates.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        sx={{
                          color: "#94a3b8",
                          textAlign: "center",
                          py: 6,
                          borderBottom: "none",
                        }}
                      >
                        {loading ? "Loading..." : "No candidates found."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedCandidates.map((candidate, index) => {
                      const status = getCandidateStatus(candidate);
                      const statusStyle =
                        STATUS_STYLES[status] || STATUS_STYLES.Applied;

                      return (
                        <TableRow
                          key={`${candidate.id || candidate.email || candidate.phone || "candidate"}-${index}`}
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
                          <TableCell sx={{ ...bodyCellSx, width: "26%" }}>
                            <Stack
                              direction="row"
                              spacing={1.5}
                              alignItems="center"
                            >
                              <Avatar
                                sx={{
                                  width: 42,
                                  height: 42,
                                  background:
                                    "linear-gradient(135deg, rgba(37,99,235,0.85), rgba(99,102,241,0.85))",
                                  color: "#fff",
                                  fontWeight: 700,
                                  flexShrink: 0,
                                }}
                              >
                                {(candidate.full_name || "C")
                                  .charAt(0)
                                  .toUpperCase()}
                              </Avatar>

                              <Box sx={{ minWidth: 0 }}>
                                <Typography
                                  onClick={() => openDetails(candidate)}
                                  sx={{
                                    cursor: "pointer",
                                    fontWeight: 700,
                                    color: "#e2e8f0",
                                    transition: "0.15s ease",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    "&:hover": {
                                      color: "#60a5fa",
                                    },
                                  }}
                                >
                                  {candidate.full_name || "-"}
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
                                  {candidate.nationality || "No nationality"}
                                </Typography>

                                {smartSearch.trim() &&
                                  Array.isArray(candidate.smart_search_terms) &&
                                  candidate.smart_search_terms.length > 0 && (
                                    <Stack
                                      direction="row"
                                      spacing={0.5}
                                      useFlexGap
                                      flexWrap="wrap"
                                      sx={{ mt: 0.8 }}
                                    >
                                      {candidate.smart_search_terms
                                        .slice(0, 3)
                                        .map((term) => (
                                          <Chip
                                            key={term}
                                            label={term}
                                            size="small"
                                            sx={{
                                              height: 22,
                                              color: "#93c5fd",
                                              backgroundColor:
                                                "rgba(59,130,246,0.12)",
                                              border:
                                                "1px solid rgba(59,130,246,0.22)",
                                              fontSize: 11,
                                              fontWeight: 700,
                                            }}
                                          />
                                        ))}
                                    </Stack>
                                  )}
                              </Box>
                            </Stack>
                          </TableCell>

                          <TableCell sx={{ ...bodyCellSx, width: "20%" }}>
                            <Stack spacing={0.7} sx={{ minWidth: 0 }}>
                              <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                                sx={{ minWidth: 0 }}
                              >
                                <EmailOutlinedIcon
                                  sx={{
                                    fontSize: 16,
                                    color: "#7dd3fc",
                                    flexShrink: 0,
                                  }}
                                />
                                <Typography
                                  sx={{
                                    ...cellSmallTextSx,
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                >
                                  {candidate.email || "-"}
                                </Typography>
                              </Stack>

                              <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                                sx={{ minWidth: 0 }}
                              >
                                <PhoneOutlinedIcon
                                  sx={{
                                    fontSize: 16,
                                    color: "#93c5fd",
                                    flexShrink: 0,
                                  }}
                                />
                                <Typography
                                  sx={{
                                    ...cellSmallTextSx,
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                >
                                  {candidate.phone || "-"}
                                </Typography>
                              </Stack>
                            </Stack>
                          </TableCell>

                          <TableCell sx={{ ...bodyCellSx, width: "14%" }}>
                            <Stack spacing={0.5} sx={{ minWidth: 0 }}>
                              <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                                sx={{ minWidth: 0 }}
                              >
                                <WorkOutlineRoundedIcon
                                  sx={{
                                    fontSize: 16,
                                    color: "#94a3b8",
                                    flexShrink: 0,
                                  }}
                                />
                                <Typography
                                  sx={{
                                    color: "#e2e8f0",
                                    fontWeight: 600,
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                >
                                  {candidate.desired_position || "-"}
                                </Typography>
                              </Stack>

                              <Typography
                                sx={{
                                  color: "#8fa2c4",
                                  fontSize: 12.5,
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                Current: {candidate.current_position || "-"}
                              </Typography>
                            </Stack>
                          </TableCell>

                          <TableCell sx={{ width: "12%", minWidth: 150 }}>
                            <Select
                              size="small"
                              value={status}
                              disabled={updatingStatusId === candidate.id}
                              onChange={(e) =>
                                handleInlineStatusChange(
                                  candidate,
                                  e.target.value,
                                )
                              }
                              sx={{
                                minWidth: 135,
                                maxWidth: "100%",
                                borderRadius: 999,
                                color: statusStyle.color,
                                fontWeight: 700,
                                backgroundColor: statusStyle.bg,
                                border: `1px solid ${statusStyle.border}`,
                                "& .MuiOutlinedInput-notchedOutline": {
                                  border: "none",
                                },
                                "& .MuiSvgIcon-root": {
                                  color: statusStyle.color,
                                },
                                "&:hover": {
                                  backgroundColor: statusStyle.bg,
                                },
                              }}
                            >
                              {STATUS_OPTIONS.map((option) => (
                                <MenuItem key={option} value={option}>
                                  {option}
                                </MenuItem>
                              ))}
                            </Select>
                          </TableCell>

                          <TableCell sx={{ ...bodyCellSx, width: "8%" }}>
                            <Chip
                              icon={
                                candidate.vip ? (
                                  <StarRoundedIcon
                                    sx={{ fontSize: "16px !important" }}
                                  />
                                ) : undefined
                              }
                              label={candidate.vip ? "VIP" : "No"}
                              size="small"
                              sx={{
                                borderRadius: 999,
                                fontWeight: 700,
                                color: candidate.vip ? "#fbbf24" : "#cbd5e1",
                                backgroundColor: candidate.vip
                                  ? "rgba(251,191,36,0.14)"
                                  : "rgba(255,255,255,0.06)",
                                border: `1px solid ${
                                  candidate.vip
                                    ? "rgba(251,191,36,0.25)"
                                    : "rgba(255,255,255,0.08)"
                                }`,
                              }}
                            />
                          </TableCell>

                          <TableCell sx={{ ...bodyCellSx, width: "10%" }}>
                            <Typography
                              sx={{
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {getRecruitmentClient(candidate) || "-"}
                            </Typography>
                          </TableCell>

                          <TableCell sx={{ ...bodyCellSx, width: "10%" }}>
                            <Typography
                              sx={{
                                whiteSpace: "nowrap",
                              }}
                            >
                              {formatDate(candidate.date)}
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
                                  onClick={() => openEdit(candidate)}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>

                              <Tooltip title="Delete">
                                <IconButton
                                  size="small"
                                  sx={{
                                    ...actionIconBtnSx,
                                    color: "#f87171",
                                  }}
                                  disabled={deletingId === candidate.id}
                                  onClick={() => openDeleteDialog(candidate)}
                                >
                                  <DeleteOutlineIcon fontSize="small" />
                                </IconButton>
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
                {filteredCandidates.length === 0
                  ? 0
                  : (page - 1) * rowsPerPage + 1}
                -{Math.min(page * rowsPerPage, filteredCandidates.length)} of{" "}
                {filteredCandidates.length}
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
        PaperProps={{
          sx: dialogPaperSx,
        }}
      >
        {/* <DialogTitle sx={dialogTitleSx}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar
                sx={{
                  width: 52,
                  height: 52,
                  background:
                    "linear-gradient(135deg, rgba(37,99,235,0.95), rgba(99,102,241,0.95))",
                }}
              >
                {(selectedCandidate?.full_name || "C").charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight={800} color="#fff">
                  {selectedCandidate?.full_name || "Candidate Details"}
                </Typography>
                <Typography sx={{ color: "rgba(255,255,255,0.62)", mt: 0.3 }}>
                  Full candidate information
                </Typography>
              </Box>
            </Stack>

            <IconButton onClick={closeDetails} sx={closeIconSx}>
              <CloseRoundedIcon />
            </IconButton>
          </Stack>
        </DialogTitle> */}

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
              {selectedCandidate?.full_name || "Candidate Details"}
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.55)", mt: 0.4 }}>
              Candidate information
            </Typography>
          </Box>

          <IconButton onClick={closeDetails} sx={{ color: "#fff" }}>
            <CloseRoundedIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 2.5, px: 0 }}>
          {selectedCandidate && (
            <Box sx={{ px: 3, pb: 1 }}>
              <Box
                sx={{
                  borderTop: "1px solid rgba(255,255,255,0.08)",
                  borderBottom: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <SimpleDetailItem
                  label="Full Name"
                  value={selectedCandidate.full_name}
                />
                <SimpleDetailItem
                  label="Email"
                  value={selectedCandidate.email}
                />
                <SimpleDetailItem
                  label="Phone"
                  value={selectedCandidate.phone}
                />
                <SimpleDetailItem
                  label="Recruitment Status"
                  value={getCandidateStatus(selectedCandidate)}
                  isStatus
                />
                <SimpleDetailItem
                  label="Nationality"
                  value={selectedCandidate.nationality}
                />
                <SimpleDetailItem
                  label="Current Position"
                  value={selectedCandidate.current_position}
                />
                <SimpleDetailItem
                  label="Desired Position"
                  value={selectedCandidate.desired_position}
                />
                <SimpleDetailItem
                  label="Expected Salary"
                  value={selectedCandidate.expected_salary}
                />
                <SimpleDetailItem
                  label="Plan Type"
                  value={selectedCandidate.plan_type}
                />
                <SimpleDetailItem
                  label="Client / Company"
                  value={selectedCandidate.sold_by}
                />
                <SimpleDetailItem
                  label="Interview Showed Up"
                  value={selectedCandidate.interview_showed_up ? "Yes" : "No"}
                />
                <SimpleDetailItem
                  label="VIP"
                  value={selectedCandidate.vip ? "Yes" : "No"}
                />
                <SimpleDetailItem
                  label="Date"
                  value={formatDate(selectedCandidate.date)}
                />
                <SimpleDetailItem
                  label="Skills"
                  value={selectedCandidate.skills}
                />
                <SimpleDetailItem
                  label="Experience"
                  value={selectedCandidate.experience}
                />
                <SimpleDetailItem
                  label="Education"
                  value={selectedCandidate.education}
                />
                <SimpleDetailItem
                  label="Summary"
                  value={selectedCandidate.summary}
                />
                <SimpleDetailItem
                  label="Preferred Job Titles"
                  value={selectedCandidate.preferred_job_titles}
                />
                <SimpleDetailItem
                  label="Preferred Locations"
                  value={selectedCandidate.preferred_locations}
                />
                <SimpleDetailItem
                  label="Payment Screenshot"
                  value={selectedCandidate.payment_screenshot_url}
                  noBorder
                />
              </Box>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.2}
                sx={{ mt: 2 }}
              >
                <Button
                  variant="contained"
                  disabled={!selectedCandidate.cv_url}
                  onClick={() =>
                    window.open(
                      selectedCandidate.cv_url,
                      "_blank",
                      "noreferrer",
                    )
                  }
                  sx={primaryBtnSx}
                >
                  Open CV
                </Button>
                <Button
                  variant="outlined"
                  disabled={!selectedCandidate.linkedin}
                  onClick={() =>
                    window.open(
                      selectedCandidate.linkedin,
                      "_blank",
                      "noreferrer",
                    )
                  }
                  sx={secondaryBtnSx}
                >
                  LinkedIn
                </Button>
                <Button
                  variant="outlined"
                  disabled={!selectedCandidate.portfolio}
                  onClick={() =>
                    window.open(
                      selectedCandidate.portfolio,
                      "_blank",
                      "noreferrer",
                    )
                  }
                  sx={secondaryBtnSx}
                >
                  Portfolio
                </Button>
              </Stack>
            </Box>
          )}
        </DialogContent>

        {/* <DialogContent sx={{ pt: 3 }}>
          {selectedCandidate && (
            <>
              <Box sx={heroInfoCardSx}>
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  spacing={2}
                  justifyContent="space-between"
                >
                  <Stack spacing={1}>
                    <Chip
                      label={getCandidateStatus(selectedCandidate)}
                      sx={{
                        alignSelf: "flex-start",
                        borderRadius: 999,
                        fontWeight: 700,
                        color:
                          STATUS_STYLES[getCandidateStatus(selectedCandidate)]?.color || "#60a5fa",
                        backgroundColor:
                          STATUS_STYLES[getCandidateStatus(selectedCandidate)]?.bg ||
                          "rgba(96,165,250,0.16)",
                        border: `1px solid ${
                          STATUS_STYLES[getCandidateStatus(selectedCandidate)]?.border ||
                          "rgba(96,165,250,0.28)"
                        }`,
                      }}
                    />
                    <Typography sx={{ color: "#cbd5e1" }}>
                      {selectedCandidate.desired_position || "No desired position"}
                    </Typography>
                  </Stack>

                  <Stack spacing={1} alignItems={{ xs: "flex-start", md: "flex-end" }}>
                    <Chip
                      label={selectedCandidate.vip ? "VIP Candidate" : "Standard Candidate"}
                      sx={{
                        borderRadius: 999,
                        fontWeight: 700,
                        color: selectedCandidate.vip ? "#fbbf24" : "#cbd5e1",
                        backgroundColor: selectedCandidate.vip
                          ? "rgba(251,191,36,0.14)"
                          : "rgba(255,255,255,0.06)",
                        border: `1px solid ${
                          selectedCandidate.vip
                            ? "rgba(251,191,36,0.25)"
                            : "rgba(255,255,255,0.08)"
                        }`,
                      }}
                    />
                    <Typography sx={{ color: "#8fa2c4", fontSize: 13 }}>
                      Added on {formatDate(selectedCandidate.date)}
                    </Typography>
                  </Stack>
                </Stack>
              </Box>

              <Grid container spacing={2.2}>
                <Grid item xs={12} md={6}>
                  <InfoCard
                    icon={<PersonOutlineRoundedIcon />}
                    label="Full Name"
                    value={selectedCandidate.full_name}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <InfoCard
                    icon={<EmailOutlinedIcon />}
                    label="Email"
                    value={selectedCandidate.email}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <InfoCard
                    icon={<PhoneOutlinedIcon />}
                    label="Phone"
                    value={selectedCandidate.phone}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <InfoCard
                    icon={<WorkOutlineRoundedIcon />}
                    label="Current Position"
                    value={selectedCandidate.current_position}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <InfoCard label="Nationality" value={selectedCandidate.nationality} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <InfoCard
                    label="Desired Position"
                    value={selectedCandidate.desired_position}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <InfoCard
                    label="Expected Salary"
                    value={selectedCandidate.expected_salary}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <InfoCard label="Plan Type" value={selectedCandidate.plan_type} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <InfoCard
                    label="Interview Showed Up"
                    value={selectedCandidate.interview_showed_up ? "Yes" : "No"}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <InfoCard label="VIP" value={selectedCandidate.vip ? "Yes" : "No"} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <InfoCard
                    label="ATS CV Generated"
                    value={selectedCandidate.ats_cv_generated ? "Yes" : "No"}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <InfoCard label="Client / Company" value={selectedCandidate.sold_by} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <InfoCard label="Date" value={formatDate(selectedCandidate.date)} />
                </Grid>
                <Grid item xs={12}>
                  <InfoCard
                    label="Payment Screenshot"
                    value={selectedCandidate.payment_screenshot_url}
                  />
                </Grid>
              </Grid>
            </>
          )}
        </DialogContent> */}

        <DialogActions sx={dialogActionsSx}>
          {selectedCandidate && (
            <>
              <Button
                onClick={() => openEdit(selectedCandidate)}
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
        PaperProps={{
          sx: dialogPaperSx,
        }}
      >
        <DialogTitle sx={dialogTitleSx}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography variant="h5" fontWeight={800} color="#fff">
                Edit Candidate
              </Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.62)", mt: 0.3 }}>
                Cleaner fields and smoother toggle controls
              </Typography>
            </Box>

            <IconButton onClick={closeEdit} sx={closeIconSx}>
              <CloseRoundedIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Full Name"
                fullWidth
                value={formData.full_name}
                onChange={(e) => handleFormChange("full_name", e.target.value)}
                sx={fieldSx}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Email"
                fullWidth
                value={formData.email}
                onChange={(e) => handleFormChange("email", e.target.value)}
                sx={fieldSx}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Phone"
                fullWidth
                value={formData.phone}
                onChange={(e) => handleFormChange("phone", e.target.value)}
                sx={fieldSx}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Date"
                type="date"
                fullWidth
                value={formData.date}
                onChange={(e) => handleFormChange("date", e.target.value)}
                sx={fieldSx}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Client / Company"
                fullWidth
                value={formData.sold_by}
                onChange={(e) => handleFormChange("sold_by", e.target.value)}
                sx={fieldSx}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Nationality"
                fullWidth
                value={formData.nationality}
                onChange={(e) =>
                  handleFormChange("nationality", e.target.value)
                }
                sx={fieldSx}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Current Position"
                fullWidth
                value={formData.current_position}
                onChange={(e) =>
                  handleFormChange("current_position", e.target.value)
                }
                sx={fieldSx}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Desired Position"
                fullWidth
                value={formData.desired_position}
                onChange={(e) =>
                  handleFormChange("desired_position", e.target.value)
                }
                sx={fieldSx}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Expected Salary"
                type="number"
                fullWidth
                value={formData.expected_salary}
                onChange={(e) =>
                  handleFormChange("expected_salary", e.target.value)
                }
                sx={fieldSx}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Plan Type"
                fullWidth
                value={formData.plan_type}
                onChange={(e) => handleFormChange("plan_type", e.target.value)}
                sx={fieldSx}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                select
                label="Recruitment Status"
                fullWidth
                value={formData.recruitment_status || formData.candidate_status}
                onChange={(e) => {
                  handleFormChange("recruitment_status", e.target.value);
                  handleFormChange("candidate_status", e.target.value);
                }}
                sx={fieldSx}
              >
                {STATUS_OPTIONS.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Recruitment Notes"
                fullWidth
                multiline
                minRows={3}
                value={formData.recruitment_notes}
                onChange={(e) =>
                  handleFormChange("recruitment_notes", e.target.value)
                }
                sx={fieldSx}
                placeholder="Example: CV sent to Apple HR. Waiting for interview confirmation."
              />
            </Grid>

            <Grid item xs={12}>
              <Divider
                sx={{ borderColor: "rgba(255,255,255,0.08)", my: 0.5 }}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography
                sx={{
                  color: "#e2e8f0",
                  fontWeight: 800,
                  mb: 1.25,
                  fontSize: 15,
                }}
              >
                Candidate Flags
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <ToggleCard
                title="Interview Showed Up"
                checked={formData.interview_showed_up}
                onChange={(checked) =>
                  handleFormChange("interview_showed_up", checked)
                }
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <ToggleCard
                title="VIP"
                checked={formData.vip}
                onChange={(checked) => handleFormChange("vip", checked)}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <ToggleCard
                title="ATS CV Generated"
                checked={formData.ats_cv_generated}
                onChange={(checked) =>
                  handleFormChange("ats_cv_generated", checked)
                }
              />
            </Grid>

            <Grid item xs={12}>
              <Divider
                sx={{ borderColor: "rgba(255,255,255,0.08)", my: 0.5 }}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography sx={{ color: "#fff", fontWeight: 800, mb: 1.25 }}>
                Payment Screenshot
              </Typography>

              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={2}
                alignItems="flex-start"
              >
                <Button
                  variant="outlined"
                  component="label"
                  sx={secondaryBtnSx}
                >
                  Browse Image
                  <input
                    hidden
                    type="file"
                    accept="image/*"
                    onChange={handleImagePick}
                  />
                </Button>

                <TextField
                  label="Or paste image URL"
                  fullWidth
                  value={formData.payment_screenshot_url}
                  onChange={(e) =>
                    handleFormChange("payment_screenshot_url", e.target.value)
                  }
                  sx={fieldSx}
                />
              </Stack>

              {(imagePreview || formData.payment_screenshot_url) && (
                <Box sx={imagePreviewWrapSx}>
                  <Typography sx={{ color: "rgba(255,255,255,0.65)", mb: 1 }}>
                    Preview
                  </Typography>

                  {imagePreview ? (
                    <Box
                      component="img"
                      src={imagePreview}
                      alt="Payment screenshot preview"
                      sx={{
                        width: 220,
                        maxWidth: "100%",
                        borderRadius: 2.5,
                        display: "block",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                    />
                  ) : (
                    <Typography
                      sx={{ color: "#93c5fd", wordBreak: "break-all" }}
                    >
                      {formData.payment_screenshot_url}
                    </Typography>
                  )}
                </Box>
              )}
            </Grid>
          </Grid>
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
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: popupPaperSx }}
      >
        <DialogTitle sx={popupTitleSx}>Delete Candidate?</DialogTitle>

        <DialogContent sx={{ px: 3, pb: 1 }}>
          <Typography sx={{ color: "rgba(255,255,255,0.72)", lineHeight: 1.7 }}>
            Are you sure you want to delete{" "}
            <Box component="span" sx={{ color: "#fff", fontWeight: 800 }}>
              {candidateToDelete?.full_name || "this candidate"}
            </Box>
            ? This action cannot be undone.
          </Typography>
        </DialogContent>

        <DialogActions sx={popupActionsSx}>
          <Button
            onClick={closeDeleteDialog}
            variant="outlined"
            disabled={Boolean(deletingId)}
            sx={secondaryBtnSx}
          >
            Cancel
          </Button>

          <Button
            onClick={handleDelete}
            variant="contained"
            disabled={Boolean(deletingId)}
            sx={dangerBtnSx}
          >
            {deletingId ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={notice.open}
        onClose={closeNotice}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: popupPaperSx }}
      >
        <DialogTitle sx={popupTitleSx}>{notice.title}</DialogTitle>

        <DialogContent sx={{ px: 3, pb: 1 }}>
          <Box
            sx={{
              p: 2,
              borderRadius: 3,
              backgroundColor:
                notice.type === "success"
                  ? "rgba(52,211,153,0.12)"
                  : notice.type === "error"
                    ? "rgba(248,113,113,0.12)"
                    : "rgba(96,165,250,0.12)",
              border:
                notice.type === "success"
                  ? "1px solid rgba(52,211,153,0.24)"
                  : notice.type === "error"
                    ? "1px solid rgba(248,113,113,0.24)"
                    : "1px solid rgba(96,165,250,0.24)",
            }}
          >
            <Typography
              sx={{ color: "rgba(255,255,255,0.82)", lineHeight: 1.7 }}
            >
              {notice.message}
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions sx={popupActionsSx}>
          <Button onClick={closeNotice} variant="contained" sx={primaryBtnSx}>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
}

function ToggleCard({ title, checked, onChange }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.6,
        borderRadius: 3,
        background: checked
          ? "linear-gradient(180deg, rgba(37,99,235,0.16) 0%, rgba(37,99,235,0.08) 100%)"
          : "rgba(255,255,255,0.03)",
        border: checked
          ? "1px solid rgba(59,130,246,0.28)"
          : "1px solid rgba(255,255,255,0.08)",
        transition: "all 0.18s ease",
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>
            {title}
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.58)", fontSize: 12 }}>
            {checked ? "Enabled" : "Disabled"}
          </Typography>
        </Box>

        <Switch
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          sx={{
            "& .MuiSwitch-switchBase.Mui-checked": {
              color: "#60a5fa",
            },
            "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
              backgroundColor: "#2563eb",
              opacity: 1,
            },
            "& .MuiSwitch-track": {
              backgroundColor: "rgba(255,255,255,0.2)",
              opacity: 1,
            },
          }}
        />
      </Stack>
    </Paper>
  );
}

// function InfoCard({ icon, label, value }) {
//   return (
//     <Paper
//       elevation={0}
//       sx={{
//         p: 2,
//         borderRadius: 3,
//         background: "rgba(255,255,255,0.03)",
//         border: "1px solid rgba(255,255,255,0.07)",
//         height: "100%",
//       }}
//     >
//       <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.8 }}>
//         {icon ? (
//           <Box sx={{ color: "#93c5fd", display: "flex", alignItems: "center" }}>
//             {icon}
//           </Box>
//         ) : null}
//         <Typography
//           sx={{
//             color: "rgba(255,255,255,0.58)",
//             fontSize: 12.5,
//             fontWeight: 600,
//           }}
//         >
//           {label}
//         </Typography>
//       </Stack>

//       <Typography
//         sx={{
//           color: "#fff",
//           fontWeight: 700,
//           wordBreak: "break-word",
//         }}
//       >
//         {value || "-"}
//       </Typography>
//     </Paper>
//   );
// }

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

const cellSmallTextSx = {
  color: "#dbe7ff",
  fontSize: 13,
  wordBreak: "break-word",
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

const popupPaperSx = {
  background:
    "linear-gradient(180deg, rgba(15,23,42,0.98) 0%, rgba(9,13,25,0.98) 100%)",
  color: "#fff",
  borderRadius: 5,
  border: "1px solid rgba(255,255,255,0.10)",
  boxShadow: "0 26px 70px rgba(0,0,0,0.55)",
  overflow: "hidden",
};

const popupTitleSx = {
  px: 3,
  py: 2.2,
  color: "#fff",
  fontWeight: 900,
  borderBottom: "1px solid rgba(255,255,255,0.08)",
};

const popupActionsSx = {
  p: 2,
  borderTop: "1px solid rgba(255,255,255,0.08)",
};

const dangerBtnSx = {
  textTransform: "none",
  fontWeight: 800,
  borderRadius: 3,
  px: 2,
  color: "#fff",
  background: "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)",
  boxShadow: "0 10px 25px rgba(239,68,68,0.22)",
  "&:hover": {
    background: "linear-gradient(135deg, #b91c1c 0%, #dc2626 100%)",
  },
};

const heroInfoCardSx = {
  p: 2,
  mb: 2.5,
  borderRadius: 3,
  background:
    "linear-gradient(135deg, rgba(37,99,235,0.12) 0%, rgba(99,102,241,0.08) 100%)",
  border: "1px solid rgba(59,130,246,0.18)",
};

const imagePreviewWrapSx = {
  mt: 2,
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 3,
  p: 1.5,
  backgroundColor: "rgba(15,23,42,0.85)",
};
