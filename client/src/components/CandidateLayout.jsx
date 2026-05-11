/**
 * The `CandidateLayout` component in this code snippet is a form layout for candidates to fill in
 * their profile information, including basic info, career profile, and job preferences, with
 * validation and saving functionality.
 * @returns The `CandidateLayout` component is being returned. It is a functional component that serves
 * as the layout for the candidate profile page. The component includes form fields for the candidate
 * to input their personal information, career profile details, and job preferences. It also allows for
 * uploading a CV for automatic filling of certain fields.
 */
import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Stack,
  Typography,
  Alert,
  Paper,
  useMediaQuery,
  Stepper,
  Step,
  StepLabel,
  Chip,
  Divider,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
} from "@mui/material";
import CandidateNavbar from "./CandidateNavbar";
import { apiFetch } from "../api/http";
import { getCandidateTheme } from "./candidateTheme";

// Option lists for form fields
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

// For current career status, we can use the same list as desired work type, but with some adjustments
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

// For desired work type, we can use the same list as career status, but with some adjustments
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

// For preferred job types, we can use the same list as desired work type
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

// For preferred industries, we can use the same list as job industries in the admin panel
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

//  For preferred job types, we can use the same list as desired work type
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

//  For education level, we can use a standard list of education levels
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

// Utility functions for handling CSV values in form fields
function splitCsv(value) {
  if (!value) return [];
  return value
    .split(/[,\n]/)
    .map((x) => x.trim())
    .filter(Boolean);
}

// Normalize CSV by splitting, trimming, deduplicating, and joining back
function normalizeCsv(value) {
  return Array.from(new Set(splitCsv(value))).join(", ");
}
//Toggle an item in a CSV string: if it exists, remove it; if it doesn't exist, add it
function toggleCsvValue(currentValue, item) {
  const items = splitCsv(currentValue);
  const exists = items.includes(item);
  const nextItems = exists ? items.filter((x) => x !== item) : [...items, item];
  return Array.from(new Set(nextItems)).join(", ");
}

//Check if a CSV string includes a specific item
function csvIncludes(currentValue, item) {
  return splitCsv(currentValue).includes(item);
}

// Functions to join extracted experience and education arrays into formatted strings for the form fields
function joinExtractedExperience(experience) {
  if (!Array.isArray(experience)) return "";
  return experience
    .map((item) => {
      const title = item.title || "";
      const company = item.company ? ` at ${item.company}` : "";
      const start = item.start_date || "";
      const end = item.end_date || "Present";
      const dates = start ? ` (${start} - ${end})` : "";
      const description = item.description ? `\n${item.description}` : "";
      return `${title}${company}${dates}${description}`.trim();
    })
    .filter(Boolean)
    .join("\n\n");
}

// For education, we can join degree, institution, and year into a single line for each entry
function joinExtractedEducation(education) {
  if (!Array.isArray(education)) return "";
  return education
    .map((item) => {
      const degree = item.degree || "";
      const institution = item.institution ? ` - ${item.institution}` : "";
      const year = item.year ? ` (${item.year})` : "";
      return `${degree}${institution}${year}`.trim();
    })
    .filter(Boolean)
    .join("\n");
}

