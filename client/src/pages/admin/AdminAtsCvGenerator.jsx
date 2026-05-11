/**
 * The `AdminAtsCvGenerator` function in the JavaScript React code is a component that allows an admin
 * to upload, scan, review, edit, and generate an ATS PDF for a candidate's CV.
 * @returns The code is returning a React component named `AdminAtsCvGenerator` that serves as an ATS
 * CV Generator interface for an admin. The component includes various sections for managing candidate
 * information, generating ATS CVs, uploading and scanning CV files, editing details, and handling
 * saved ATS CVs. It also includes functionalities for loading candidate profiles, generating ATS PDFs,
 * downloading generated PDFs, and deleting
 */
import { useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { styled } from "@mui/material/styles";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  tableCellClasses,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import {
  Download,
  FileText,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UploadCloud,
  Users,
  Wand2,
} from "lucide-react";

const API_BASE_URL = "http://localhost:3001";

const glassCardSx = {
  borderRadius: 3,
  bgcolor: "rgba(15, 23, 42, 0.45)",
  border: "1px solid rgba(255, 255, 255, 0.10)",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
  boxShadow: "0 8px 30px rgba(0,0,0,0.18)",
};

const dialogPaperSx = {
  ...glassCardSx,
  color: "#f8fafc",
  bgcolor: "rgba(15, 23, 42, 0.96)",
  background:
    "linear-gradient(180deg, rgba(15,23,42,0.98) 0%, rgba(9,13,25,0.98) 100%)",
};

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    color: "#f8fafc",
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    "& fieldset": { borderColor: "rgba(255,255,255,0.14)" },
    "&:hover fieldset": { borderColor: "rgba(96,165,250,0.70)" },
    "&.Mui-focused fieldset": { borderColor: "#60a5fa" },
  },
  "& .MuiInputLabel-root": { color: "#94a3b8" },
  "& .MuiInputLabel-root.Mui-focused": { color: "#60a5fa" },
  "& .MuiInputBase-input": {
    color: "#f8fafc",
    WebkitTextFillColor: "#f8fafc !important",
  },
  "& .MuiInputBase-input::placeholder": { color: "#94a3b8", opacity: 0.85 },
  "& .MuiSvgIcon-root": { color: "#e5e7eb" },
};

const menuProps = {
  PaperProps: {
    sx: {
      backgroundColor: "#0f172a",
      color: "#f8fafc",
      border: "1px solid rgba(255,255,255,0.10)",
      maxHeight: 320,
    },
  },
};

const StyledTableCell = styled(TableCell)(() => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: "rgba(2, 6, 23, 0.45)",
    color: "#9ca3af",
    fontWeight: 600,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },
  [`&.${tableCellClasses.body}`]: {
    color: "#e5e7eb",
    fontSize: 13,
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
}));

const StyledTableRow = styled(TableRow)(() => ({
  "&:hover": { backgroundColor: "rgba(255,255,255,0.03)" },
  "&:last-child td, &:last-child th": { borderBottom: 0 },
}));

const emptyExperience = {
  title: "",
  company: "",
  location: "",
  start_date: "",
  end_date: "",
  description: "",
};
const emptyEducation = {
  degree: "",
  institution: "",
  location: "",
  start_date: "",
  end_date: "",
  description: "",
};
const emptyCertification = { name: "", issuer: "", date: "" };
const emptyLanguage = { name: "", level: "Good" };

const languageOptions = [
  "Arabic",
  "English",
  "Hindi",
  "Urdu",
  "Tagalog",
  "French",
  "Spanish",
  "Other",
];
const languageLevelOptions = [
  "Native",
  "Fluent",
  "Excellent",
  "Very Good",
  "Good",
  "Fair",
  "Basic",
];

const initialCvForm = {
  full_name: "",
  email: "",
  phone: "",
  location: "",
  current_position: "",
  linkedin: "",
  github: "",
  portfolio: "",
  summary: "",
  skills: "",
  languageItems: [{ ...emptyLanguage }],
  experienceItems: [{ ...emptyExperience }],
  educationItems: [{ ...emptyEducation }],
  certificationItems: [],
};

function listToText(items, label, fields) {
  return items
    .filter((item) => fields.some((field) => item[field]))
    .map((item, index) => {
      const dates = [item.start_date, item.end_date]
        .filter(Boolean)
        .join(" - ");
      const lines = [`${label} ${index + 1}`];
      fields.forEach((field) => {
        if (field === "dates") return;
        if (item[field])
          lines.push(`${field.replaceAll("_", " ")}: ${item[field]}`);
      });
      if (dates) lines.push(`Dates: ${dates}`);
      return lines.join("\n");
    })
    .join("\n\n");
}

/**
 * The function `experienceItemsToText` takes an array of items and converts them into a formatted text
 * list representing work experience.
 * @returns The function `experienceItemsToText` is returning a formatted text representation of a list
 * of items, specifically work experience items. It uses the `listToText` function to format the items
 * with the title "Work Experience" and includes the properties "title", "company", "location", and
 * "description" for each item in the list.
 */
