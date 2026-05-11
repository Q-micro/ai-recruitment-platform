/**
 * The `CandidateProfile` function in JavaScript React is a component that allows candidates to input
 * and manage their personal information, skills, education, job preferences, and uploaded CVs.
 * @returns The `CandidateProfile` component is being exported as the default export. It contains a
 * form for candidates to fill out their personal information, skills, experience, education, job
 * preferences, and upload their CV. The component includes various sections like Personal Information,
 * Skills & Experience, Education, Job Preferences, Original CV upload, and Saved ATS CVs. The
 * component handles state for form data, loading status,
 */

import { useEffect, useMemo, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Slider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CandidateLayout from "../../components/CandidateLayout";
import {
  getCandidateProfile,
  updateCandidateProfile,
  uploadCandidateCV,
} from "../../api/candidate";

import DeleteIcon from "@mui/icons-material/Delete";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import InsertDriveFileRoundedIcon from "@mui/icons-material/InsertDriveFileRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import WorkRoundedIcon from "@mui/icons-material/WorkRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import ArticleRoundedIcon from "@mui/icons-material/ArticleRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import { apiFetch } from "../../api/http";

const API_BASE = "http://localhost:3001";

const nationalityOptions = [
  "Bahraini",
  "Saudi Arabian",
  "Kuwaiti",
  "Emirati",
  "Qatari",
  "Omani",
  "Indian",
  "Pakistani",
  "Bangladeshi",
  "Sri Lankan",
  "Filipino",
  "Nepali",
  "Egyptian",
  "Jordanian",
  "Lebanese",
  "Syrian",
  "Palestinian",
  "Yemeni",
  "Sudanese",
  "Moroccan",
  "Tunisian",
  "Algerian",
  "British",
  "American",
  "Canadian",
  "Australian",
  "Other",
];

const careerStatusOptions = [
  "Student",
  "Fresh Graduate",
  "Internship",
  "Full-time Employee",
  "Part-time Employee",
  "Unemployed",
  "Freelancer",
  "Business Owner",
  "Other",
];

const desiredWorkTypeOptions = [
  "Full-time",
  "Part-time",
  "Internship",
  "Contract",
  "Temporary",
  "Remote",
  "Hybrid",
  "Flexible",
  "Other",
];

const preferredJobTitleOptions = [
  "Accountant",
  "Administrative Assistant",
  "Backend Developer",
  "Business Analyst",
  "Call Center Agent",
  "Cashier",
  "Content Creator",
  "Customer Service Representative",
  "Data Analyst",
  "Digital Marketing Specialist",
  "Driver",
  "Finance Officer",
  "Frontend Developer",
  "Full Stack Developer",
  "Graphic Designer",
  "HR Officer",
  "IT Support",
  "Legal Assistant",
  "Marketing Specialist",
  "Office Assistant",
  "Operations Coordinator",
  "Product Manager",
  "Project Coordinator",
  "Receptionist",
  "Sales Executive",
  "Secretary",
  "Social Media Specialist",
  "Software Developer",
  "Store Keeper",
  "Teacher",
  "Waiter / Waitress",
];

const industryOptions = [
  "Accounting & Finance",
  "Banking",
  "Business Services",
  "Construction",
  "Consulting",
  "Education",
  "Government",
  "Healthcare",
  "Hospitality",
  "Human Resources",
  "IT / Technology",
  "Legal",
  "Logistics",
  "Manufacturing",
  "Marketing / Media",
  "Oil & Gas",
  "Real Estate",
  "Retail",
  "Sales",
  "Telecom",
];

const skillOptions = [
  "Accounting",
  "Administration",
  "Arabic",
  "Bookkeeping",
  "Business Analysis",
  "Cash Handling",
  "Cashier",
  "Communication",
  "Content Writing",
  "CRM",
  "Customer Service",
  "Data Analysis",
  "Data Entry",
  "Document Clearance",
  "English",
  "Excel",
  "Finance",
  "Graphic Design",
  "HR",
  "Inventory Management",
  "JavaScript",
  "Leadership",
  "Marketing",
  "Microsoft Office",
  "Negotiation",
  "Node.js",
  "Operations",
  "Payroll",
  "Problem Solving",
  "Project Management",
  "Python",
  "React",
  "Reception",
  "Report Writing",
  "Sales",
  "Scheduling",
  "Social Media",
  "SQL",
  "Teamwork",
  "Time Management",
  "UI/UX",
];

const educationLevelOptions = [
  "Below High School",
  "High School Diploma",
  "Diploma",
  "Associate Degree",
  "Bachelor's Degree",
  "Master's Degree",
  "PhD",
  "Certification / Training",
  "Currently Studying",
  "Other",
];

function splitCsv(value) {
  if (!value) return [];
  return value
    .split(/[,\n]/)
    .map((x) => x.trim())
    .filter(Boolean);
}

function normalizeCsv(value) {
  return Array.from(new Set(splitCsv(value))).join(", ");
}

function toggleCsvValue(currentValue, item) {
  const items = splitCsv(currentValue);
  const exists = items.includes(item);
  const nextItems = exists ? items.filter((x) => x !== item) : [...items, item];
  return Array.from(new Set(nextItems)).join(", ");
}

function csvIncludes(currentValue, item) {
  return splitCsv(currentValue).includes(item);
}

function extractEducationLevel(educationText) {
  if (!educationText) return "";
  const found = educationLevelOptions.find((level) =>
    educationText.startsWith(level),
  );
  return found || "";
}

function extractEducationDetails(educationText) {
  if (!educationText) return "";
  const level = extractEducationLevel(educationText);
  if (!level) return educationText;
  return educationText
    .replace(level, "")
    .replace(/^\s*-\s*/, "")
    .trim();
}

function buildGeneratedCvUrl(cvUrl) {
  if (!cvUrl) return "";
  if (cvUrl.startsWith("http")) return cvUrl;
  return `${API_BASE}${cvUrl}`;
}

function initials(name, email) {
  const source = name || email || "Candidate";
  return (
    source
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "C"
  );
}

function ProfileAccordion({
  id,
  title,
  subtitle,
  icon,
  children,
  colors,
  defaultExpanded = false,
}) {
  return (
    <Accordion
      defaultExpanded={defaultExpanded}
      disableGutters
      sx={{
        borderRadius: "24px !important",
        overflow: "hidden",
        background: colors.cardBg,
        color: colors.text,
        border: `1px solid ${colors.cardBorder}`,
        boxShadow: colors.cardShadow,
        "&:before": { display: "none" },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreRoundedIcon sx={{ color: colors.text }} />}
        aria-controls={`${id}-content`}
        id={`${id}-header`}
        sx={{
          px: { xs: 2, sm: 2.5 },
          py: 1,
          minHeight: 72,
          "& .MuiAccordionSummary-content": {
            my: 1.2,
            alignItems: "center",
            gap: 1.5,
          },
        }}
      >
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: 3,
            display: "grid",
            placeItems: "center",
            background: colors.buttonBg,
            color: "#fff",
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{ color: colors.text, fontWeight: 900, lineHeight: 1.15 }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography sx={{ color: colors.subtext, fontSize: 13, mt: 0.4 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{ px: { xs: 2, sm: 2.5 }, pb: { xs: 2, sm: 2.5 } }}>
        {children}
      </AccordionDetails>
    </Accordion>
  );
}

export default function CandidateProfile() {
  const user = JSON.parse(localStorage.getItem("user"));
  const candidateId = user?.candidate_id;

  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    email: "",
    nationality: "",
    nationality_other: "",
    current_position: "",
    current_position_other: "",
    desired_position: "",
    desired_position_other: "",
    expected_salary: "",
    candidate_status: "",
    cv_url: "",
    skills: "",
    experience: "",
    education: "",
    education_level: "",
    linkedin: "",
    portfolio: "",
    summary: "",
    preferred_job_titles: "",
    preferred_industries: "",
    preferred_job_types: "",
    preferred_locations: "",
    minimum_salary: "",
    ai_match_threshold: 75,
    work_type_preference: "",
    availability: "",
    profile_completed: false,
    cv_extracted: false,
  });

  const [generatedCvs, setGeneratedCvs] = useState([]);
  const [deletingCvId, setDeletingCvId] = useState(null);
  const [selectedCV, setSelectedCV] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingCV, setUploadingCV] = useState(false);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (candidateId) {
      fetchProfile();
      loadGeneratedCvs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidateId]);

  async function fetchProfile() {
    try {
      setErr("");
      setSuccess("");
      setLoading(true);
      const data = await getCandidateProfile(candidateId);

      setForm({
        full_name: data.full_name || "",
        phone: data.phone || "",
        email: data.email || "",
        nationality: nationalityOptions.includes(data.nationality)
          ? data.nationality || ""
          : data.nationality
            ? "Other"
            : "",
        nationality_other: nationalityOptions.includes(data.nationality)
          ? ""
          : data.nationality || "",
        current_position: careerStatusOptions.includes(data.current_position)
          ? data.current_position || ""
          : data.current_position
            ? "Other"
            : "",
        current_position_other: careerStatusOptions.includes(
          data.current_position,
        )
          ? ""
          : data.current_position || "",
        desired_position: desiredWorkTypeOptions.includes(data.desired_position)
          ? data.desired_position || ""
          : data.desired_position
            ? "Other"
            : "",
        desired_position_other: desiredWorkTypeOptions.includes(
          data.desired_position,
        )
          ? ""
          : data.desired_position || "",
        expected_salary: data.expected_salary || "",
        candidate_status: data.candidate_status || "",
        cv_url: data.cv_url || "",
        skills: data.skills || "",
        experience: data.experience || "",
        education: extractEducationDetails(data.education || ""),
        education_level: extractEducationLevel(data.education || ""),
        linkedin: data.linkedin || "",
        portfolio: data.portfolio || "",
        summary: data.summary || "",
        preferred_job_titles: data.preferred_job_titles || "",
        preferred_industries: data.preferred_industries || "",
        preferred_job_types: data.preferred_job_types || "",
        preferred_locations: data.preferred_locations || "",
        minimum_salary: data.minimum_salary || data.expected_salary || "",
        ai_match_threshold: data.ai_match_threshold || 75,
        work_type_preference: data.work_type_preference || "",
        availability: data.availability || "",
        profile_completed: Boolean(data.profile_completed),
        cv_extracted: Boolean(data.cv_extracted),
      });
    } catch (error) {
      console.error(error);
      setErr(error?.response?.data?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }

  async function loadGeneratedCvs() {
    if (!candidateId) return;

    try {
      const data = await apiFetch(
        `/api/candidate/generated-cvs/${candidateId}`,
      );
      setGeneratedCvs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load generated CVs:", error);
    }
  }

  async function handleDeleteGeneratedCv(cvId) {
    const confirmed = window.confirm("Delete this saved ATS CV?");
    if (!confirmed) return;

    try {
      setDeletingCvId(cvId);
      await apiFetch(`/api/candidate/generated-cvs/${cvId}`, {
        method: "DELETE",
      });
      await loadGeneratedCvs();
      setSuccess("Saved ATS CV deleted.");
    } catch (error) {
      setErr(error.message || "Failed to delete saved CV.");
    } finally {
      setDeletingCvId(null);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleFieldValue(name, value) {
    setForm((prev) => ({ ...prev, [name]: value || "" }));
  }

  function handleToggle(name, value) {
    setForm((prev) => ({ ...prev, [name]: toggleCsvValue(prev[name], value) }));
  }

  function handleCVSelect(e) {
    const file = e.target.files?.[0] || null;
    setSelectedCV(file);
  }

  function finalNationality() {
    return form.nationality === "Other"
      ? form.nationality_other
      : form.nationality;
  }

  function finalCurrentPosition() {
    return form.current_position === "Other"
      ? form.current_position_other
      : form.current_position;
  }

  function finalDesiredPosition() {
    return form.desired_position === "Other"
      ? form.desired_position_other
      : form.desired_position;
  }

  function buildEducationText() {
    if (form.education_level && form.education)
      return `${form.education_level} - ${form.education}`;
    if (form.education_level) return form.education_level;
    return form.education;
  }

  async function handleUploadCV() {
    try {
      setErr("");
      setSuccess("");

      if (!candidateId) {
        setErr("Candidate profile not linked yet.");
        return;
      }

      if (!selectedCV) {
        setErr("Please select a CV file first.");
        return;
      }

      setUploadingCV(true);
      const data = await uploadCandidateCV(candidateId, selectedCV);

      setForm((prev) => ({ ...prev, cv_url: data.cv_url || prev.cv_url }));
      setSelectedCV(null);
      setSuccess("CV uploaded successfully.");
      await fetchProfile();
    } catch (error) {
      console.error(error);
      setErr(error?.response?.data?.message || "Failed to upload CV");
    } finally {
      setUploadingCV(false);
    }
  }

  async function handleSave() {
    try {
      setErr("");
      setSuccess("");

      if (!candidateId) {
        setErr("Candidate profile not linked yet.");
        return;
      }

      setSaving(true);

      await updateCandidateProfile(candidateId, {
        ...form,
        full_name: form.full_name,
        phone: form.phone,
        email: form.email,
        nationality: finalNationality(),
        current_position: finalCurrentPosition(),
        desired_position: finalDesiredPosition(),
        expected_salary:
          form.expected_salary !== "" ? Number(form.expected_salary) : null,
        skills: normalizeCsv(form.skills),
        education: buildEducationText(),
        preferred_job_titles: normalizeCsv(form.preferred_job_titles),
        preferred_industries: normalizeCsv(form.preferred_industries),
        preferred_job_types: normalizeCsv(form.preferred_job_types),
        preferred_locations: form.preferred_locations,
        minimum_salary:
          form.minimum_salary !== "" ? Number(form.minimum_salary) : null,
        ai_match_threshold: Number(form.ai_match_threshold || 75),
        work_type_preference: form.work_type_preference,
        availability: form.availability,
        profile_completed: true,
        cv_extracted: Boolean(form.cv_extracted),
      });

      setForm((prev) => ({ ...prev, profile_completed: true }));
      setSuccess("Profile updated successfully.");
      await fetchProfile();
    } catch (error) {
      console.error(error);
      setErr(error?.response?.data?.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  }

  const completion = useMemo(() => {
    const values = [
      form.full_name,
      form.phone,
      form.email,
      form.nationality,
      form.current_position,
      form.desired_position,
      form.expected_salary,
      form.skills,
      form.education_level || form.education,
      form.preferred_job_titles,
      form.preferred_job_types,
    ];
    const completed = values.filter(
      (value) =>
        value !== null && value !== undefined && String(value).trim() !== "",
    ).length;
    return Math.round((completed / values.length) * 100);
  }, [form]);

  const missingFields = useMemo(() => {
    const items = [];
    if (!form.full_name) items.push("Full name");
    if (!form.phone) items.push("Phone");
    if (!form.email) items.push("Email");
    if (!form.nationality) items.push("Nationality");
    if (!form.current_position) items.push("Current career status");
    if (!form.desired_position) items.push("Desired work type");
    if (!form.expected_salary) items.push("Expected salary");
    if (!form.skills) items.push("Skills");
    if (!form.education_level && !form.education) items.push("Education");
    if (!form.preferred_job_titles) items.push("Preferred job titles");
    if (!form.preferred_job_types) items.push("Preferred job type");
    return items;
  }, [form]);

  return (
    <CandidateLayout noShell>
      {(colors) => {
        const inputSx = {
          "& .MuiOutlinedInput-root": {
            backgroundColor: colors.inputBg,
            borderRadius: 3,
            color: colors.text,
            minHeight: 56,
            "& fieldset": { borderColor: colors.inputBorder },
            "&:hover fieldset": { borderColor: colors.accent },
            "&.Mui-focused fieldset": { borderColor: colors.accent },
          },
          "& .MuiInputLabel-root": { color: colors.subtext },
          "& .MuiInputLabel-root.Mui-focused": { color: colors.accent },
          "& .MuiInputBase-input": {
            color: colors.text,
            WebkitTextFillColor: `${colors.text} !important`,
          },
          "& .MuiInputBase-input::placeholder": {
            color: colors.subtext,
            opacity: 0.8,
          },
          "& .MuiFormHelperText-root": { color: colors.subtext },
        };

        const selectSx = {
          ...inputSx,
          minWidth: "100%",
          "& .MuiSelect-select": {
            color: colors.text,
            WebkitTextFillColor: `${colors.text} !important`,
            minHeight: "24px",
            display: "flex",
            alignItems: "center",
          },
          "& .MuiSvgIcon-root": { color: colors.text },
        };

        const menuProps = {
          PaperProps: {
            sx: {
              backgroundColor: colors.cardBg,
              color: colors.text,
              border: `1px solid ${colors.cardBorder}`,
              maxHeight: 320,
            },
          },
        };

        const chipSx = (selected) => ({
          color: selected ? "#FFFFFF" : colors.text,
          borderColor: selected ? colors.accent : colors.inputBorder,
          background: selected ? colors.buttonBg : colors.inputBg,
          "&:hover": {
            background: selected ? colors.buttonHoverBg : colors.shellBg,
          },
        });

        const sliderSx = {
          color: colors.accent,
          "& .MuiSlider-thumb": {
            backgroundColor: colors.accent,
            border: "2px solid #FFFFFF",
          },
          "& .MuiSlider-track": { border: "none" },
          "& .MuiSlider-rail": { color: colors.inputBorder, opacity: 1 },
          "& .MuiSlider-valueLabel": {
            backgroundColor: colors.buttonBg,
            color: "#FFFFFF",
          },
        };

        const primaryBtnSx = {
          textTransform: "none",
          borderRadius: 3,
          fontWeight: 800,
          background: colors.buttonBg,
          color: "#FFFFFF",
          boxShadow: "none",
          "&:hover": { background: colors.buttonHoverBg, boxShadow: "none" },
        };

        const outlineBtnSx = {
          textTransform: "none",
          borderRadius: 3,
          fontWeight: 800,
          borderColor: colors.accent,
          color: colors.accent,
          "&:hover": {
            borderColor: colors.accentHover,
            backgroundColor: colors.hoverBg,
          },
        };

        return (
          <>
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

            {loading ? (
              <Typography sx={{ color: colors.text }}>
                Loading profile...
              </Typography>
            ) : (
              <Stack spacing={2.5}>
                <Card
                  sx={{
                    borderRadius: 5,
                    overflow: "hidden",
                    background: colors.cardBg,
                    color: colors.text,
                    border: `1px solid ${colors.cardBorder}`,
                    boxShadow: colors.cardShadow,
                  }}
                >
                  <Box
                    sx={{
                      p: { xs: 2, sm: 3 },
                      background: colors.heroBg || colors.buttonBg,
                      color: "#fff",
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar
                        sx={{
                          width: { xs: 58, sm: 70 },
                          height: { xs: 58, sm: 70 },
                          bgcolor: "rgba(255,255,255,0.22)",
                          color: "#fff",
                          fontWeight: 900,
                          border: "2px solid rgba(255,255,255,0.45)",
                        }}
                      >
                        {initials(form.full_name, form.email)}
                      </Avatar>

                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="h5"
                          fontWeight={900}
                          sx={{
                            color: "#fff",
                            fontSize: { xs: "1.25rem", sm: "1.55rem" },
                            lineHeight: 1.15,
                            wordBreak: "break-word",
                          }}
                        >
                          {form.full_name || "Candidate Profile"}
                        </Typography>
                        <Typography
                          sx={{
                            color: "rgba(255,255,255,0.82)",
                            fontSize: 14,
                            mt: 0.4,
                          }}
                        >
                          {form.email ||
                            "Complete your profile to improve job matching"}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>

                  <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                    <Stack spacing={1.5}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 2,
                        }}
                      >
                        <Typography
                          sx={{ color: colors.text, fontWeight: 900 }}
                        >
                          Profile Complete
                        </Typography>
                        <Typography
                          sx={{ color: colors.text, fontWeight: 900 }}
                        >
                          {completion}%
                        </Typography>
                      </Box>

                      <LinearProgress
                        variant="determinate"
                        value={completion}
                        sx={{
                          height: 10,
                          borderRadius: 999,
                          backgroundColor: colors.inputBorder,
                          "& .MuiLinearProgress-bar": {
                            background: colors.buttonBg,
                            borderRadius: 999,
                          },
                        }}
                      />

                      <Stack
                        direction="row"
                        spacing={1}
                        useFlexGap
                        flexWrap="wrap"
                      >
                        <Chip
                          label={
                            form.cv_url
                              ? "Original CV uploaded"
                              : "Original CV missing"
                          }
                          size="small"
                          sx={{
                            color: form.cv_url ? colors.text : colors.subtext,
                            background: colors.inputBg,
                            border: `1px solid ${colors.inputBorder}`,
                          }}
                        />
                        <Chip
                          label={`${generatedCvs.length} ATS CV${generatedCvs.length === 1 ? "" : "s"}`}
                          size="small"
                          sx={{
                            color: colors.text,
                            background: colors.inputBg,
                            border: `1px solid ${colors.inputBorder}`,
                          }}
                        />
                        <Chip
                          label={
                            missingFields.length
                              ? `${missingFields.length} fields left`
                              : "Profile ready"
                          }
                          size="small"
                          sx={{
                            color: colors.text,
                            background: colors.inputBg,
                            border: `1px solid ${colors.inputBorder}`,
                          }}
                        />
                      </Stack>

                      {missingFields.length > 0 && (
                        <Typography
                          sx={{ color: colors.subtext, fontSize: 13 }}
                        >
                          Next: {missingFields.slice(0, 4).join(", ")}
                          {missingFields.length > 4 ? "..." : ""}
                        </Typography>
                      )}
                    </Stack>
                  </CardContent>
                </Card>

                <ProfileAccordion
                  id="personal"
                  title="Personal Information"
                  subtitle="Basic contact and career status"
                  icon={<PersonRoundedIcon />}
                  colors={colors}
                  defaultExpanded
                >
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Full Name"
                        name="full_name"
                        value={form.full_name}
                        onChange={handleChange}
                        sx={inputSx}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Phone"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        sx={inputSx}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        sx={inputSx}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth sx={selectSx}>
                        <InputLabel>Nationality</InputLabel>
                        <Select
                          name="nationality"
                          label="Nationality"
                          value={form.nationality}
                          onChange={handleChange}
                          MenuProps={menuProps}
                        >
                          {nationalityOptions.map((item) => (
                            <MenuItem key={item} value={item}>
                              {item}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    {form.nationality === "Other" && (
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Write Nationality"
                          name="nationality_other"
                          value={form.nationality_other}
                          onChange={handleChange}
                          sx={inputSx}
                        />
                      </Grid>
                    )}

                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth sx={selectSx}>
                        <InputLabel>Current Career Status</InputLabel>
                        <Select
                          name="current_position"
                          label="Current Career Status"
                          value={form.current_position}
                          onChange={handleChange}
                          MenuProps={menuProps}
                        >
                          {careerStatusOptions.map((item) => (
                            <MenuItem key={item} value={item}>
                              {item}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    {form.current_position === "Other" && (
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Write Current Career Status"
                          name="current_position_other"
                          value={form.current_position_other}
                          onChange={handleChange}
                          sx={inputSx}
                        />
                      </Grid>
                    )}

                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth sx={selectSx}>
                        <InputLabel>Desired Work Type</InputLabel>
                        <Select
                          name="desired_position"
                          label="Desired Work Type"
                          value={form.desired_position}
                          onChange={handleChange}
                          MenuProps={menuProps}
                        >
                          {desiredWorkTypeOptions.map((item) => (
                            <MenuItem key={item} value={item}>
                              {item}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    {form.desired_position === "Other" && (
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Write Desired Work Type"
                          name="desired_position_other"
                          value={form.desired_position_other}
                          onChange={handleChange}
                          sx={inputSx}
                        />
                      </Grid>
                    )}

                    <Grid item xs={12}>
                      <Box>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            mb: 1,
                          }}
                        >
                          <Typography sx={{ color: colors.subtext }}>
                            Expected Salary (BHD/month)
                          </Typography>
                          <Typography
                            sx={{ color: colors.accent, fontWeight: 700 }}
                          >
                            BHD {form.expected_salary || 0}
                          </Typography>
                        </Box>
                        <Slider
                          value={Number(form.expected_salary || 0)}
                          min={0}
                          max={5000}
                          step={50}
                          valueLabelDisplay="auto"
                          onChange={(event, value) =>
                            handleFieldValue("expected_salary", String(value))
                          }
                          sx={sliderSx}
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </ProfileAccordion>

                <ProfileAccordion
                  id="skills"
                  title="Skills & Experience"
                  subtitle="Used directly for AI job matching"
                  icon={<WorkRoundedIcon />}
                  colors={colors}
                >
                  <Stack spacing={2}>
                    <Box>
                      <Typography
                        sx={{ color: colors.text, fontWeight: 800, mb: 1 }}
                      >
                        Skills
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          gap: 1,
                          flexWrap: "wrap",
                          mb: 2,
                        }}
                      >
                        {skillOptions.map((item) => {
                          const selected = csvIncludes(form.skills, item);
                          return (
                            <Chip
                              key={item}
                              label={item}
                              variant={selected ? "filled" : "outlined"}
                              onClick={() => handleToggle("skills", item)}
                              sx={chipSx(selected)}
                            />
                          );
                        })}
                      </Box>
                      <TextField
                        fullWidth
                        label="More Skills"
                        name="skills"
                        value={form.skills}
                        onChange={(e) =>
                          handleFieldValue("skills", e.target.value)
                        }
                        onBlur={() =>
                          handleFieldValue("skills", normalizeCsv(form.skills))
                        }
                        multiline
                        rows={2}
                        sx={inputSx}
                        helperText="Use commas or new lines. Example: Sales, Excel, Communication"
                      />
                    </Box>
                    <TextField
                      fullWidth
                      label="Experience"
                      name="experience"
                      value={form.experience}
                      onChange={handleChange}
                      multiline
                      rows={4}
                      sx={inputSx}
                    />
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="LinkedIn"
                          name="linkedin"
                          value={form.linkedin}
                          onChange={handleChange}
                          sx={inputSx}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Portfolio"
                          name="portfolio"
                          value={form.portfolio}
                          onChange={handleChange}
                          sx={inputSx}
                        />
                      </Grid>
                    </Grid>
                    <TextField
                      fullWidth
                      label="Summary"
                      name="summary"
                      value={form.summary}
                      onChange={handleChange}
                      multiline
                      rows={3}
                      sx={inputSx}
                    />
                  </Stack>
                </ProfileAccordion>

                <ProfileAccordion
                  id="education"
                  title="Education"
                  subtitle="Highest education level and details"
                  icon={<SchoolRoundedIcon />}
                  colors={colors}
                >
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={5}>
                      <FormControl fullWidth sx={selectSx}>
                        <InputLabel>Highest Education Level</InputLabel>
                        <Select
                          name="education_level"
                          label="Highest Education Level"
                          value={form.education_level}
                          onChange={handleChange}
                          MenuProps={menuProps}
                        >
                          {educationLevelOptions.map((item) => (
                            <MenuItem key={item} value={item}>
                              {item}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={7}>
                      <TextField
                        fullWidth
                        label="Education Details"
                        name="education"
                        value={form.education}
                        onChange={handleChange}
                        sx={inputSx}
                      />
                    </Grid>
                  </Grid>
                </ProfileAccordion>

                <ProfileAccordion
                  id="preferences"
                  title="Job Preferences"
                  subtitle="Improve recommendations and match score"
                  icon={<TuneRoundedIcon />}
                  colors={colors}
                >
                  <Stack spacing={2.5}>
                    <Box>
                      <Typography
                        sx={{ color: colors.text, fontWeight: 800, mb: 1 }}
                      >
                        Preferred Job Titles
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          gap: 1,
                          flexWrap: "wrap",
                          mb: 2,
                        }}
                      >
                        {preferredJobTitleOptions.map((item) => {
                          const selected = csvIncludes(
                            form.preferred_job_titles,
                            item,
                          );
                          return (
                            <Chip
                              key={item}
                              label={item}
                              variant={selected ? "filled" : "outlined"}
                              onClick={() =>
                                handleToggle("preferred_job_titles", item)
                              }
                              sx={chipSx(selected)}
                            />
                          );
                        })}
                      </Box>
                      <TextField
                        fullWidth
                        label="Other Preferred Job Titles"
                        name="preferred_job_titles"
                        value={form.preferred_job_titles}
                        onChange={handleChange}
                        onBlur={() =>
                          handleFieldValue(
                            "preferred_job_titles",
                            normalizeCsv(form.preferred_job_titles),
                          )
                        }
                        sx={inputSx}
                        helperText="Type titles separated by commas. Example: Office Assistant, HR Officer, Sales Executive"
                      />
                    </Box>

                    <Divider sx={{ borderColor: colors.cardBorder }} />

                    <Box>
                      <Typography
                        sx={{ color: colors.text, fontWeight: 800, mb: 1 }}
                      >
                        Industries
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          gap: 1,
                          flexWrap: "wrap",
                          mb: 2,
                        }}
                      >
                        {industryOptions.map((item) => {
                          const selected = csvIncludes(
                            form.preferred_industries,
                            item,
                          );
                          return (
                            <Chip
                              key={item}
                              label={item}
                              variant={selected ? "filled" : "outlined"}
                              onClick={() =>
                                handleToggle("preferred_industries", item)
                              }
                              sx={chipSx(selected)}
                            />
                          );
                        })}
                      </Box>
                      <TextField
                        fullWidth
                        label="Other Industries"
                        name="preferred_industries"
                        value={form.preferred_industries}
                        onChange={handleChange}
                        onBlur={() =>
                          handleFieldValue(
                            "preferred_industries",
                            normalizeCsv(form.preferred_industries),
                          )
                        }
                        sx={inputSx}
                      />
                    </Box>

                    <Divider sx={{ borderColor: colors.cardBorder }} />

                    <Box>
                      <Typography
                        sx={{ color: colors.text, fontWeight: 800, mb: 1 }}
                      >
                        Preferred Job Type
                      </Typography>
                      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                        {desiredWorkTypeOptions.map((item) => {
                          const selected = csvIncludes(
                            form.preferred_job_types,
                            item,
                          );
                          return (
                            <Chip
                              key={item}
                              label={item}
                              variant={selected ? "filled" : "outlined"}
                              onClick={() =>
                                handleToggle("preferred_job_types", item)
                              }
                              sx={chipSx(selected)}
                            />
                          );
                        })}
                      </Box>
                    </Box>

                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Preferred Locations"
                          name="preferred_locations"
                          value={form.preferred_locations}
                          onChange={handleChange}
                          sx={inputSx}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Availability"
                          name="availability"
                          value={form.availability}
                          onChange={handleChange}
                          sx={inputSx}
                        />
                      </Grid>
                    </Grid>

                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth sx={selectSx}>
                          <InputLabel>Work Type Preference</InputLabel>
                          <Select
                            name="work_type_preference"
                            label="Work Type Preference"
                            value={form.work_type_preference}
                            onChange={handleChange}
                            MenuProps={menuProps}
                          >
                            {desiredWorkTypeOptions.map((item) => (
                              <MenuItem key={item} value={item}>
                                {item}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>

                    <Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 1,
                        }}
                      >
                        <Typography sx={{ color: colors.subtext }}>
                          Minimum Salary (BHD/month)
                        </Typography>
                        <Typography
                          sx={{ color: colors.accent, fontWeight: 700 }}
                        >
                          BHD {form.minimum_salary || form.expected_salary || 0}
                        </Typography>
                      </Box>
                      <Slider
                        value={Number(
                          form.minimum_salary || form.expected_salary || 0,
                        )}
                        min={0}
                        max={5000}
                        step={50}
                        valueLabelDisplay="auto"
                        onChange={(event, value) =>
                          handleFieldValue("minimum_salary", String(value))
                        }
                        sx={sliderSx}
                      />
                    </Box>

                    <Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 1,
                        }}
                      >
                        <Typography sx={{ color: colors.subtext }}>
                          AI Match Threshold
                        </Typography>
                        <Typography
                          sx={{ color: colors.accent, fontWeight: 700 }}
                        >
                          {form.ai_match_threshold || 75}%+
                        </Typography>
                      </Box>
                      <Slider
                        value={Number(form.ai_match_threshold || 75)}
                        min={50}
                        max={100}
                        step={5}
                        valueLabelDisplay="auto"
                        onChange={(event, value) =>
                          handleFieldValue("ai_match_threshold", String(value))
                        }
                        sx={sliderSx}
                      />
                      <Typography sx={{ color: colors.subtext, fontSize: 13 }}>
                        Later, AI can suggest jobs matching this percentage or
                        higher.
                      </Typography>
                    </Box>
                  </Stack>
                </ProfileAccordion>

                <ProfileAccordion
                  id="original-cv"
                  title="Original CV"
                  subtitle={
                    form.cv_url
                      ? "Saved and ready to open"
                      : "Upload your main CV"
                  }
                  icon={<DescriptionRoundedIcon />}
                  colors={colors}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      p: { xs: 2, sm: 2.5 },
                      borderRadius: 4,
                      background: colors.inputBg,
                      border: `1px dashed ${colors.inputBorder}`,
                    }}
                  >
                    <Stack
                      direction={{ xs: "column", md: "row" }}
                      spacing={2}
                      alignItems={{ xs: "stretch", md: "center" }}
                    >
                      <Box
                        sx={{
                          width: 54,
                          height: 54,
                          borderRadius: 3,
                          display: { xs: "none", md: "grid" },
                          placeItems: "center",
                          background: colors.buttonBg,
                          color: "#fff",
                          flexShrink: 0,
                        }}
                      >
                        <InsertDriveFileRoundedIcon />
                      </Box>

                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          sx={{ color: colors.text, fontWeight: 900 }}
                        >
                          {form.cv_url ? "CV uploaded" : "No CV uploaded yet"}
                        </Typography>
                        <Typography
                          sx={{
                            color: colors.subtext,
                            fontSize: 14,
                            mt: 0.4,
                            wordBreak: "break-word",
                          }}
                        >
                          {selectedCV
                            ? `Selected file: ${selectedCV.name}`
                            : form.cv_url
                              ? "Your current CV is saved in Supabase Storage."
                              : "Choose a PDF/DOC/DOCX file, then click Upload CV."}
                        </Typography>
                      </Box>

                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={1}
                        sx={{ width: { xs: "100%", md: "auto" } }}
                      >
                        <Button
                          variant="outlined"
                          component="label"
                          startIcon={<CloudUploadRoundedIcon />}
                          sx={outlineBtnSx}
                          fullWidth
                        >
                          Choose CV
                          <input
                            hidden
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={handleCVSelect}
                          />
                        </Button>
                        <Button
                          variant="contained"
                          sx={primaryBtnSx}
                          onClick={handleUploadCV}
                          disabled={!selectedCV || uploadingCV}
                          fullWidth
                        >
                          {uploadingCV ? "Uploading..." : "Upload"}
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<OpenInNewRoundedIcon />}
                          sx={outlineBtnSx}
                          disabled={!form.cv_url}
                          onClick={() =>
                            window.open(form.cv_url, "_blank", "noreferrer")
                          }
                          fullWidth
                        >
                          Open
                        </Button>
                      </Stack>
                    </Stack>

                    {form.cv_url && (
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        sx={{ mt: 2 }}
                      >
                        <CheckCircleRoundedIcon
                          sx={{ color: colors.accent, fontSize: 18 }}
                        />
                        <Typography
                          sx={{ color: colors.subtext, fontSize: 13 }}
                        >
                          Current CV is saved permanently.
                        </Typography>
                      </Stack>
                    )}
                  </Paper>
                </ProfileAccordion>

                <ProfileAccordion
                  id="ats-cvs"
                  title="Saved ATS CVs"
                  subtitle={`${generatedCvs.length} saved CV${generatedCvs.length === 1 ? "" : "s"}`}
                  icon={<ArticleRoundedIcon />}
                  colors={colors}
                >
                  {generatedCvs.length === 0 ? (
                    <Typography sx={{ color: colors.subtext }}>
                      No ATS CVs saved yet. Generate one from Career Services.
                    </Typography>
                  ) : (
                    <Stack spacing={1}>
                      {generatedCvs.map((cv) => (
                        <Box
                          key={cv.id}
                          sx={{
                            display: "flex",
                            flexDirection: { xs: "column", sm: "row" },
                            justifyContent: "space-between",
                            alignItems: { xs: "stretch", sm: "center" },
                            gap: 2,
                            p: 1.5,
                            borderRadius: 3,
                            background: colors.inputBg,
                            border: `1px solid ${colors.inputBorder}`,
                          }}
                        >
                          <Box sx={{ minWidth: 0 }}>
                            <Typography
                              sx={{ color: colors.text, fontWeight: 800 }}
                            >
                              {cv.title || "ATS CV"}
                            </Typography>
                            <Typography
                              sx={{ color: colors.subtext, fontSize: 13 }}
                            >
                              {cv.created_at
                                ? new Date(cv.created_at).toLocaleString()
                                : ""}
                            </Typography>
                          </Box>

                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                          >
                            {cv.cv_url && (
                              <Button
                                variant="outlined"
                                href={buildGeneratedCvUrl(cv.cv_url)}
                                target="_blank"
                                rel="noreferrer"
                                sx={{
                                  color: colors.text,
                                  borderColor: colors.inputBorder,
                                  textTransform: "none",
                                }}
                              >
                                Download
                              </Button>
                            )}
                            <IconButton
                              onClick={() => handleDeleteGeneratedCv(cv.id)}
                              disabled={deletingCvId === cv.id}
                              sx={{ color: colors.subtext }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Stack>
                        </Box>
                      ))}
                    </Stack>
                  )}
                </ProfileAccordion>

                <Box
                  sx={{
                    position: { xs: "sticky", sm: "static" },
                    bottom: { xs: 12, sm: "auto" },
                    zIndex: 5,
                    pt: { xs: 0.5, sm: 0 },
                  }}
                >
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<SaveRoundedIcon />}
                    sx={{
                      ...primaryBtnSx,
                      py: 1.3,
                      borderRadius: 4,
                      boxShadow: colors.cardShadow,
                    }}
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save Profile Changes"}
                  </Button>
                </Box>
              </Stack>
            )}
          </>
        );
      }}
    </CandidateLayout>
  );
}