// Main CandidateLayout component
export default function CandidateLayout({ children, noShell = false }) {
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");

  const [mode, setMode] = useState(() => {
    return (
      localStorage.getItem("candidate-theme-mode") ||
      (prefersDark ? "dark" : "light")
    );
  });

  const colors = useMemo(() => getCandidateTheme(mode), [mode]);

  useEffect(() => {
    localStorage.setItem("candidate-theme-mode", mode);
  }, [mode]);

  const user = JSON.parse(localStorage.getItem("user"));
  const candidateId = user?.candidate_id;

  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [activeStep, setActiveStep] = useState(0);
  const [cvFile, setCvFile] = useState(null);
  const [extractingCv, setExtractingCv] = useState(false);

  const [form, setForm] = useState({
    full_name: user?.name || "",
    phone: "",
    email: user?.email || "",
    nationality: "",
    nationality_other: "",
    current_position: "",
    current_position_other: "",
    desired_position: "",
    desired_position_other: "",
    expected_salary: "",
    candidate_status: "new",
    skills: "",
    experience: "",
    education: "",
    education_level: "",
    linkedin: "",
    portfolio: "",
    cv_url: "",
    preferred_job_titles: "",
    preferred_industries: "",
    preferred_job_types: "",
    minimum_salary: "",
    ai_match_threshold: 75,
    cv_extracted: false,
    profile_completed: false,
  });

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    async function loadProfile() {
      if (!candidateId) {
        setLoadingProfile(false);
        return;
      }

      try {
        const data = await apiFetch(`/api/candidate/profile/${candidateId}`);
        console.log("CANDIDATE ID:", candidateId);
        console.log("PROFILE COMPLETED FROM API:", data.profile_completed);
        console.log("FULL PROFILE:", data);
        setProfile(data);

        setForm((prev) => ({
          ...prev,
          full_name: data.full_name || user?.name || "",
          phone: data.phone || "",
          email: data.email || user?.email || "",
          nationality: data.nationality || "",
          current_position: data.current_position || "",
          desired_position: data.desired_position || "",
          expected_salary: data.expected_salary || "",
          candidate_status: data.candidate_status || "new",
          skills: data.skills || "",
          experience: data.experience || "",
          education: data.education || "",
          linkedin: data.linkedin || "",
          portfolio: data.portfolio || "",
          cv_url: data.cv_url || "",
          preferred_job_titles: data.preferred_job_titles || "",
          preferred_industries: data.preferred_industries || "",
          preferred_job_types: data.preferred_job_types || "",
          minimum_salary: data.minimum_salary || data.expected_salary || "",
          ai_match_threshold: data.ai_match_threshold || 75,
          cv_extracted: Boolean(data.cv_extracted),
          profile_completed: Boolean(data.profile_completed),
        }));
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingProfile(false);
      }
    }

    loadProfile();
  }, [candidateId, user?.name, user?.email]);

  function isIncomplete() {
    if (!profile) return true;

    if (profile.profile_completed === true) return false;

    return true;
  }

  const forceOpen =
    !loadingProfile &&
    Boolean(candidateId) &&
    profile &&
    profile.profile_completed !== true;

  function handleChange(e) {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  function handleFieldValue(name, value) {
    setForm((prev) => ({
      ...prev,
      [name]: value || "",
    }));
  }

  function handleToggle(name, value) {
    setForm((prev) => ({
      ...prev,
      [name]: toggleCsvValue(prev[name], value),
    }));
  }

  async function handleCvChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setCvFile(file);
    setErr("");
    setNotice("");
    setExtractingCv(true);

    try {
      const formData = new FormData();
      formData.append("cv", file);
      formData.append("candidate_id", candidateId);

      const res = await apiFetch("/api/candidate/cv/extract", {
        method: "POST",
        body: formData,
      });

      const extracted = res.extracted || res;

      setForm((prev) => ({
        ...prev,
        full_name: extracted.full_name || prev.full_name,
        email: extracted.email || prev.email,
        phone: extracted.phone || prev.phone,
        skills: normalizeCsv(
          [
            prev.skills,
            Array.isArray(extracted.skills)
              ? extracted.skills.join(", ")
              : extracted.skills,
          ]
            .filter(Boolean)
            .join(", "),
        ),
        experience: extracted.experience
          ? joinExtractedExperience(extracted.experience) ||
            extracted.experience
          : prev.experience,
        education: extracted.education
          ? joinExtractedEducation(extracted.education) || extracted.education
          : prev.education,
        linkedin: extracted.linkedin || prev.linkedin,
        portfolio: extracted.portfolio || prev.portfolio,
        current_position: extracted.current_position || prev.current_position,
        cv_url: res.cv_url || prev.cv_url,
        cv_extracted: true,
      }));

      setNotice(
        "CV scanned successfully. Please review the filled fields before saving.",
      );
    } catch (error) {
      setErr(
        error.message ||
          "CV upload worked, but extraction failed. You can still fill the form manually.",
      );
    } finally {
      setExtractingCv(false);
    }
  }

  function validateRequiredFields() {
    if (!form.phone) return "Phone required";
    if (!form.nationality) return "Nationality required";
    if (form.nationality === "Other" && !form.nationality_other)
      return "Please write your nationality";
    if (!form.current_position) return "Current career status required";
    if (form.current_position === "Other" && !form.current_position_other)
      return "Please write your current career status";
    if (!form.desired_position) return "Desired work type required";
    if (form.desired_position === "Other" && !form.desired_position_other)
      return "Please write your desired work type";
    if (!form.expected_salary) return "Expected salary required";
    return "";
  }

  function validateCareerProfile() {
    if (!form.skills) return "Please add at least one skill";
    if (!form.education_level && !form.education)
      return "Please add your education";
    return "";
  }

  function validateJobPreferences() {
    if (!form.preferred_job_titles)
      return "Please select or write at least one preferred job title";
    if (!form.preferred_job_types)
      return "Please select at least one preferred job type";
    return "";
  }

  function handleNext() {
    setErr("");

    if (activeStep === 0) {
      const validationError = validateRequiredFields();
      if (validationError) return setErr(validationError);
    }

    if (activeStep === 1) {
      const validationError = validateCareerProfile();
      if (validationError) return setErr(validationError);
    }

    setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
  }

  function handleBack() {
    setErr("");
    setActiveStep((prev) => Math.max(prev - 1, 0));
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

  async function handleSave(e) {
    e.preventDefault();
    setErr("");
    setSaving(true);

    try {
      const basicError = validateRequiredFields();
      if (basicError) {
        setErr(basicError);
        setActiveStep(0);
        return;
      }

      const careerError = validateCareerProfile();
      if (careerError) {
        setErr(careerError);
        setActiveStep(1);
        return;
      }

      const preferenceError = validateJobPreferences();
      if (preferenceError) {
        setErr(preferenceError);
        setActiveStep(2);
        return;
      }

      const res = await apiFetch(`/api/candidate/profile/${candidateId}`, {
        method: "PUT",
        body: JSON.stringify({
          ...profile,
          ...form,
          full_name: form.full_name,
          email: form.email,
          phone: form.phone,
          nationality: finalNationality(),
          current_position: finalCurrentPosition(),
          desired_position: finalDesiredPosition(),
          skills: normalizeCsv(form.skills),
          education: buildEducationText(),
          candidate_status: "applied",
          expected_salary: Number(form.expected_salary),
          minimum_salary: form.minimum_salary
            ? Number(form.minimum_salary)
            : Number(form.expected_salary),
          ai_match_threshold: Number(form.ai_match_threshold || 75),
          cv_extracted: Boolean(form.cv_extracted),
          profile_completed: true,
        }),
      });

      const updatedProfile = {
        ...(res.profile || res),
        profile_completed: true,
      };

      setProfile(updatedProfile);
      setForm((prev) => ({
        ...prev,
        profile_completed: true,
      }));
      setNotice("Profile saved successfully.");
    } catch (error) {
      setErr(error.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  const inputSx = {
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
    "& .MuiInputBase-input": {
      color: colors.text,
      WebkitTextFillColor: `${colors.text} !important`,
    },
    "& .MuiInputBase-input::placeholder": {
      color: colors.subtext,
      opacity: 0.9,
    },
    "& .MuiFormHelperText-root": { color: colors.subtext },
  };

  const selectSx = {
    ...inputSx,
    "& .MuiSelect-select": {
      color: colors.text,
      WebkitTextFillColor: `${colors.text} !important`,
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
    "&:hover": { background: selected ? colors.buttonHoverBg : colors.shellBg },
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

  const steps = ["Basic Info", "Career Profile", "Job Preferences"];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: colors.pageBg,
        animation: colors.bgAnim,
        color: colors.text,
      }}
    >
      <CandidateNavbar mode={mode} setMode={setMode} colors={colors} />

      <Box
        sx={{
          px: { xs: 1.5, sm: 2, md: 4 },
          pt: { xs: 2, md: 4 },
          pb: { xs: 11, md: 4 },
          minHeight: "calc(100vh - 72px)",
        }}
      >
        {noShell ? (
          typeof children === "function" ? (
            children(colors, mode)
          ) : (
            children
          )
        ) : (
          <Paper
            elevation={0}
            sx={{
              background: colors.shellBg,
              border: `1px solid ${colors.cardBorder}`,
              borderRadius: 5,
              backdropFilter: "blur(16px)",
              backgroundImage: "none",
              p: { xs: 1.5, sm: 2, md: 3 },
            }}
          >
            {typeof children === "function" ? children(colors, mode) : children}
          </Paper>
        )}
      </Box>

      <Dialog
        open={forceOpen}
        maxWidth="md"
        fullWidth
        disableEscapeKeyDown
        PaperProps={{
          sx: {
            background: colors.cardBg,
            color: colors.text,
            border: `1px solid ${colors.cardBorder}`,
            borderRadius: 4,
            backdropFilter: "blur(18px)",
          },
        }}
      >
        <DialogTitle sx={{ color: colors.text, fontWeight: "bold" }}>
          Complete Your Career Profile
        </DialogTitle>

        <DialogContent>
          <Typography sx={{ mb: 2, color: colors.subtext }}>
            Add your details once so we can match you with better jobs and help
            with CV tools later.
          </Typography>

          <Stepper
            activeStep={activeStep}
            alternativeLabel
            sx={{
              mb: 3,
              "& .MuiStepLabel-label": { color: colors.subtext },
              "& .MuiStepLabel-label.Mui-active": { color: colors.text },
              "& .MuiStepLabel-label.Mui-completed": { color: colors.text },
              "& .MuiStepIcon-root": { color: colors.inputBorder },
              "& .MuiStepIcon-root.Mui-active": { color: colors.accent },
              "& .MuiStepIcon-root.Mui-completed": { color: colors.accent },
              "& .MuiStepIcon-text": { fill: "#FFFFFF" },
            }}
          >
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {err && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {err}
            </Alert>
          )}
          {notice && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {notice}
            </Alert>
          )}
          {extractingCv && <LinearProgress sx={{ mb: 2 }} />}

          <Box component="form" onSubmit={handleSave}>
            <Stack spacing={2} mt={1}>
              {activeStep === 0 && (
                <>
                  <Box
                    sx={{
                      p: 2,
                      border: `1px dashed ${colors.inputBorder}`,
                      borderRadius: 3,
                      background: colors.inputBg,
                    }}
                  >
                    <Typography sx={{ color: colors.text, fontWeight: 700 }}>
                      Upload CV Optional
                    </Typography>
                    <Typography
                      sx={{
                        color: colors.subtext,
                        fontSize: 14,
                        mt: 0.5,
                        mb: 1.5,
                      }}
                    >
                      Upload your CV to auto-fill skills, experience, education,
                      phone, LinkedIn, and portfolio. You can still edit
                      everything before saving.
                    </Typography>
                    <Button
                      component="label"
                      variant="outlined"
                      disabled={extractingCv}
                      sx={{
                        color: colors.text,
                        borderColor: colors.inputBorder,
                        textTransform: "none",
                        borderRadius: 3,
                        py: 1.1,
                      }}
                    >
                      {extractingCv
                        ? "Scanning CV..."
                        : cvFile
                          ? "Change CV File"
                          : "Choose CV File"}
                      <input
                        hidden
                        type="file"
                        accept=".pdf,.doc,.docx,image/*"
                        onChange={handleCvChange}
                      />
                    </Button>
                    {cvFile && (
                      <Typography
                        sx={{ color: colors.subtext, fontSize: 13, mt: 1 }}
                      >
                        Selected: {cvFile.name}
                      </Typography>
                    )}
                  </Box>

                  <TextField
                    label="Full Name"
                    name="full_name"
                    value={form.full_name}
                    onChange={handleChange}
                    fullWidth
                    sx={inputSx}
                  />
                  <TextField
                    label="Email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    fullWidth
                    sx={inputSx}
                  />
                  <TextField
                    label="Phone"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    fullWidth
                    sx={inputSx}
                  />

                  <FormControl fullWidth required sx={selectSx}>
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
                  {form.nationality === "Other" && (
                    <TextField
                      label="Write Nationality"
                      name="nationality_other"
                      value={form.nationality_other}
                      onChange={handleChange}
                      required
                      fullWidth
                      sx={inputSx}
                    />
                  )}

                  <FormControl fullWidth required sx={selectSx}>
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
                  {form.current_position === "Other" && (
                    <TextField
                      label="Write Current Career Status"
                      name="current_position_other"
                      value={form.current_position_other}
                      onChange={handleChange}
                      required
                      fullWidth
                      sx={inputSx}
                    />
                  )}

                  <FormControl fullWidth required sx={selectSx}>
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
                  {form.desired_position === "Other" && (
                    <TextField
                      label="Write Desired Work Type"
                      name="desired_position_other"
                      value={form.desired_position_other}
                      onChange={handleChange}
                      required
                      fullWidth
                      sx={inputSx}
                    />
                  )}

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
                </>
              )}

              {activeStep === 1 && (
                <>
                  <Typography sx={{ color: colors.text, fontWeight: 700 }}>
                    Skills
                  </Typography>
                  <Typography sx={{ color: colors.subtext, fontSize: 14 }}>
                    Pick popular skills or write your own separated by commas.
                    CV scanning can also fill this automatically.
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
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
                    label="More Skills"
                    name="skills"
                    value={form.skills}
                    onChange={(e) => handleFieldValue("skills", e.target.value)}
                    onBlur={() =>
                      handleFieldValue("skills", normalizeCsv(form.skills))
                    }
                    multiline
                    minRows={2}
                    fullWidth
                    sx={inputSx}
                    placeholder="Example: Customer Service, Sales, Microsoft Office, Communication"
                    helperText="Use commas or new lines so each skill is saved separately. Example: Sales, Excel, Communication"
                  />

                  <TextField
                    label="Experience"
                    name="experience"
                    value={form.experience}
                    onChange={handleChange}
                    multiline
                    minRows={4}
                    fullWidth
                    sx={inputSx}
                    placeholder="Add job title, company, dates, and responsibilities. CV scanning can fill this automatically."
                  />

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
                  <TextField
                    label="Education Details"
                    name="education"
                    value={form.education}
                    onChange={handleChange}
                    multiline
                    minRows={2}
                    fullWidth
                    sx={inputSx}
                    placeholder="Example: University of Bahrain, Business, expected graduation 2026"
                  />
                  <TextField
                    label="LinkedIn"
                    name="linkedin"
                    value={form.linkedin}
                    onChange={handleChange}
                    fullWidth
                    sx={inputSx}
                  />
                  <TextField
                    label="Portfolio / Personal Website"
                    name="portfolio"
                    value={form.portfolio}
                    onChange={handleChange}
                    fullWidth
                    sx={inputSx}
                  />
                </>
              )}

              {activeStep === 2 && (
                <>
                  <Typography sx={{ color: colors.text, fontWeight: 700 }}>
                    Preferred Job Titles
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
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
                    fullWidth
                    sx={inputSx}
                    helperText="Type titles separated by commas. Example: Office Assistant, HR Officer, Sales Executive"
                  />

                  <Divider sx={{ borderColor: colors.cardBorder }} />

                  <Typography sx={{ color: colors.text, fontWeight: 700 }}>
                    Industries
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
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
                    fullWidth
                    sx={inputSx}
                    helperText="Optional. Type industries separated by commas."
                  />

                  <Divider sx={{ borderColor: colors.cardBorder }} />

                  <Typography sx={{ color: colors.text, fontWeight: 700 }}>
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
                </>
              )}

              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  justifyContent: "space-between",
                  pt: 1,
                }}
              >
                <Button
                  type="button"
                  variant="outlined"
                  onClick={handleBack}
                  disabled={activeStep === 0 || saving || extractingCv}
                  sx={{
                    color: colors.text,
                    borderColor: colors.inputBorder,
                    textTransform: "none",
                    py: 1.2,
                    borderRadius: 3,
                    minWidth: 110,
                  }}
                >
                  Back
                </Button>

                {activeStep < steps.length - 1 ? (
                  <Button
                    type="button"
                    variant="contained"
                    onClick={handleNext}
                    disabled={saving || extractingCv}
                    sx={{
                      background: colors.buttonBg,
                      color: "#FFFFFF",
                      textTransform: "none",
                      py: 1.2,
                      borderRadius: 3,
                      minWidth: 160,
                      "&:hover": { background: colors.buttonHoverBg },
                    }}
                  >
                    Continue
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={saving || extractingCv}
                    sx={{
                      background: colors.buttonBg,
                      color: "#FFFFFF",
                      textTransform: "none",
                      py: 1.2,
                      borderRadius: 3,
                      minWidth: 160,
                      "&:hover": { background: colors.buttonHoverBg },
                    }}
                  >
                    {saving ? "Saving..." : "Save & Continue"}
                  </Button>
                )}
              </Box>
            </Stack>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