function experienceItemsToText(items) {
  return listToText(items, "Work Experience", [
    "title",
    "company",
    "location",
    "description",
  ]);
}

function educationItemsToText(items) {
  return listToText(items, "Education", [
    "degree",
    "institution",
    "location",
    "description",
  ]);
}

function certificationItemsToText(items) {
  return items
    .filter((item) => item.name || item.issuer || item.date)
    .map((item) =>
      [item.name, item.issuer, item.date].filter(Boolean).join(" - "),
    )
    .join("\n");
}

function languageItemsToText(items) {
  return items
    .filter((item) => item.name || item.level)
    .map((item) => [item.name, item.level].filter(Boolean).join(" - "))
    .join("\n");
}

function textToExperienceItems(value) {
  if (!value) return [{ ...emptyExperience }];
  return [{ ...emptyExperience, description: value }];
}

function textToEducationItems(value) {
  if (!value) return [{ ...emptyEducation }];
  return [{ ...emptyEducation, description: value }];
}

function textToLanguageItems(value) {
  if (!value) return [{ ...emptyLanguage }];
  return String(value)
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      const parts = item
        .split(/[-–:]/)
        .map((part) => part.trim())
        .filter(Boolean);
      return { name: parts[0] || "", level: parts[1] || "Good" };
    });
}

function buildCvPayload(form) {
  return {
    full_name: form.full_name,
    email: form.email,
    phone: form.phone,
    location: form.location,
    current_position: form.current_position,
    linkedin: form.linkedin,
    github: form.github,
    portfolio: form.portfolio,
    summary: form.summary,
    skills: form.skills,
    languages: languageItemsToText(form.languageItems),
    language_items: form.languageItems,
    experience: experienceItemsToText(form.experienceItems),
    education: educationItemsToText(form.educationItems),
    certifications: certificationItemsToText(form.certificationItems),
    experience_items: form.experienceItems,
    education_items: form.educationItems,
    certification_items: form.certificationItems,
  };
}

function missingRequiredFields(form) {
  const missing = [];
  if (!form.full_name?.trim()) missing.push("Full name");
  if (!form.email?.trim()) missing.push("Email");
  if (!form.phone?.trim()) missing.push("Phone");
  if (!form.location?.trim()) missing.push("Location");
  if (!form.skills?.trim()) missing.push("Skills");
  if (
    !form.experienceItems.some(
      (item) =>
        item.title?.trim() || item.company?.trim() || item.description?.trim(),
    )
  )
    missing.push("Experience");
  if (
    !form.educationItems.some(
      (item) =>
        item.degree?.trim() ||
        item.institution?.trim() ||
        item.description?.trim(),
    )
  )
    missing.push("Education");
  return missing;
}

function formatDateTime(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString();
}

function SummaryCard({ title, value, subtitle, icon, accent }) {
  const Icon = icon;
  return (
    <Card elevation={0} sx={{ ...glassCardSx, height: "100%" }}>
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
          <Box>
            <Typography
              variant="caption"
              sx={{
                color: "#94a3b8",
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="h5"
              sx={{ color: "#f8fafc", fontWeight: 700, mt: 0.5 }}
            >
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: `${accent}22`,
              color: accent,
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <Icon size={20} />
          </Box>
        </Box>
        <Typography variant="body2" sx={{ color: "#94a3b8", fontSize: 12 }}>
          {subtitle}
        </Typography>
      </CardContent>
    </Card>
  );
}

function SectionCard({ title, action, children }) {
  return (
    <Card elevation={0} sx={glassCardSx}>
      <CardContent>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 2 }}
        >
          <Typography variant="h6" sx={{ color: "#f8fafc", fontWeight: 700 }}>
            {title}
          </Typography>
          {action}
        </Stack>
        {children}
      </CardContent>
    </Card>
  );
}

