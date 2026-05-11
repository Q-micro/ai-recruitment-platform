// This page provides career services for candidates, including an ATS CV builder with AI extraction and a premium AI feature section.
import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  Chip,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Stack,
  Typography,
  LinearProgress,
  Divider,
  TextField,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import CreditCardRoundedIcon from "@mui/icons-material/CreditCardRounded";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import PsychologyRoundedIcon from "@mui/icons-material/PsychologyRounded";
import WorkspacePremiumRoundedIcon from "@mui/icons-material/WorkspacePremiumRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CandidateLayout from "../../components/CandidateLayout";
import { apiFetch } from "../../api/http";

const API_BASE = "http://localhost:3001";
const WHATSAPP_NUMBER = "97336801571";
const SHARED_GRADIENT = "linear-gradient(135deg, #e4ce6c 0%, #ff6a1d 100%)";
const SHARED_SHADOW = "0 14px 30px rgba(255, 106, 29, 0.28)";

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

const emptyCertification = {
  name: "",
  issuer: "",
  date: "",
};

const emptyLanguage = {
  name: "",
  level: "Good",
};

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

const whatsappLink = (message) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

const PREMIUM_FEATURES = [
  {
    id: "quick_apply",
    title: "AI Quick Apply",
    price: "12 BD",
    description:
      "Let AI prepare a smart application message and highlight the best jobs for your profile.",
    icon: <BoltRoundedIcon sx={{ fontSize: 44 }} />,
  },
  {
    id: "interview_coach",
    title: "AI Interview Coach",
    price: "8 BD",
    description:
      "Generate role-specific interview questions, model answers, and practice tips.",
    icon: <PsychologyRoundedIcon sx={{ fontSize: 44 }} />,
  },
  {
    id: "career_analysis",
    title: "AI Career Path Analysis",
    price: "15 BD",
    description:
      "Get an AI profile review with suggested roles, missing skills, and next steps.",
    icon: <AutoAwesomeRoundedIcon sx={{ fontSize: 44 }} />,
  },
  {
    id: "priority_matching",
    title: "Priority Matching",
    price: "20 BD",
    description:
      "Boost your profile visibility for matching opportunities and recruiter review.",
    icon: <WorkspacePremiumRoundedIcon sx={{ fontSize: 44 }} />,
  },
];

function ServiceCard({
  title,
  description,
  icon,
  buttonText,
  whatsappMessage,
  clickable = false,
}) {
  const handleOpen = () =>
    window.open(whatsappLink(whatsappMessage), "_blank", "noreferrer");

  return (
    <Card
      onClick={clickable ? handleOpen : undefined}
      sx={{
        borderRadius: 4,
        p: 0,
        overflow: "hidden",
        cursor: clickable ? "pointer" : "default",
        background: SHARED_GRADIENT,
        color: "#fff",
        boxShadow: SHARED_SHADOW,
        transition: "0.25s ease",
        "&:hover": clickable
          ? {
              transform: "translateY(-4px)",
              boxShadow: SHARED_SHADOW,
            }
          : {},
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
        >
          <Box sx={{ maxWidth: "70%" }}>
            <Typography variant="h6" fontWeight={800} sx={{ color: "#fff" }}>
              {title}
            </Typography>

            <Typography
              variant="body2"
              sx={{ mt: 1, color: "rgba(255,255,255,0.92)", lineHeight: 1.6 }}
            >
              {description}
            </Typography>

            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleOpen();
              }}
              startIcon={<WhatsAppIcon />}
              variant="contained"
              sx={{
                mt: 2,
                borderRadius: 999,
                textTransform: "none",
                px: 2.5,
                py: 1,
                background: "#fff",
                color: "#ff6a1d",
                boxShadow: "none",
                "&:hover": {
                  background: "#fff",
                  boxShadow: "none",
                  opacity: 0.95,
                },
              }}
            >
              {buttonText}
            </Button>
          </Box>

          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: 3,
              display: "grid",
              placeItems: "center",
              background: "rgba(255,255,255,0.18)",
              color: "#fff",
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function PremiumFeatureCard({ feature, unlocked, onUnlock, onUse }) {
  return (
    <Card
      sx={{
        borderRadius: 4,
        overflow: "hidden",
        background: SHARED_GRADIENT,
        color: "#fff",
        boxShadow: SHARED_SHADOW,
        transition: "0.25s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: SHARED_SHADOW,
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
            spacing={2}
          >
            <Box sx={{ minWidth: 0 }}>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ mb: 1 }}
              >
                <Chip
                  size="small"
                  icon={
                    unlocked ? <CheckCircleRoundedIcon /> : <LockRoundedIcon />
                  }
                  label={unlocked ? "Unlocked" : "Premium"}
                  sx={{
                    color: "#ff6a1d",
                    background: "#fff",
                    fontWeight: 900,
                    "& .MuiChip-icon": { color: "#ff6a1d" },
                  }}
                />
                <Chip
                  size="small"
                  label={feature.price}
                  sx={{
                    color: "#fff",
                    background: "rgba(255,255,255,0.18)",
                    border: "1px solid rgba(255,255,255,0.24)",
                    fontWeight: 900,
                  }}
                />
              </Stack>

              <Typography variant="h6" fontWeight={900} sx={{ color: "#fff" }}>
                {feature.title}
              </Typography>

              <Typography
                variant="body2"
                sx={{ mt: 1, color: "rgba(255,255,255,0.92)", lineHeight: 1.6 }}
              >
                {feature.description}
              </Typography>
            </Box>

            <Box
              sx={{
                width: 70,
                height: 70,
                borderRadius: 3,
                display: "grid",
                placeItems: "center",
                background: "rgba(255,255,255,0.18)",
                color: "#fff",
                flexShrink: 0,
              }}
            >
              {feature.icon}
            </Box>
          </Stack>

          <Button
            variant="contained"
            onClick={() => (unlocked ? onUse(feature) : onUnlock(feature))}
            startIcon={
              unlocked ? <AutoAwesomeRoundedIcon /> : <CreditCardRoundedIcon />
            }
            sx={{
              alignSelf: "flex-start",
              borderRadius: 999,
              textTransform: "none",
              px: 2.5,
              py: 1,
              background: "#fff",
              color: "#ff6a1d",
              fontWeight: 900,
              boxShadow: "none",
              "&:hover": {
                background: "#fff",
                boxShadow: "none",
                opacity: 0.95,
              },
            }}
          >
            {unlocked ? "Open Feature" : "Unlock Feature"}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}

function PremiumPaymentDialog({
  open,
  feature,
  colors,
  paying,
  paymentForm,
  setPaymentForm,
  onClose,
  onPay,
}) {
  if (!feature) return null;

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
  };

  function update(field, value) {
    setPaymentForm((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <Dialog
      open={open}
      onClose={paying ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          background: colors.cardBg,
          color: colors.text,
          border: `1px solid ${colors.cardBorder}`,
          borderRadius: 4,
        },
      }}
    >
      <DialogTitle sx={{ color: colors.text, fontWeight: 900 }}>
        Unlock {feature.title}
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Box
            sx={{
              p: 2,
              borderRadius: 3,
              background: SHARED_GRADIENT,
              color: "#fff",
              boxShadow: SHARED_SHADOW,
            }}
          >
            <Typography fontWeight={900}>{feature.title}</Typography>
            <Typography sx={{ opacity: 0.92, mt: 0.5 }}>
              {feature.description}
            </Typography>
            <Typography sx={{ mt: 1.2, fontWeight: 900 }}>
              Demo Price: {feature.price}
            </Typography>
          </Box>

          <Alert severity="info">
            Demo payment only. No real payment will be processed.
          </Alert>

          <TextField
            label="Cardholder Name"
            value={paymentForm.cardName}
            onChange={(e) => update("cardName", e.target.value)}
            fullWidth
            sx={inputSx}
          />

          <TextField
            label="Card Number"
            value={paymentForm.cardNumber}
            onChange={(e) =>
              update("cardNumber", e.target.value.replace(/[^\d\s]/g, ""))
            }
            fullWidth
            sx={inputSx}
            placeholder="4242 4242 4242 4242"
          />

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="Expiry"
                value={paymentForm.expiry}
                onChange={(e) => update("expiry", e.target.value)}
                fullWidth
                sx={inputSx}
                placeholder="MM/YY"
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                label="CVV"
                value={paymentForm.cvv}
                onChange={(e) =>
                  update("cvv", e.target.value.replace(/\D/g, "").slice(0, 4))
                }
                fullWidth
                sx={inputSx}
                placeholder="123"
              />
            </Grid>
          </Grid>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onClose}
          disabled={paying}
          sx={{ color: colors.text, textTransform: "none" }}
        >
          Cancel
        </Button>

        <Button
          onClick={onPay}
          disabled={paying}
          variant="contained"
          startIcon={<CreditCardRoundedIcon />}
          sx={{
            textTransform: "none",
            borderRadius: 3,
            background: colors.buttonBg,
            "&:hover": { background: colors.buttonHoverBg },
          }}
        >
          {paying ? "Processing..." : `Pay ${feature.price}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function experienceItemsToText(items) {
  return items
    .filter((item) => item.title || item.company || item.description)
    .map((item, index) => {
      const dates = [item.start_date, item.end_date]
        .filter(Boolean)
        .join(" - ");
      return [
        `Work Experience ${index + 1}`,
        item.title ? `Title: ${item.title}` : "",
        item.company ? `Company: ${item.company}` : "",
        item.location ? `Location: ${item.location}` : "",
        dates ? `Dates: ${dates}` : "",
        item.description ? `Description: ${item.description}` : "",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n\n");
}

function educationItemsToText(items) {
  return items
    .filter((item) => item.degree || item.institution || item.description)
    .map((item, index) => {
      const dates = [item.start_date, item.end_date]
        .filter(Boolean)
        .join(" - ");
      return [
        `Education ${index + 1}`,
        item.degree ? `Degree: ${item.degree}` : "",
        item.institution ? `Institution: ${item.institution}` : "",
        item.location ? `Location: ${item.location}` : "",
        dates ? `Dates: ${dates}` : "",
        item.description ? `Details: ${item.description}` : "",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n\n");
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
      return {
        name: parts[0] || "",
        level: parts[1] || "Good",
      };
    });
}

function textToExperienceItems(value) {
  if (!value) return [{ ...emptyExperience }];

  return [
    {
      ...emptyExperience,
      description: value,
    },
  ];
}

function textToEducationItems(value) {
  if (!value) return [{ ...emptyEducation }];

  return [
    {
      ...emptyEducation,
      description: value,
    },
  ];
}

export default function CandidateCareerServices() {
  const user = JSON.parse(localStorage.getItem("user"));
  const candidateId = user?.candidate_id;

  const [atsOpen, setAtsOpen] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [extractingCv, setExtractingCv] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [profile, setProfile] = useState(null);
  const [savedCvs, setSavedCvs] = useState([]);
  const [missingFields, setMissingFields] = useState([]);
  const [generated, setGenerated] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [selectedCvFile, setSelectedCvFile] = useState(null);
  const [err, setErr] = useState("");
  const [notice, setNotice] = useState("");
  const [premiumUnlocked, setPremiumUnlocked] = useState(
    localStorage.getItem("premium_ai_unlocked") === "true",
  );
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [selectedPremiumFeature, setSelectedPremiumFeature] = useState(null);
  const [payingPremium, setPayingPremium] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    cardName: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });
  const [cvForm, setCvForm] = useState({
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
  });

  function openPremiumPayment(feature) {
    setSelectedPremiumFeature(feature);
    setPaymentOpen(true);
    setErr("");
    setNotice("");
  }

  function closePremiumPayment() {
    if (payingPremium) return;
    setPaymentOpen(false);
    setSelectedPremiumFeature(null);
  }

  function handleUsePremiumFeature(feature) {
    setNotice(
      `${feature.title} is unlocked for this demo. Full AI workflow can be connected later.`,
    );
  }

  function handleFakePremiumPayment() {
    setErr("");

    if (
      !paymentForm.cardName.trim() ||
      paymentForm.cardNumber.replace(/\s/g, "").length < 12 ||
      !paymentForm.expiry.trim() ||
      paymentForm.cvv.length < 3
    ) {
      setErr("Please fill all demo payment fields before continuing.");
      return;
    }

    setPayingPremium(true);

    setTimeout(() => {
      localStorage.setItem("premium_ai_unlocked", "true");
      setPremiumUnlocked(true);
      setPayingPremium(false);
      setPaymentOpen(false);
      setNotice(
        `${selectedPremiumFeature?.title || "Premium feature"} unlocked successfully for demo.`,
      );
      setSelectedPremiumFeature(null);
    }, 800);
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

  function checkMissing(form) {
    const missing = [];
    if (!form.full_name?.trim()) missing.push("Full name");
    if (!form.email?.trim()) missing.push("Email");
    if (!form.phone?.trim()) missing.push("Phone");
    if (!form.location?.trim()) missing.push("Location");
    if (!form.skills?.trim()) missing.push("Skills");

    const hasExperience = form.experienceItems.some(
      (item) =>
        item.title?.trim() || item.company?.trim() || item.description?.trim(),
    );

    const hasEducation = form.educationItems.some(
      (item) =>
        item.degree?.trim() ||
        item.institution?.trim() ||
        item.description?.trim(),
    );

    if (!hasExperience) missing.push("Experience");
    if (!hasEducation) missing.push("Education");

    return missing;
  }

  function updateCvForm(nextForm) {
    setCvForm(nextForm);
    setMissingFields(checkMissing(nextForm));
  }

  function handleCvField(name, value) {
    updateCvForm({
      ...cvForm,
      [name]: value,
    });
  }

  function updateExperience(index, field, value) {
    const nextItems = cvForm.experienceItems.map((item, itemIndex) =>
      itemIndex === index ? { ...item, [field]: value } : item,
    );
    updateCvForm({ ...cvForm, experienceItems: nextItems });
  }

  function addExperience() {
    updateCvForm({
      ...cvForm,
      experienceItems: [...cvForm.experienceItems, { ...emptyExperience }],
    });
  }

  function removeExperience(index) {
    const nextItems = cvForm.experienceItems.filter(
      (_, itemIndex) => itemIndex !== index,
    );
    updateCvForm({
      ...cvForm,
      experienceItems: nextItems.length ? nextItems : [{ ...emptyExperience }],
    });
  }

  function updateEducation(index, field, value) {
    const nextItems = cvForm.educationItems.map((item, itemIndex) =>
      itemIndex === index ? { ...item, [field]: value } : item,
    );
    updateCvForm({ ...cvForm, educationItems: nextItems });
  }

  function addEducation() {
    updateCvForm({
      ...cvForm,
      educationItems: [...cvForm.educationItems, { ...emptyEducation }],
    });
  }

  function removeEducation(index) {
    const nextItems = cvForm.educationItems.filter(
      (_, itemIndex) => itemIndex !== index,
    );
    updateCvForm({
      ...cvForm,
      educationItems: nextItems.length ? nextItems : [{ ...emptyEducation }],
    });
  }

  function updateCertification(index, field, value) {
    const nextItems = cvForm.certificationItems.map((item, itemIndex) =>
      itemIndex === index ? { ...item, [field]: value } : item,
    );
    updateCvForm({ ...cvForm, certificationItems: nextItems });
  }

  function addCertification() {
    updateCvForm({
      ...cvForm,
      certificationItems: [
        ...cvForm.certificationItems,
        { ...emptyCertification },
      ],
    });
  }

  function removeCertification(index) {
    updateCvForm({
      ...cvForm,
      certificationItems: cvForm.certificationItems.filter(
        (_, itemIndex) => itemIndex !== index,
      ),
    });
  }

  function updateLanguage(index, field, value) {
    const nextItems = cvForm.languageItems.map((item, itemIndex) =>
      itemIndex === index ? { ...item, [field]: value } : item,
    );
    updateCvForm({ ...cvForm, languageItems: nextItems });
  }

  function addLanguage() {
    updateCvForm({
      ...cvForm,
      languageItems: [...cvForm.languageItems, { ...emptyLanguage }],
    });
  }

  function removeLanguage(index) {
    const nextItems = cvForm.languageItems.filter(
      (_, itemIndex) => itemIndex !== index,
    );
    updateCvForm({
      ...cvForm,
      languageItems: nextItems.length ? nextItems : [{ ...emptyLanguage }],
    });
  }

  async function loadSavedCvs() {
    if (!candidateId) return;

    try {
      const data = await apiFetch(
        `/api/candidate/generated-cvs/${candidateId}`,
      );
      setSavedCvs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load saved CVs:", error);
    }
  }

  async function openAtsGenerator() {
    setAtsOpen(true);
    setErr("");
    setNotice("");
    setGenerated(null);
    setDownloadUrl("");
    setMissingFields([]);
    setSelectedCvFile(null);

    if (!candidateId) {
      setErr("Candidate profile not found. Please log in again.");
      return;
    }

    setLoadingProfile(true);

    try {
      const data = await apiFetch(`/api/candidate/profile/${candidateId}`);
      setProfile(data);

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

      updateCvForm(nextForm);
      await loadSavedCvs();
    } catch (error) {
      setErr(error.message || "Failed to load profile.");
    } finally {
      setLoadingProfile(false);
    }
  }

  async function handleCvUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedCvFile(file);
    setExtractingCv(true);
    setErr("");
    setNotice("");

    try {
      const formData = new FormData();
      formData.append("cv", file);
      formData.append("candidate_id", candidateId);

      const res = await apiFetch("/api/candidate/cv/extract", {
        method: "POST",
        body: formData,
      });

      const extracted = res.extracted || res;

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
                  return {
                    name: parts[0] || "",
                    level: parts[1] || "Good",
                  };
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
            ? extracted.certifications.map((item) => {
                if (typeof item === "string") {
                  return {
                    name: item,
                    issuer: "",
                    date: "",
                  };
                }

                return {
                  name: item.name || "",
                  issuer: item.issuer || "",
                  date: item.date || "",
                };
              })
            : cvForm.certificationItems,
      };

      updateCvForm(nextForm);
      setNotice(
        "CV scanned successfully. Review the fields before generating.",
      );
    } catch (error) {
      setErr(
        error.message ||
          "CV scan failed. You can still fill the fields manually.",
      );
    } finally {
      setExtractingCv(false);
    }
  }

  async function handleGenerateAtsCv() {
    setErr("");
    setNotice("");
    setGenerated(null);
    setDownloadUrl("");

    if (!candidateId) {
      setErr("Candidate profile not found. Please log in again.");
      return;
    }

    const missing = checkMissing(cvForm);
    setMissingFields(missing);

    if (missing.length > 0) {
      setErr(
        "Please fill the missing CV information before generating your ATS CV.",
      );
      return;
    }

    setGenerating(true);

    try {
      const res = await apiFetch("/api/candidate/ats-cv/generate", {
        method: "POST",
        body: JSON.stringify({
          candidate_id: candidateId,
          edited_cv_data: buildCvPayload(cvForm),
        }),
      });

      setGenerated(res.generated);
      setDownloadUrl(res.download_url ? `${API_BASE}${res.download_url}` : "");
      setNotice("ATS PDF generated and saved successfully.");

      await loadSavedCvs();
    } catch (error) {
      setErr(error.message || "Failed to generate ATS CV");
    } finally {
      setGenerating(false);
    }
  }

  useEffect(() => {
    loadSavedCvs();
  }, [candidateId]);

  return (
    <CandidateLayout>
      {(colors) => {
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
        };

        return (
          <>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card
                  onClick={openAtsGenerator}
                  sx={{
                    borderRadius: 4,
                    overflow: "hidden",
                    cursor: "pointer",
                    background: SHARED_GRADIENT,
                    color: "#fff",
                    boxShadow: SHARED_SHADOW,
                    transition: "0.25s ease",
                    "&:hover": { transform: "translateY(-4px)" },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      spacing={2}
                    >
                      <Box sx={{ maxWidth: "72%" }}>
                        <Typography variant="h6" fontWeight={800}>
                          ATS CV Builder
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ mt: 1, opacity: 0.92, lineHeight: 1.6 }}
                        >
                          Create a polished ATS-friendly CV from your profile,
                          review the details, and save the final PDF.
                        </Typography>
                        <Button
                          variant="contained"
                          onClick={(e) => {
                            e.stopPropagation();
                            openAtsGenerator();
                          }}
                          sx={{
                            mt: 2,
                            borderRadius: 999,
                            textTransform: "none",
                            color: "#ff6a1d",
                            background: "#fff",
                            boxShadow: "none",
                            "&:hover": {
                              background: "#fff",
                              boxShadow: "none",
                              opacity: 0.95,
                            },
                          }}
                        >
                          Create My ATS CV
                        </Button>
                      </Box>
                      <Box sx={{ color: "#fff", opacity: 0.95 }}>
                        <DescriptionOutlinedIcon sx={{ fontSize: 72 }} />
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <ServiceCard
                  title="Career Consultation"
                  description="Book a one-on-one session to review your career goals, job search strategy, and next steps."
                  icon={<WorkOutlineIcon sx={{ fontSize: 48 }} />}
                  buttonText="Book Consultation"
                  clickable
                  whatsappMessage="Hello, I would like to book a career consultation."
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <ServiceCard
                  title="Interview Preparation"
                  description="Practice common interview questions, improve confidence, and get guidance tailored to your role."
                  icon={<VideoCallIcon sx={{ fontSize: 48 }} />}
                  buttonText="Book Interview Prep"
                  clickable
                  whatsappMessage="Hello, I would like to book interview preparation support."
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ mt: { xs: 1, md: 2 } }}>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", sm: "center" }}
                    spacing={1}
                    sx={{ mb: 2 }}
                  >
                    <Box>
                      <Typography
                        variant="h5"
                        sx={{
                          color: colors.text,
                          fontWeight: 900,
                          letterSpacing: "-0.03em",
                        }}
                      >
                        Premium AI Services
                      </Typography>
                      <Typography sx={{ color: colors.subtext, mt: 0.5 }}>
                        Demo-only premium features for future paid plans.
                      </Typography>
                    </Box>

                    <Chip
                      icon={
                        premiumUnlocked ? (
                          <CheckCircleRoundedIcon />
                        ) : (
                          <LockRoundedIcon />
                        )
                      }
                      label={premiumUnlocked ? "Premium Unlocked" : "Locked"}
                      sx={{
                        color: premiumUnlocked ? "#22c55e" : colors.accent,
                        backgroundColor: colors.inputBg,
                        border: `1px solid ${colors.cardBorder}`,
                        fontWeight: 900,
                        "& .MuiChip-icon": {
                          color: premiumUnlocked ? "#22c55e" : colors.accent,
                        },
                      }}
                    />
                  </Stack>

                  <Grid container spacing={3}>
                    {PREMIUM_FEATURES.map((feature) => (
                      <Grid item xs={12} md={6} key={feature.id}>
                        <PremiumFeatureCard
                          feature={feature}
                          unlocked={premiumUnlocked}
                          onUnlock={openPremiumPayment}
                          onUse={handleUsePremiumFeature}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Grid>
            </Grid>

            {notice && !atsOpen && (
              <Alert severity="success" sx={{ mt: 3 }}>
                {notice}
              </Alert>
            )}

            <PremiumPaymentDialog
              open={paymentOpen}
              feature={selectedPremiumFeature}
              colors={colors}
              paying={payingPremium}
              paymentForm={paymentForm}
              setPaymentForm={setPaymentForm}
              onClose={closePremiumPayment}
              onPay={handleFakePremiumPayment}
            />

            <Dialog
              open={atsOpen}
              onClose={() => !generating && !extractingCv && setAtsOpen(false)}
              maxWidth="md"
              fullWidth
              PaperProps={{
                sx: {
                  background: colors.cardBg,
                  color: colors.text,
                  border: `1px solid ${colors.cardBorder}`,
                  borderRadius: 4,
                },
              }}
            >
              <DialogTitle sx={{ fontWeight: "bold", color: colors.text }}>
                Review & Generate ATS CV
              </DialogTitle>

              <DialogContent>
                <Stack spacing={2} sx={{ mt: 1 }}>
                  <Typography sx={{ color: colors.subtext }}>
                    Review your saved profile, optionally scan another CV, add
                    missing dates or sections, then generate a saved
                    ATS-friendly PDF.
                  </Typography>

                  {loadingProfile && <LinearProgress />}
                  {extractingCv && <LinearProgress />}
                  {generating && <LinearProgress />}
                  {err && <Alert severity="error">{err}</Alert>}
                  {notice && <Alert severity="success">{notice}</Alert>}

                  {missingFields.length > 0 && (
                    <Alert severity="warning">
                      Missing: {missingFields.join(", ")}
                    </Alert>
                  )}

                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      background: colors.inputBg,
                      border: `1px dashed ${colors.inputBorder}`,
                    }}
                  >
                    <Typography sx={{ color: colors.text, fontWeight: 700 }}>
                      Optional: Scan Another CV
                    </Typography>
                    <Typography
                      sx={{
                        color: colors.subtext,
                        fontSize: 14,
                        mt: 0.5,
                        mb: 1.5,
                      }}
                    >
                      Use this if the saved profile is missing information or
                      the candidate has a newer CV.
                    </Typography>

                    <Button
                      component="label"
                      variant="outlined"
                      disabled={extractingCv || generating}
                      sx={{
                        color: colors.text,
                        borderColor: colors.inputBorder,
                        textTransform: "none",
                        borderRadius: 3,
                      }}
                    >
                      {extractingCv
                        ? "Scanning..."
                        : selectedCvFile
                          ? "Change CV File"
                          : "Upload CV to Scan"}
                      <input
                        hidden
                        type="file"
                        accept=".pdf,.doc,.docx,image/*"
                        onChange={handleCvUpload}
                      />
                    </Button>

                    {selectedCvFile && (
                      <Typography
                        sx={{ color: colors.subtext, fontSize: 13, mt: 1 }}
                      >
                        Selected: {selectedCvFile.name}
                      </Typography>
                    )}
                  </Box>

                  {profile && (
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        background: colors.inputBg,
                        border: `1px solid ${colors.inputBorder}`,
                      }}
                    >
                      <Typography
                        sx={{ color: colors.text, fontWeight: 700, mb: 1 }}
                      >
                        Personal Information
                      </Typography>

                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <TextField
                            label="Full Name"
                            value={cvForm.full_name}
                            onChange={(e) =>
                              handleCvField("full_name", e.target.value)
                            }
                            fullWidth
                            sx={inputSx}
                          />
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <TextField
                            label="Current / Target Title"
                            value={cvForm.current_position}
                            onChange={(e) =>
                              handleCvField("current_position", e.target.value)
                            }
                            fullWidth
                            sx={inputSx}
                            placeholder="Example: Frontend Developer"
                          />
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <TextField
                            label="Email"
                            value={cvForm.email}
                            onChange={(e) =>
                              handleCvField("email", e.target.value)
                            }
                            fullWidth
                            sx={inputSx}
                          />
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <TextField
                            label="Phone"
                            value={cvForm.phone}
                            onChange={(e) =>
                              handleCvField("phone", e.target.value)
                            }
                            fullWidth
                            sx={inputSx}
                          />
                        </Grid>

                        <Grid item xs={12}>
                          <TextField
                            label="Location"
                            value={cvForm.location}
                            onChange={(e) =>
                              handleCvField("location", e.target.value)
                            }
                            fullWidth
                            sx={inputSx}
                            placeholder="Example: Manama, Bahrain"
                          />
                        </Grid>

                        <Grid item xs={12} md={4}>
                          <TextField
                            label="LinkedIn"
                            value={cvForm.linkedin}
                            onChange={(e) =>
                              handleCvField("linkedin", e.target.value)
                            }
                            fullWidth
                            sx={inputSx}
                          />
                        </Grid>

                        <Grid item xs={12} md={4}>
                          <TextField
                            label="GitHub"
                            value={cvForm.github}
                            onChange={(e) =>
                              handleCvField("github", e.target.value)
                            }
                            fullWidth
                            sx={inputSx}
                          />
                        </Grid>

                        <Grid item xs={12} md={4}>
                          <TextField
                            label="Portfolio"
                            value={cvForm.portfolio}
                            onChange={(e) =>
                              handleCvField("portfolio", e.target.value)
                            }
                            fullWidth
                            sx={inputSx}
                          />
                        </Grid>

                        <Grid item xs={12}>
                          <TextField
                            label="Professional Summary"
                            value={cvForm.summary}
                            onChange={(e) =>
                              handleCvField("summary", e.target.value)
                            }
                            multiline
                            minRows={3}
                            fullWidth
                            sx={inputSx}
                            placeholder="Leave empty if you want AI to write it from your profile."
                          />
                        </Grid>

                        <Grid item xs={12}>
                          <TextField
                            label="Skills"
                            value={cvForm.skills}
                            onChange={(e) =>
                              handleCvField("skills", e.target.value)
                            }
                            multiline
                            minRows={2}
                            fullWidth
                            sx={inputSx}
                            placeholder="Example: React, JavaScript, Customer Service, Excel"
                          />
                        </Grid>

                        <Grid item xs={12}>
                          <Box
                            sx={{
                              p: 2,
                              borderRadius: 3,
                              background: colors.cardBg,
                              border: `1px solid ${colors.cardBorder}`,
                            }}
                          >
                            <Stack
                              direction="row"
                              alignItems="center"
                              justifyContent="space-between"
                              sx={{ mb: 1 }}
                            >
                              <Typography
                                sx={{ color: colors.text, fontWeight: 700 }}
                              >
                                Languages
                              </Typography>
                              <Button
                                startIcon={<AddIcon />}
                                onClick={addLanguage}
                                sx={{
                                  color: colors.text,
                                  textTransform: "none",
                                }}
                              >
                                Add Language
                              </Button>
                            </Stack>

                            <Stack spacing={2}>
                              {cvForm.languageItems.map((item, index) => (
                                <Grid
                                  container
                                  spacing={2}
                                  key={index}
                                  alignItems="center"
                                >
                                  <Grid item xs={12} md={5}>
                                    <FormControl fullWidth sx={inputSx}>
                                      <InputLabel>Language</InputLabel>
                                      <Select
                                        label="Language"
                                        value={item.name}
                                        onChange={(e) =>
                                          updateLanguage(
                                            index,
                                            "name",
                                            e.target.value,
                                          )
                                        }
                                      >
                                        {languageOptions.map((language) => (
                                          <MenuItem
                                            key={language}
                                            value={language}
                                          >
                                            {language}
                                          </MenuItem>
                                        ))}
                                      </Select>
                                    </FormControl>
                                  </Grid>

                                  <Grid item xs={12} md={5}>
                                    <FormControl fullWidth sx={inputSx}>
                                      <InputLabel>Level</InputLabel>
                                      <Select
                                        label="Level"
                                        value={item.level}
                                        onChange={(e) =>
                                          updateLanguage(
                                            index,
                                            "level",
                                            e.target.value,
                                          )
                                        }
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
                                      onClick={() => removeLanguage(index)}
                                      sx={{ color: colors.subtext }}
                                    >
                                      <DeleteIcon />
                                    </IconButton>
                                  </Grid>
                                </Grid>
                              ))}
                            </Stack>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>
                  )}

                  {profile && (
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        background: colors.inputBg,
                        border: `1px solid ${colors.inputBorder}`,
                      }}
                    >
                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        sx={{ mb: 1 }}
                      >
                        <Typography
                          sx={{ color: colors.text, fontWeight: 700 }}
                        >
                          Work Experience
                        </Typography>
                        <Button
                          startIcon={<AddIcon />}
                          onClick={addExperience}
                          sx={{ color: colors.text, textTransform: "none" }}
                        >
                          Add Work
                        </Button>
                      </Stack>

                      <Stack spacing={2}>
                        {cvForm.experienceItems.map((item, index) => (
                          <Box
                            key={index}
                            sx={{
                              p: 2,
                              borderRadius: 3,
                              background: colors.cardBg,
                              border: `1px solid ${colors.cardBorder}`,
                            }}
                          >
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              alignItems="center"
                              sx={{ mb: 1 }}
                            >
                              <Typography
                                sx={{ color: colors.text, fontWeight: 700 }}
                              >
                                Work {index + 1}
                              </Typography>
                              <IconButton
                                onClick={() => removeExperience(index)}
                                sx={{ color: colors.subtext }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Stack>

                            <Grid container spacing={2}>
                              <Grid item xs={12} md={6}>
                                <TextField
                                  label="Job Title"
                                  value={item.title}
                                  onChange={(e) =>
                                    updateExperience(
                                      index,
                                      "title",
                                      e.target.value,
                                    )
                                  }
                                  fullWidth
                                  sx={inputSx}
                                />
                              </Grid>

                              <Grid item xs={12} md={6}>
                                <TextField
                                  label="Company"
                                  value={item.company}
                                  onChange={(e) =>
                                    updateExperience(
                                      index,
                                      "company",
                                      e.target.value,
                                    )
                                  }
                                  fullWidth
                                  sx={inputSx}
                                />
                              </Grid>

                              <Grid item xs={12} md={4}>
                                <TextField
                                  label="Location"
                                  value={item.location}
                                  onChange={(e) =>
                                    updateExperience(
                                      index,
                                      "location",
                                      e.target.value,
                                    )
                                  }
                                  fullWidth
                                  sx={inputSx}
                                />
                              </Grid>

                              <Grid item xs={12} md={4}>
                                <TextField
                                  label="Start Date"
                                  value={item.start_date}
                                  onChange={(e) =>
                                    updateExperience(
                                      index,
                                      "start_date",
                                      e.target.value,
                                    )
                                  }
                                  fullWidth
                                  sx={inputSx}
                                  placeholder="Example: Jan 2023"
                                />
                              </Grid>

                              <Grid item xs={12} md={4}>
                                <TextField
                                  label="End Date"
                                  value={item.end_date}
                                  onChange={(e) =>
                                    updateExperience(
                                      index,
                                      "end_date",
                                      e.target.value,
                                    )
                                  }
                                  fullWidth
                                  sx={inputSx}
                                  placeholder="Example: Present"
                                />
                              </Grid>

                              <Grid item xs={12}>
                                <TextField
                                  label="Responsibilities / Achievements"
                                  value={item.description}
                                  onChange={(e) =>
                                    updateExperience(
                                      index,
                                      "description",
                                      e.target.value,
                                    )
                                  }
                                  multiline
                                  minRows={3}
                                  fullWidth
                                  sx={inputSx}
                                />
                              </Grid>
                            </Grid>
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                  )}

                  {profile && (
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        background: colors.inputBg,
                        border: `1px solid ${colors.inputBorder}`,
                      }}
                    >
                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        sx={{ mb: 1 }}
                      >
                        <Typography
                          sx={{ color: colors.text, fontWeight: 700 }}
                        >
                          Education
                        </Typography>
                        <Button
                          startIcon={<AddIcon />}
                          onClick={addEducation}
                          sx={{ color: colors.text, textTransform: "none" }}
                        >
                          Add Education
                        </Button>
                      </Stack>

                      <Stack spacing={2}>
                        {cvForm.educationItems.map((item, index) => (
                          <Box
                            key={index}
                            sx={{
                              p: 2,
                              borderRadius: 3,
                              background: colors.cardBg,
                              border: `1px solid ${colors.cardBorder}`,
                            }}
                          >
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              alignItems="center"
                              sx={{ mb: 1 }}
                            >
                              <Typography
                                sx={{ color: colors.text, fontWeight: 700 }}
                              >
                                Education {index + 1}
                              </Typography>
                              <IconButton
                                onClick={() => removeEducation(index)}
                                sx={{ color: colors.subtext }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Stack>

                            <Grid container spacing={2}>
                              <Grid item xs={12} md={6}>
                                <TextField
                                  label="Degree / Program"
                                  value={item.degree}
                                  onChange={(e) =>
                                    updateEducation(
                                      index,
                                      "degree",
                                      e.target.value,
                                    )
                                  }
                                  fullWidth
                                  sx={inputSx}
                                />
                              </Grid>

                              <Grid item xs={12} md={6}>
                                <TextField
                                  label="Institution"
                                  value={item.institution}
                                  onChange={(e) =>
                                    updateEducation(
                                      index,
                                      "institution",
                                      e.target.value,
                                    )
                                  }
                                  fullWidth
                                  sx={inputSx}
                                />
                              </Grid>

                              <Grid item xs={12} md={4}>
                                <TextField
                                  label="Location"
                                  value={item.location}
                                  onChange={(e) =>
                                    updateEducation(
                                      index,
                                      "location",
                                      e.target.value,
                                    )
                                  }
                                  fullWidth
                                  sx={inputSx}
                                />
                              </Grid>

                              <Grid item xs={12} md={4}>
                                <TextField
                                  label="Start Date"
                                  value={item.start_date}
                                  onChange={(e) =>
                                    updateEducation(
                                      index,
                                      "start_date",
                                      e.target.value,
                                    )
                                  }
                                  fullWidth
                                  sx={inputSx}
                                />
                              </Grid>

                              <Grid item xs={12} md={4}>
                                <TextField
                                  label="End Date / Graduation"
                                  value={item.end_date}
                                  onChange={(e) =>
                                    updateEducation(
                                      index,
                                      "end_date",
                                      e.target.value,
                                    )
                                  }
                                  fullWidth
                                  sx={inputSx}
                                />
                              </Grid>

                              <Grid item xs={12}>
                                <TextField
                                  label="Education Details"
                                  value={item.description}
                                  onChange={(e) =>
                                    updateEducation(
                                      index,
                                      "description",
                                      e.target.value,
                                    )
                                  }
                                  multiline
                                  minRows={2}
                                  fullWidth
                                  sx={inputSx}
                                />
                              </Grid>
                            </Grid>
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                  )}

                  {profile && (
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        background: colors.inputBg,
                        border: `1px solid ${colors.inputBorder}`,
                      }}
                    >
                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        sx={{ mb: 1 }}
                      >
                        <Typography
                          sx={{ color: colors.text, fontWeight: 700 }}
                        >
                          Certifications Optional
                        </Typography>
                        <Button
                          startIcon={<AddIcon />}
                          onClick={addCertification}
                          sx={{ color: colors.text, textTransform: "none" }}
                        >
                          Add Certification
                        </Button>
                      </Stack>

                      <Stack spacing={2}>
                        {cvForm.certificationItems.length === 0 && (
                          <Typography sx={{ color: colors.subtext }}>
                            No certifications added. This section will be
                            skipped in the PDF.
                          </Typography>
                        )}

                        {cvForm.certificationItems.map((item, index) => (
                          <Box
                            key={index}
                            sx={{
                              p: 2,
                              borderRadius: 3,
                              background: colors.cardBg,
                              border: `1px solid ${colors.cardBorder}`,
                            }}
                          >
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              alignItems="center"
                              sx={{ mb: 1 }}
                            >
                              <Typography
                                sx={{ color: colors.text, fontWeight: 700 }}
                              >
                                Certification {index + 1}
                              </Typography>
                              <IconButton
                                onClick={() => removeCertification(index)}
                                sx={{ color: colors.subtext }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Stack>

                            <Grid container spacing={2}>
                              <Grid item xs={12} md={5}>
                                <TextField
                                  label="Certification Name"
                                  value={item.name}
                                  onChange={(e) =>
                                    updateCertification(
                                      index,
                                      "name",
                                      e.target.value,
                                    )
                                  }
                                  fullWidth
                                  sx={inputSx}
                                />
                              </Grid>

                              <Grid item xs={12} md={5}>
                                <TextField
                                  label="Issuer"
                                  value={item.issuer}
                                  onChange={(e) =>
                                    updateCertification(
                                      index,
                                      "issuer",
                                      e.target.value,
                                    )
                                  }
                                  fullWidth
                                  sx={inputSx}
                                />
                              </Grid>

                              <Grid item xs={12} md={2}>
                                <TextField
                                  label="Date"
                                  value={item.date}
                                  onChange={(e) =>
                                    updateCertification(
                                      index,
                                      "date",
                                      e.target.value,
                                    )
                                  }
                                  fullWidth
                                  sx={inputSx}
                                />
                              </Grid>
                            </Grid>
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                  )}

                  {!generated && profile && (
                    <Button
                      variant="contained"
                      onClick={handleGenerateAtsCv}
                      disabled={generating || loadingProfile || extractingCv}
                      sx={{
                        textTransform: "none",
                        background: colors.buttonBg,
                        "&:hover": { background: colors.buttonHoverBg },
                        borderRadius: 3,
                        py: 1.2,
                      }}
                    >
                      {generating
                        ? "Generating PDF..."
                        : "Generate & Save ATS PDF"}
                    </Button>
                  )}

                  {generated && (
                    <Box
                      sx={{
                        mt: 2,
                        p: 2,
                        borderRadius: 3,
                        background: colors.inputBg,
                        border: `1px solid ${colors.inputBorder}`,
                      }}
                    >
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        sx={{ color: colors.text }}
                      >
                        {generated.cv_title || "ATS-Friendly CV"}
                      </Typography>

                      <Divider sx={{ my: 2, borderColor: colors.cardBorder }} />

                      <Typography sx={{ color: colors.subtext }}>
                        Your ATS CV was generated, saved in the system, and is
                        ready to download.
                      </Typography>

                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{ mt: 2, flexWrap: "wrap", gap: 1 }}
                      >
                        {downloadUrl && (
                          <Button
                            variant="contained"
                            href={downloadUrl}
                            target="_blank"
                            rel="noreferrer"
                            sx={{
                              textTransform: "none",
                              background: colors.buttonBg,
                              "&:hover": { background: colors.buttonHoverBg },
                            }}
                          >
                            Download PDF
                          </Button>
                        )}

                        <Button
                          variant="outlined"
                          onClick={handleGenerateAtsCv}
                          disabled={generating}
                          sx={{
                            color: colors.text,
                            borderColor: colors.inputBorder,
                            textTransform: "none",
                          }}
                        >
                          Regenerate PDF
                        </Button>
                      </Stack>

                      {generated.improvement_notes?.length > 0 && (
                        <>
                          <Typography
                            fontWeight="bold"
                            sx={{ color: colors.text, mt: 3, mb: 1 }}
                          >
                            Improvement Notes
                          </Typography>
                          <Stack spacing={0.5}>
                            {generated.improvement_notes.map((item, index) => (
                              <Typography
                                key={index}
                                sx={{ color: colors.subtext }}
                              >
                                • {item}
                              </Typography>
                            ))}
                          </Stack>
                        </>
                      )}

                      {generated.honesty_check && (
                        <Alert severity="info" sx={{ mt: 2 }}>
                          {generated.honesty_check}
                        </Alert>
                      )}
                    </Box>
                  )}
                </Stack>
              </DialogContent>

              <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button
                  onClick={() => setAtsOpen(false)}
                  disabled={generating || extractingCv}
                  sx={{ color: colors.text, textTransform: "none" }}
                >
                  Close
                </Button>
              </DialogActions>
            </Dialog>
          </>
        );
      }}
    </CandidateLayout>
  );
}