export default function AdminAtsCvGenerator() {
  const [candidateIdInput, setCandidateIdInput] = useState("");
  const [candidateId, setCandidateId] = useState("");
  const [candidate, setCandidate] = useState(null);
  const [cvForm, setCvForm] = useState(initialCvForm);
  const [missingFields, setMissingFields] = useState([]);
  const [savedCvs, setSavedCvs] = useState([]);
  const [selectedCvFile, setSelectedCvFile] = useState(null);
  const [loadingCandidate, setLoadingCandidate] = useState(false);
  const [extractingCv, setExtractingCv] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [deletingCvId, setDeletingCvId] = useState(null);
  const [generated, setGenerated] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [cvToDelete, setCvToDelete] = useState(null);

  function updateCvForm(nextForm) {
    setCvForm(nextForm);
    setMissingFields(missingRequiredFields(nextForm));
  }

  function handleCvField(name, value) {
    updateCvForm({ ...cvForm, [name]: value });
  }

  function updateArray(section, index, field, value) {
    const nextItems = cvForm[section].map((item, itemIndex) =>
      itemIndex === index ? { ...item, [field]: value } : item,
    );
    updateCvForm({ ...cvForm, [section]: nextItems });
  }

  function addArrayItem(section, emptyItem) {
    updateCvForm({
      ...cvForm,
      [section]: [...cvForm[section], { ...emptyItem }],
    });
  }

  function removeArrayItem(section, index, fallbackItem) {
    const nextItems = cvForm[section].filter(
      (_, itemIndex) => itemIndex !== index,
    );
    updateCvForm({
      ...cvForm,
      [section]: nextItems.length ? nextItems : [{ ...fallbackItem }],
    });
  }

  async function loadSavedCvs(id = candidateId) {
    if (!id) return;
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/candidate/generated-cvs/${id}`,
      );
      const data = await response.json().catch(() => []);
      if (!response.ok)
        throw new Error(
          data?.message || `Failed to load saved CVs (${response.status})`,
        );
      setSavedCvs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("loadSavedCvs error:", err);
      setSavedCvs([]);
    }
  }

  async function handleLoadCandidate() {
    const id = String(candidateIdInput || "").trim();
    if (!id) {
      setError("Enter a candidate ID first.");
      return;
    }
    try {
      setLoadingCandidate(true);
      setError("");
      setNotice("");
      setGenerated(null);
      setDownloadUrl("");
      setSelectedCvFile(null);
      const response = await fetch(
        `${API_BASE_URL}/api/candidate/profile/${id}`,
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(
          data?.message || `Failed to load candidate (${response.status})`,
        );
      const nextForm = {
        full_name: data.full_name || "",
        email: data.email || "",
        phone: data.phone || "",
        location: data.preferred_locations || data.location || "",
        current_position: data.current_position || data.desired_position || "",
        linkedin: data.linkedin || "",
        github: data.github || "",
        portfolio: data.portfolio || "",
        summary: data.summary || "",
        skills: data.skills || "",
        languageItems: textToLanguageItems(data.languages || ""),
        experienceItems: textToExperienceItems(data.experience),
        educationItems: textToEducationItems(data.education),
        certificationItems: [],
      };
      setCandidateId(id);
      setCandidate(data);
      updateCvForm(nextForm);
      await loadSavedCvs(id);
      setNotice("Candidate loaded. Review details before generating.");
    } catch (err) {
      console.error("handleLoadCandidate error:", err);
      setError(err.message || "Failed to load candidate.");
      setCandidate(null);
      setSavedCvs([]);
      setCandidateId("");
    } finally {
      setLoadingCandidate(false);
    }
  }

  async function handleCvUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!candidateId) {
    }
    setSelectedCvFile(file);
    setExtractingCv(true);
    setError("");
    setNotice("");
    try {
      const formData = new FormData();
      formData.append("cv", file);
      formData.append("candidate_id", candidateId || "0");
      const response = await fetch(`${API_BASE_URL}/api/candidate/cv/extract`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(
          data?.message || data?.error || `CV scan failed (${response.status})`,
        );
      const extracted = data.extracted || data;
      const nextForm = {
        ...cvForm,
        full_name: extracted.full_name || cvForm.full_name,
        email: extracted.email || cvForm.email,
        phone: extracted.phone || cvForm.phone,
        location: extracted.location || cvForm.location,
        current_position: extracted.current_position || cvForm.current_position,
        linkedin: extracted.linkedin || cvForm.linkedin,
        github: extracted.github || cvForm.github,
        portfolio: extracted.portfolio || cvForm.portfolio,
        summary: extracted.summary || cvForm.summary,
        skills: Array.isArray(extracted.skills)
          ? extracted.skills.join(", ")
          : extracted.skills || cvForm.skills,
        languageItems:
          Array.isArray(extracted.languages) && extracted.languages.length
            ? extracted.languages.map((item) => {
                if (typeof item === "string") {
                  const parts = item
                    .split(/[-–:]/)
                    .map((part) => part.trim())
                    .filter(Boolean);
                  return { name: parts[0] || "", level: parts[1] || "Good" };
                }
                return {
                  name: item.name || item.language || "",
                  level: item.level || item.proficiency || "Good",
                };
              })
            : cvForm.languageItems,
        experienceItems:
          Array.isArray(extracted.experience) && extracted.experience.length
            ? extracted.experience.map((item) => ({
                title: item.title || "",
                company: item.company || "",
                location: item.location || "",
                start_date: item.start_date || "",
                end_date: item.end_date || item.duration || "",
                description: item.description || "",
              }))
            : cvForm.experienceItems,
        educationItems:
          Array.isArray(extracted.education) && extracted.education.length
            ? extracted.education.map((item) => ({
                degree: item.degree || "",
                institution: item.institution || "",
                location: item.location || "",
                start_date: item.start_date || "",
                end_date: item.end_date || item.year || "",
                description: item.description || "",
              }))
            : cvForm.educationItems,
        certificationItems:
          Array.isArray(extracted.certifications) &&
          extracted.certifications.length
            ? extracted.certifications.map((item) =>
                typeof item === "string"
                  ? { name: item, issuer: "", date: "" }
                  : {
                      name: item.name || "",
                      issuer: item.issuer || "",
                      date: item.date || "",
                    },
              )
            : cvForm.certificationItems,
      };
      updateCvForm(nextForm);
      setNotice("CV scanned successfully. Review fields before generating.");
    } catch (err) {
      console.error("handleCvUpload error:", err);
      setError(err.message || "CV scan failed.");
    } finally {
      setExtractingCv(false);
    }
  }

  async function handleGenerateAtsCv() {
    setError("");
    setNotice("");
    setGenerated(null);
    setDownloadUrl("");
    const missing = missingRequiredFields(cvForm);
    setMissingFields(missing);
    if (missing.length > 0) {
      setError("Please fill the missing CV information before generating.");
      return;
    }
    try {
      setGenerating(true);
      const response = await fetch(
        `${API_BASE_URL}/api/candidate/ats-cv/generate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ edited_cv_data: buildCvPayload(cvForm) }),
        },
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(
          data?.message ||
            data?.error ||
            `Failed to generate (${response.status})`,
        );
      setGenerated(data.generated);
      setDownloadUrl(
        data.download_url ? `${API_BASE_URL}${data.download_url}` : "",
      );
      setNotice("ATS PDF generated successfully. You can download it below.");
    } catch (err) {
      console.error("handleGenerateAtsCv error:", err);
      setError(err.message || "Failed to generate ATS CV.");
    } finally {
      setGenerating(false);
    }
  }

  function requestDeleteCv(cv) {
    setCvToDelete(cv);
    setDeleteConfirmOpen(true);
  }

  async function handleDeleteCv() {
    if (!cvToDelete?.id) return;
    try {
      setDeletingCvId(cvToDelete.id);
      setError("");
      setDeleteConfirmOpen(false);
      const response = await fetch(
        `${API_BASE_URL}/api/candidate/generated-cvs/${cvToDelete.id}`,
        { method: "DELETE" },
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(
          data?.message ||
            data?.error ||
            `Failed to delete CV (${response.status})`,
        );
      await loadSavedCvs(candidateId);
      setNotice("Saved ATS CV deleted.");
    } catch (err) {
      console.error("handleDeleteCv error:", err);
      setError(err.message || "Failed to delete saved CV.");
    } finally {
      setDeletingCvId(null);
      setCvToDelete(null);
    }
  }

  const renderText = (label, value, onChange, props = {}) => (
    <TextField
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      fullWidth
      sx={fieldSx}
      {...props}
    />
  );

  return (
    <AdminLayout title="ATS CV Generator">
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "#0b1120",
          backgroundImage:
            "radial-gradient(circle at top left, rgba(59,130,246,0.12), transparent 30%), radial-gradient(circle at top right, rgba(168,85,247,0.10), transparent 28%)",
          p: { xs: 2, md: 4 },
        }}
      >
        <Box sx={{ maxWidth: 1280, mx: "auto" }}>
          <Box
            sx={{
              mb: 3,
              display: "flex",
              justifyContent: "space-between",
              alignItems: { xs: "flex-start", sm: "center" },
              flexDirection: { xs: "column", sm: "row" },
              gap: 2,
            }}
          >
            <Box>
              <Typography
                variant="h4"
                sx={{
                  color: "#f8fafc",
                  fontWeight: 700,
                  letterSpacing: -0.5,
                  mb: 0.5,
                }}
              >
                ATS CV Generator
              </Typography>
              <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                Admin can upload a CV, scan it, review/edit details, then
                generate a downloadable ATS PDF.
              </Typography>
            </Box>
            <Button
              variant="outlined"
              onClick={() => candidateId && loadSavedCvs(candidateId)}
              startIcon={<RefreshCw size={16} />}
              disabled={!candidateId}
              sx={{
                color: "#e5e7eb",
                borderColor: "rgba(255,255,255,0.16)",
                textTransform: "none",
                borderRadius: 2,
              }}
            >
              Refresh History
            </Button>
          </Box>

          <Grid container spacing={2.5} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <SummaryCard
                title="Selected candidate"
                value={candidateId || "-"}
                subtitle={
                  candidate?.full_name || "Optional: load by ID or scan CV"
                }
                icon={Users}
                accent="#3b82f6"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <SummaryCard
                title="Saved ATS CVs"
                value={savedCvs.length}
                subtitle="Optional history when candidate is loaded"
                icon={FileText}
                accent="#8b5cf6"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <SummaryCard
                title="Status"
                value={generating ? "Generating" : "Ready"}
                subtitle="CV-only download mode"
                icon={Wand2}
                accent="#22c55e"
              />
            </Grid>
          </Grid>

          {!!error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}
          {!!notice && (
            <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
              {notice}
            </Alert>
          )}

          <Paper elevation={0} sx={{ ...glassCardSx, mb: 3, p: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={5}>
                {renderText(
                  "Candidate ID optional",
                  candidateIdInput,
                  setCandidateIdInput,
                  { placeholder: "Example: 109" },
                )}
              </Grid>
              <Grid item xs={12} md={3}>
                <Button
                  variant="contained"
                  startIcon={
                    loadingCandidate ? (
                      <CircularProgress size={16} />
                    ) : (
                      <Search size={16} />
                    )
                  }
                  onClick={handleLoadCandidate}
                  disabled={loadingCandidate}
                  fullWidth
                  sx={{
                    height: 56,
                    textTransform: "none",
                    borderRadius: 2,
                    bgcolor: "#2563eb",
                    "&:hover": { bgcolor: "#1d4ed8" },
                  }}
                >
                  {loadingCandidate ? "Loading..." : "Load Candidate"}
                </Button>
              </Grid>
              <Grid item xs={12} md={4}>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<UploadCloud size={16} />}
                  disabled={extractingCv || generating}
                  fullWidth
                  sx={{
                    height: 56,
                    color: "#e5e7eb",
                    borderColor: "rgba(255,255,255,0.16)",
                    textTransform: "none",
                    borderRadius: 2,
                  }}
                >
                  {extractingCv
                    ? "Scanning CV..."
                    : selectedCvFile
                      ? "Change CV File"
                      : "Upload CV & Scan"}
                  <input
                    hidden
                    type="file"
                    accept=".pdf,.doc,.docx,image/*"
                    onChange={handleCvUpload}
                  />
                </Button>
              </Grid>
            </Grid>
            {extractingCv && <LinearProgress sx={{ mt: 2 }} />}
            {selectedCvFile && (
              <Typography sx={{ color: "#94a3b8", fontSize: 13, mt: 1 }}>
                Selected file: {selectedCvFile.name}
              </Typography>
            )}
          </Paper>

          <Grid container spacing={3}>
            <Grid item xs={12} lg={8}>
              <Stack spacing={3}>
                <SectionCard title="Personal Information">
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      {renderText("Full Name", cvForm.full_name, (value) =>
                        handleCvField("full_name", value),
                      )}
                    </Grid>
                    <Grid item xs={12} md={6}>
                      {renderText(
                        "Current / Target Title",
                        cvForm.current_position,
                        (value) => handleCvField("current_position", value),
                      )}
                    </Grid>
                    <Grid item xs={12} md={6}>
                      {renderText("Email", cvForm.email, (value) =>
                        handleCvField("email", value),
                      )}
                    </Grid>
                    <Grid item xs={12} md={6}>
                      {renderText("Phone", cvForm.phone, (value) =>
                        handleCvField("phone", value),
                      )}
                    </Grid>
                    <Grid item xs={12}>
                      {renderText(
                        "Location",
                        cvForm.location,
                        (value) => handleCvField("location", value),
                        { placeholder: "Example: Manama, Bahrain" },
                      )}
                    </Grid>
                    <Grid item xs={12} md={4}>
                      {renderText("LinkedIn", cvForm.linkedin, (value) =>
                        handleCvField("linkedin", value),
                      )}
                    </Grid>
                    <Grid item xs={12} md={4}>
                      {renderText("GitHub", cvForm.github, (value) =>
                        handleCvField("github", value),
                      )}
                    </Grid>
                    <Grid item xs={12} md={4}>
                      {renderText("Portfolio", cvForm.portfolio, (value) =>
                        handleCvField("portfolio", value),
                      )}
                    </Grid>
                    <Grid item xs={12}>
                      {renderText(
                        "Professional Summary",
                        cvForm.summary,
                        (value) => handleCvField("summary", value),
                        { multiline: true, minRows: 3 },
                      )}
                    </Grid>
                    <Grid item xs={12}>
                      {renderText(
                        "Skills",
                        cvForm.skills,
                        (value) => handleCvField("skills", value),
                        {
                          multiline: true,
                          minRows: 2,
                          placeholder:
                            "Example: React, JavaScript, Customer Service, Excel",
                        },
                      )}
                    </Grid>
                  </Grid>
                </SectionCard>

                <SectionCard
                  title="Languages"
                  action={
                    <Button
                      startIcon={<Plus size={16} />}
                      onClick={() =>
                        addArrayItem("languageItems", emptyLanguage)
                      }
                      sx={{ color: "#e5e7eb", textTransform: "none" }}
                    >
                      Add Language
                    </Button>
                  }
                >
                  <Stack spacing={2}>
                    {cvForm.languageItems.map((item, index) => (
                      <Grid
                        container
                        spacing={2}
                        key={index}
                        alignItems="center"
                      >
                        <Grid item xs={12} md={5}>
                          <FormControl fullWidth sx={fieldSx}>
                            <InputLabel>Language</InputLabel>
                            <Select
                              label="Language"
                              value={item.name}
                              onChange={(e) =>
                                updateArray(
                                  "languageItems",
                                  index,
                                  "name",
                                  e.target.value,
                                )
                              }
                              MenuProps={menuProps}
                            >
                              {languageOptions.map((language) => (
                                <MenuItem key={language} value={language}>
                                  {language}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} md={5}>
                          <FormControl fullWidth sx={fieldSx}>
                            <InputLabel>Level</InputLabel>
                            <Select
                              label="Level"
                              value={item.level}
                              onChange={(e) =>
                                updateArray(
                                  "languageItems",
                                  index,
                                  "level",
                                  e.target.value,
                                )
                              }
                              MenuProps={menuProps}
                            >
                              {languageLevelOptions.map((level) => (
                                <MenuItem key={level} value={level}>
                                  {level}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} md={2}>
                          <IconButton
                            onClick={() =>
                              removeArrayItem(
                                "languageItems",
                                index,
                                emptyLanguage,
                              )
                            }
                            sx={{ color: "#94a3b8" }}
                          >
                            <Trash2 size={18} />
                          </IconButton>
                        </Grid>
                      </Grid>
                    ))}
                  </Stack>
                </SectionCard>

                <SectionCard
                  title="Work Experience"
                  action={
                    <Button
                      startIcon={<Plus size={16} />}
                      onClick={() =>
                        addArrayItem("experienceItems", emptyExperience)
                      }
                      sx={{ color: "#e5e7eb", textTransform: "none" }}
                    >
                      Add Work
                    </Button>
                  }
                >
                  <Stack spacing={2}>
                    {cvForm.experienceItems.map((item, index) => (
                      <Box
                        key={index}
                        sx={{
                          p: 2,
                          borderRadius: 3,
                          background: "rgba(2,6,23,0.28)",
                          border: "1px solid rgba(255,255,255,0.08)",
                        }}
                      >
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          sx={{ mb: 2 }}
                        >
                          <Typography
                            sx={{ color: "#f8fafc", fontWeight: 700 }}
                          >
                            Work {index + 1}
                          </Typography>
                          <IconButton
                            onClick={() =>
                              removeArrayItem(
                                "experienceItems",
                                index,
                                emptyExperience,
                              )
                            }
                            sx={{ color: "#fda4af" }}
                          >
                            <Trash2 size={18} />
                          </IconButton>
                        </Stack>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            {renderText("Job Title", item.title, (value) =>
                              updateArray(
                                "experienceItems",
                                index,
                                "title",
                                value,
                              ),
                            )}
                          </Grid>
                          <Grid item xs={12} md={6}>
                            {renderText("Company", item.company, (value) =>
                              updateArray(
                                "experienceItems",
                                index,
                                "company",
                                value,
                              ),
                            )}
                          </Grid>
                          <Grid item xs={12} md={4}>
                            {renderText("Location", item.location, (value) =>
                              updateArray(
                                "experienceItems",
                                index,
                                "location",
                                value,
                              ),
                            )}
                          </Grid>
                          <Grid item xs={12} md={4}>
                            {renderText(
                              "Start Date",
                              item.start_date,
                              (value) =>
                                updateArray(
                                  "experienceItems",
                                  index,
                                  "start_date",
                                  value,
                                ),
                            )}
                          </Grid>
                          <Grid item xs={12} md={4}>
                            {renderText("End Date", item.end_date, (value) =>
                              updateArray(
                                "experienceItems",
                                index,
                                "end_date",
                                value,
                              ),
                            )}
                          </Grid>
                          <Grid item xs={12}>
                            {renderText(
                              "Responsibilities / Achievements",
                              item.description,
                              (value) =>
                                updateArray(
                                  "experienceItems",
                                  index,
                                  "description",
                                  value,
                                ),
                              { multiline: true, minRows: 3 },
                            )}
                          </Grid>
                        </Grid>
                      </Box>
                    ))}
                  </Stack>
                </SectionCard>

                <SectionCard
                  title="Education"
                  action={
                    <Button
                      startIcon={<Plus size={16} />}
                      onClick={() =>
                        addArrayItem("educationItems", emptyEducation)
                      }
                      sx={{ color: "#e5e7eb", textTransform: "none" }}
                    >
                      Add Education
                    </Button>
                  }
                >
                  <Stack spacing={2}>
                    {cvForm.educationItems.map((item, index) => (
                      <Box
                        key={index}
                        sx={{
                          p: 2,
                          borderRadius: 3,
                          background: "rgba(2,6,23,0.28)",
                          border: "1px solid rgba(255,255,255,0.08)",
                        }}
                      >
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          sx={{ mb: 2 }}
                        >
                          <Typography
                            sx={{ color: "#f8fafc", fontWeight: 700 }}
                          >
                            Education {index + 1}
                          </Typography>
                          <IconButton
                            onClick={() =>
                              removeArrayItem(
                                "educationItems",
                                index,
                                emptyEducation,
                              )
                            }
                            sx={{ color: "#fda4af" }}
                          >
                            <Trash2 size={18} />
                          </IconButton>
                        </Stack>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            {renderText(
                              "Degree / Program",
                              item.degree,
                              (value) =>
                                updateArray(
                                  "educationItems",
                                  index,
                                  "degree",
                                  value,
                                ),
                            )}
                          </Grid>
                          <Grid item xs={12} md={6}>
                            {renderText(
                              "Institution",
                              item.institution,
                              (value) =>
                                updateArray(
                                  "educationItems",
                                  index,
                                  "institution",
                                  value,
                                ),
                            )}
                          </Grid>
                          <Grid item xs={12} md={4}>
                            {renderText("Location", item.location, (value) =>
                              updateArray(
                                "educationItems",
                                index,
                                "location",
                                value,
                              ),
                            )}
                          </Grid>
                          <Grid item xs={12} md={4}>
                            {renderText(
                              "Start Date",
                              item.start_date,
                              (value) =>
                                updateArray(
                                  "educationItems",
                                  index,
                                  "start_date",
                                  value,
                                ),
                            )}
                          </Grid>
                          <Grid item xs={12} md={4}>
                            {renderText(
                              "End Date / Graduation",
                              item.end_date,
                              (value) =>
                                updateArray(
                                  "educationItems",
                                  index,
                                  "end_date",
                                  value,
                                ),
                            )}
                          </Grid>
                          <Grid item xs={12}>
                            {renderText(
                              "Education Details",
                              item.description,
                              (value) =>
                                updateArray(
                                  "educationItems",
                                  index,
                                  "description",
                                  value,
                                ),
                              { multiline: true, minRows: 2 },
                            )}
                          </Grid>
                        </Grid>
                      </Box>
                    ))}
                  </Stack>
                </SectionCard>

                <SectionCard
                  title="Certifications Optional"
                  action={
                    <Button
                      startIcon={<Plus size={16} />}
                      onClick={() =>
                        addArrayItem("certificationItems", emptyCertification)
                      }
                      sx={{ color: "#e5e7eb", textTransform: "none" }}
                    >
                      Add Certification
                    </Button>
                  }
                >
                  <Stack spacing={2}>
                    {cvForm.certificationItems.length === 0 && (
                      <Typography sx={{ color: "#94a3b8" }}>
                        No certifications added. This section will be skipped in
                        the PDF.
                      </Typography>
                    )}
                    {cvForm.certificationItems.map((item, index) => (
                      <Box
                        key={index}
                        sx={{
                          p: 2,
                          borderRadius: 3,
                          background: "rgba(2,6,23,0.28)",
                          border: "1px solid rgba(255,255,255,0.08)",
                        }}
                      >
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          sx={{ mb: 2 }}
                        >
                          <Typography
                            sx={{ color: "#f8fafc", fontWeight: 700 }}
                          >
                            Certification {index + 1}
                          </Typography>
                          <IconButton
                            onClick={() =>
                              removeArrayItem(
                                "certificationItems",
                                index,
                                emptyCertification,
                              )
                            }
                            sx={{ color: "#fda4af" }}
                          >
                            <Trash2 size={18} />
                          </IconButton>
                        </Stack>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={5}>
                            {renderText(
                              "Certification Name",
                              item.name,
                              (value) =>
                                updateArray(
                                  "certificationItems",
                                  index,
                                  "name",
                                  value,
                                ),
                            )}
                          </Grid>
                          <Grid item xs={12} md={5}>
                            {renderText("Issuer", item.issuer, (value) =>
                              updateArray(
                                "certificationItems",
                                index,
                                "issuer",
                                value,
                              ),
                            )}
                          </Grid>
                          <Grid item xs={12} md={2}>
                            {renderText("Date", item.date, (value) =>
                              updateArray(
                                "certificationItems",
                                index,
                                "date",
                                value,
                              ),
                            )}
                          </Grid>
                        </Grid>
                      </Box>
                    ))}
                  </Stack>
                </SectionCard>
              </Stack>
            </Grid>

            <Grid item xs={12} lg={4}>
              <Stack
                spacing={3}
                sx={{ position: { lg: "sticky" }, top: { lg: 90 } }}
              >
                <Card elevation={0} sx={glassCardSx}>
                  <CardContent>
                    <Typography
                      variant="h6"
                      sx={{ color: "#f8fafc", fontWeight: 700, mb: 2 }}
                    >
                      Generate ATS CV
                    </Typography>
                    {missingFields.length > 0 && (
                      <Alert severity="warning" sx={{ mb: 2 }}>
                        Missing: {missingFields.join(", ")}
                      </Alert>
                    )}
                    {generating && <LinearProgress sx={{ mb: 2 }} />}
                    <Button
                      variant="contained"
                      startIcon={<Wand2 size={16} />}
                      onClick={handleGenerateAtsCv}
                      disabled={generating || extractingCv}
                      fullWidth
                      sx={{
                        textTransform: "none",
                        borderRadius: 2,
                        bgcolor: "#2563eb",
                        "&:hover": { bgcolor: "#1d4ed8" },
                      }}
                    >
                      {generating ? "Generating..." : "Generate ATS PDF"}
                    </Button>
                    <Typography
                      sx={{ color: "#94a3b8", fontSize: 12, mt: 1.5 }}
                    >
                      CV-only mode: this generates a downloadable PDF without
                      saving to candidate history.
                    </Typography>
                    {downloadUrl && (
                      <Button
                        variant="outlined"
                        startIcon={<Download size={16} />}
                        href={downloadUrl}
                        target="_blank"
                        rel="noreferrer"
                        fullWidth
                        sx={{
                          mt: 1.5,
                          color: "#e5e7eb",
                          borderColor: "rgba(255,255,255,0.16)",
                          textTransform: "none",
                          borderRadius: 2,
                        }}
                      >
                        Download Latest PDF
                      </Button>
                    )}
                    {generated?.honesty_check && (
                      <Alert severity="info" sx={{ mt: 2 }}>
                        {generated.honesty_check}
                      </Alert>
                    )}
                  </CardContent>
                </Card>

                <Paper
                  elevation={0}
                  sx={{ ...glassCardSx, overflow: "hidden" }}
                >
                  <Box
                    sx={{
                      px: 2.5,
                      py: 2,
                      borderBottom: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{ color: "#f8fafc", fontWeight: 700 }}
                    >
                      Saved ATS CVs
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "#94a3b8", mt: 0.5 }}
                    >
                      Optional history when a candidate is loaded.
                    </Typography>
                  </Box>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <StyledTableCell>Title</StyledTableCell>
                          <StyledTableCell>Created</StyledTableCell>
                          <StyledTableCell align="center">
                            Actions
                          </StyledTableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {!candidateId ? (
                          <StyledTableRow>
                            <StyledTableCell colSpan={3} align="center">
                              No candidate loaded.
                            </StyledTableCell>
                          </StyledTableRow>
                        ) : savedCvs.length === 0 ? (
                          <StyledTableRow>
                            <StyledTableCell colSpan={3} align="center">
                              No saved ATS CVs yet.
                            </StyledTableCell>
                          </StyledTableRow>
                        ) : (
                          savedCvs.map((cv) => (
                            <StyledTableRow key={cv.id}>
                              <StyledTableCell>
                                {cv.title || "ATS CV"}
                              </StyledTableCell>
                              <StyledTableCell>
                                {formatDateTime(cv.created_at)}
                              </StyledTableCell>
                              <StyledTableCell align="center">
                                <Stack
                                  direction="row"
                                  spacing={1}
                                  justifyContent="center"
                                >
                                  {cv.cv_url && (
                                    <IconButton
                                      component="a"
                                      href={`${API_BASE_URL}${cv.cv_url}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      sx={{
                                        color: "#cbd5e1",
                                        border:
                                          "1px solid rgba(255,255,255,0.08)",
                                        borderRadius: 2,
                                      }}
                                    >
                                      <Download size={16} />
                                    </IconButton>
                                  )}
                                  <IconButton
                                    onClick={() => {
                                      setCvToDelete(cv);
                                      setDeleteConfirmOpen(true);
                                    }}
                                    disabled={deletingCvId === cv.id}
                                    sx={{
                                      color: "#fda4af",
                                      border:
                                        "1px solid rgba(255,255,255,0.08)",
                                      borderRadius: 2,
                                    }}
                                  >
                                    <Trash2 size={16} />
                                  </IconButton>
                                </Stack>
                              </StyledTableCell>
                            </StyledTableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Stack>
            </Grid>
          </Grid>
        </Box>

        <Dialog
          open={deleteConfirmOpen}
          onClose={() => {
            if (deletingCvId) return;
            setDeleteConfirmOpen(false);
            setCvToDelete(null);
          }}
          fullWidth
          maxWidth="xs"
          PaperProps={{ sx: dialogPaperSx }}
        >
          <DialogTitle sx={{ fontWeight: 800 }}>Delete ATS CV</DialogTitle>
          <DialogContent
            dividers
            sx={{ borderColor: "rgba(255,255,255,0.08)" }}
          >
            <Typography sx={{ color: "#cbd5e1", lineHeight: 1.7 }}>
              Are you sure you want to delete this saved ATS CV?
            </Typography>
            {cvToDelete && (
              <Typography sx={{ color: "#94a3b8", mt: 1 }}>
                {cvToDelete.title || "ATS CV"}
              </Typography>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button
              onClick={() => {
                setDeleteConfirmOpen(false);
                setCvToDelete(null);
              }}
              disabled={Boolean(deletingCvId)}
              sx={{ textTransform: "none", color: "#cbd5e1" }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleDeleteCv}
              disabled={Boolean(deletingCvId)}
              sx={{
                textTransform: "none",
                borderRadius: 2,
                bgcolor: "#dc2626",
                "&:hover": { bgcolor: "#b91c1c" },
              }}
            >
              {deletingCvId ? "Deleting..." : "Delete"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AdminLayout>
  );
}
