/**
 * The `EmployerRegister` function in this React component handles the registration process for
 * employers, allowing them to submit their company details for approval and access employer features.
 * @returns The `EmployerRegister` component is being returned. It consists of a form for employer
 * registration with various input fields such as company name, commercial registration number, email,
 * phone number, website, industry, location, and description. The form also includes buttons for
 * submitting the registration, displaying alerts for different statuses (loading, pending approval,
 * approved, rejected), and providing information about the registration process. Additionally
 */

import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import VerifiedIcon from "@mui/icons-material/Verified";
import GroupsIcon from "@mui/icons-material/Groups";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { apiFetch } from "../../api/http";
import emploImg from "../../assets/emplo.png";

export default function EmployerRegister() {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const [step, setStep] = useState(1);
  const [company, setCompany] = useState(null);
  const [form, setForm] = useState({
    name: "",
    cr_number: "",
    email: "",
    phone: "",
    website: "",
    industry: "",
    location: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [loadingCompany, setLoadingCompany] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  async function loadCompany() {
    if (!user?.id || !token) return;

    try {
      setLoadingCompany(true);
      const data = await apiFetch(`/api/employer/company/${user.id}`, {
        token,
      });
      setCompany(data.company || null);

      if (data.company) {
        setForm({
          name: data.company.name || "",
          cr_number: data.company.cr_number || "",
          email: data.company.email || "",
          phone: data.company.phone || "",
          website: data.company.website || "",
          industry: data.company.industry || "",
          location: data.company.location || "",
          description: data.company.description || "",
        });
        setStep(2);
      }
    } catch (error) {
      console.error("Load company error:", error);
      setErr(error.message || "Failed to load company information");
    } finally {
      setLoadingCompany(false);
    }
  }

  useEffect(() => {
    loadCompany();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, token]);

  function handleChange(e) {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErr("");
    setMsg("");

    if (!token) {
      setErr("You are not logged in. Please login again.");
      return;
    }

    if (!user?.id) {
      setErr("Employer user ID is missing. Please login again.");
      return;
    }

    if (!form.name.trim()) {
      setErr("Company name is required.");
      return;
    }

    if (!form.cr_number.trim()) {
      setErr("Commercial Registration Number is required.");
      return;
    }

    setLoading(true);

    try {
      await apiFetch("/api/employer/company", {
        method: "POST",
        token,
        body: JSON.stringify({
          ...form,
          name: form.name.trim(),
          cr_number: form.cr_number.trim(),
          email: form.email.trim() || null,
          phone: form.phone.trim() || null,
          website: form.website.trim() || null,
          industry: form.industry.trim() || null,
          location: form.location.trim() || null,
          description: form.description.trim() || null,
          created_by_user_id: user.id,
        }),
      });

      setMsg("Company submitted successfully. Please wait for admin approval.");
      await loadCompany();
    } catch (error) {
      console.error("Submit company error:", error);
      setErr(error.message || "Failed to submit company");
    } finally {
      setLoading(false);
    }
  }

  const cardSx = {
    borderRadius: 6,
    overflow: "hidden",
    background: "rgba(255,255,255,0.88)",
    backdropFilter: "blur(16px)",
    boxShadow: "0 24px 60px rgba(112,74,31,0.14)",
    border: "1px solid rgba(255,255,255,0.7)",
  };

  const inputSx = {
    "& .MuiOutlinedInput-root": {
      backgroundColor: "#fff",
      borderRadius: 3,
      color: "#2f241b",
      "& fieldset": { borderColor: "rgba(123, 91, 69, 0.22)" },
      "&:hover fieldset": { borderColor: "#FF8A3D" },
      "&.Mui-focused fieldset": { borderColor: "#FF8A3D" },
    },
    "& .MuiInputLabel-root": { color: "#7B5B45" },
    "& .MuiInputLabel-root.Mui-focused": { color: "#FF7D29" },
    "& .MuiInputBase-input": {
      color: "#2f241b",
      WebkitTextFillColor: "#2f241b !important",
    },
    "& .MuiInputBase-input::placeholder": {
      color: "#8B6A52",
      opacity: 1,
    },
    "& .MuiFormHelperText-root": {
      color: "#7B5B45",
    },
  };

  const themedAlert = {
    borderRadius: 3,
    "& .MuiAlert-icon": { alignItems: "center" },
  };

  const featureItem = (icon, text) => (
    <Stack direction="row" spacing={1.4} alignItems="center">
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          bgcolor: "rgba(255,255,255,0.2)",
          border: "1px solid rgba(255,255,255,0.25)",
          display: "grid",
          placeItems: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Typography sx={{ fontWeight: 800 }}>{text}</Typography>
    </Stack>
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        py: { xs: 3, md: 5 },
        px: 2,
        background:
          "radial-gradient(circle at top left, rgba(255, 190, 90, 0.45), transparent 32%), linear-gradient(180deg, #fff8ef 0%, #fff 100%)",
      }}
    >
      <Box sx={{ maxWidth: 1180, mx: "auto" }}>
        <Card sx={cardSx}>
          <Grid container>
            {/* <Grid item xs={12} md={5}>
              <Box
                sx={{
                  height: "100%",
                  minHeight: { xs: "auto", md: 760 },
                  p: { xs: 3, md: 4 },
                  color: "#fff",
                  background:
                    "linear-gradient(160deg, #ff7d29 0%, #ff9d32 45%, #ffd36f 100%)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: -80,
                    right: -70,
                    width: 230,
                    height: 230,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.13)",
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    bottom: -110,
                    left: -90,
                    width: 260,
                    height: 260,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.1)",
                  }}
                />

                <Stack spacing={2.7} sx={{ height: "100%", position: "relative", zIndex: 1 }}>
                  <Chip
                    icon={<VerifiedIcon sx={{ color: "#fff !important" }} />}
                    label="Employer Portal"
                    sx={{
                      width: "fit-content",
                      color: "#fff",
                      background: "rgba(255,255,255,0.18)",
                      border: "1px solid rgba(255,255,255,0.22)",
                      fontWeight: 800,
                      px: 0.5,
                    }}
                  />

                  <Box
                    sx={{
                      width: "100%",
                      height: { xs: 270, sm: 330, md: 315 },
                      borderRadius: 7,
                      overflow: "hidden",
                      position: "relative",
                      boxShadow: "0 22px 45px rgba(82, 38, 0, 0.22)",
                      border: "1px solid rgba(255,255,255,0.28)",
                      background: "rgba(255,255,255,0.14)",
                    }}
                  >
                    <Box
                      component="img"
                      src={emploImg}
                      alt="Employer registration"
                      sx={{
                        width: "100%",
                        height: "100%",
                        display: "block",
                        objectFit: "cover",
                        objectPosition: "center",
                        transform: "scale(1.03)",
                      }}
                    />

                    <Box
                      sx={{
                        position: "absolute",
                        inset: 0,
                        background:
                          "linear-gradient(180deg, rgba(255,125,41,0.04) 0%, rgba(255,125,41,0.22) 100%)",
                      }}
                    />
                  </Box>

                  <Box>
                    <Typography
                      variant="h4"
                      fontWeight={950}
                      sx={{
                        lineHeight: 1.05,
                        textShadow: "0 3px 12px rgba(90, 38, 0, 0.18)",
                      }}
                    >
                      Build your hiring presence
                    </Typography>
                    <Typography sx={{ mt: 1.5, opacity: 0.96, lineHeight: 1.85, fontWeight: 500 }}>
                      Register your company to unlock job posting, applicant tracking, and smarter hiring tools.
                      Your profile will be reviewed by admin before full access is enabled.
                    </Typography>
                  </Box>

                  <Stack spacing={1.5} sx={{ mt: 0.5 }}>
                    {featureItem(<BusinessCenterIcon fontSize="small" />, "Post and manage jobs")}
                    {featureItem(<FilterAltIcon fontSize="small" />, "Smart AI keyword filtering")}
                    {featureItem(<TrendingUpIcon fontSize="small" />, "Candidate match scoring")}
                  </Stack>

                  <Button
                    onClick={() => setStep(2)}
                    variant="contained"
                    sx={{
                      mt: "auto",
                      width: "fit-content",
                      borderRadius: 999,
                      px: 3.4,
                      py: 1.25,
                      background: "#4a250d",
                      color: "#fff",
                      textTransform: "none",
                      fontWeight: 900,
                      boxShadow: "0 12px 26px rgba(74, 37, 13, 0.22)",
                      "&:hover": {
                        background: "#381b0b",
                        boxShadow: "0 14px 30px rgba(74, 37, 13, 0.28)",
                      },
                    }}
                  >
                    {step === 1 ? "Get Started" : "Continue"}
                  </Button>
                </Stack>
              </Box>
            </Grid> */}

            <Grid item xs={12} md={5}>
              <Box
                sx={{
                  height: "100%",
                  minHeight: { xs: "auto", md: 760 },
                  p: { xs: 3, md: 4 },
                  color: "#2f241b",
                  background:
                    "linear-gradient(180deg, #ffffff 0%, #fff8f1 100%)",
                  borderRight: "1px solid rgba(123,91,69,0.08)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* decorative circles */}
                <Box
                  sx={{
                    position: "absolute",
                    top: -80,
                    right: -70,
                    width: 230,
                    height: 230,
                    borderRadius: "50%",
                    background: "rgba(255, 183, 77, 0.08)",
                  }}
                />

                <Box
                  sx={{
                    position: "absolute",
                    bottom: -110,
                    left: -90,
                    width: 260,
                    height: 260,
                    borderRadius: "50%",
                    background: "rgba(255, 183, 77, 0.06)",
                  }}
                />

                <Stack
                  spacing={2.7}
                  sx={{
                    height: "100%",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  <Chip
                    icon={<VerifiedIcon sx={{ color: "#ff8a3d !important" }} />}
                    label="Employer Portal"
                    sx={{
                      width: "fit-content",
                      color: "#9a5b1f",
                      background: "#fff4e8",
                      border: "1px solid rgba(255,145,77,0.15)",
                      fontWeight: 800,
                      px: 0.5,
                    }}
                  />

                  {/* image */}
                  <Box
                    sx={{
                      width: "100%",
                      height: { xs: 270, sm: 300, md: 315 },
                      borderRadius: 7,
                      overflow: "hidden",
                      position: "relative",
                      boxShadow: "0 22px 45px rgba(82, 38, 0, 0.10)",
                      border: "1px solid rgba(255,255,255,0.9)",
                      background: "#fff",
                    }}
                  >
                    <Box
                      component="img"
                      src={emploImg}
                      alt="Employer registration"
                      sx={{
                        width: "100%",
                        height: "100%",
                        display: "block",
                        objectFit: "cover",
                        objectPosition: "center",
                        transform: "scale(1.03)",
                      }}
                    />

                    <Box
                      sx={{
                        position: "absolute",
                        inset: 0,
                        background:
                          "linear-gradient(180deg, rgba(255,255,255,0) 20%, rgba(255,168,79,0.08) 100%)",
                      }}
                    />
                  </Box>

                  {/* text */}
                  <Box>
                    <Typography
                      variant="h4"
                      fontWeight={950}
                      sx={{
                        lineHeight: 1.05,
                        color: "#2f241b",
                        textShadow: "0 2px 8px rgba(0,0,0,0.03)",
                      }}
                    >
                      Build your hiring presence
                    </Typography>

                    <Typography
                      sx={{
                        mt: 1.5,
                        color: "#6b5a4d",
                        lineHeight: 1.85,
                        fontWeight: 500,
                      }}
                    >
                      Register your company to unlock job posting, applicant
                      tracking, and smarter hiring tools. Your profile will be
                      reviewed by admin before full access is enabled.
                    </Typography>
                  </Box>

                  {/* features */}
                  <Stack spacing={1.5} sx={{ mt: 0.5 }}>
                    <Stack direction="row" spacing={1.4} alignItems="center">
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          bgcolor: "#fff4eb",
                          border: "1px solid rgba(255,145,77,0.12)",
                          color: "#ff7d29",
                          display: "grid",
                          placeItems: "center",
                          flexShrink: 0,
                        }}
                      >
                        <BusinessCenterIcon fontSize="small" />
                      </Box>

                      <Typography
                        sx={{
                          fontWeight: 800,
                          color: "#3b2b20",
                        }}
                      >
                        Post and manage jobs
                      </Typography>
                    </Stack>

                    <Stack direction="row" spacing={1.4} alignItems="center">
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          bgcolor: "#fff4eb",
                          border: "1px solid rgba(255,145,77,0.12)",
                          color: "#ff7d29",
                          display: "grid",
                          placeItems: "center",
                          flexShrink: 0,
                        }}
                      >
                        <FilterAltIcon fontSize="small" />
                      </Box>

                      <Typography
                        sx={{
                          fontWeight: 800,
                          color: "#3b2b20",
                        }}
                      >
                        Smart AI keyword filtering
                      </Typography>
                    </Stack>

                    <Stack direction="row" spacing={1.4} alignItems="center">
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          bgcolor: "#fff4eb",
                          border: "1px solid rgba(255,145,77,0.12)",
                          color: "#ff7d29",
                          display: "grid",
                          placeItems: "center",
                          flexShrink: 0,
                        }}
                      >
                        <TrendingUpIcon fontSize="small" />
                      </Box>

                      <Typography
                        sx={{
                          fontWeight: 800,
                          color: "#3b2b20",
                        }}
                      >
                        Candidate match scoring
                      </Typography>
                    </Stack>
                  </Stack>

                  {/* button */}
                  <Button
                    onClick={() => setStep(2)}
                    variant="contained"
                    sx={{
                      mt: "auto",
                      width: "fit-content",
                      borderRadius: 999,
                      px: 3.4,
                      py: 1.25,
                      background:
                        "linear-gradient(135deg, #ff8a3d 0%, #ffb347 100%)",
                      color: "#fff",
                      textTransform: "none",
                      fontWeight: 900,
                      boxShadow: "0 12px 26px rgba(255, 145, 77, 0.18)",
                      "&:hover": {
                        background:
                          "linear-gradient(135deg, #f97316 0%, #f59e0b 100%)",
                        boxShadow: "0 14px 30px rgba(255, 145, 77, 0.24)",
                      },
                    }}
                  >
                    {step === 1 ? "Get Started" : "Continue"}
                  </Button>
                </Stack>
              </Box>
            </Grid>
            <Grid item xs={12} md={7}>
              <CardContent sx={{ p: { xs: 3, md: 5 } }}>
                <Stack spacing={2.5}>
                  <Box>
                    <Typography
                      variant="h4"
                      fontWeight={900}
                      sx={{ color: "#4a250d" }}
                    >
                      Employer Registration
                    </Typography>
                    <Typography
                      sx={{ mt: 1, color: "#7B5B45", lineHeight: 1.8 }}
                    >
                      Create your company profile and unlock a cleaner employer
                      dashboard with tools that help you screen, sort, and
                      shortlist candidates faster.
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Chip icon={<AutoAwesomeIcon />} label="AI shortlisting" />
                    <Chip
                      icon={<GroupsIcon />}
                      label="Better candidate matches"
                    />
                    <Chip icon={<FilterAltIcon />} label="Keyword filtering" />
                  </Stack>

                  {loadingCompany && (
                    <Alert
                      severity="info"
                      sx={{
                        ...themedAlert,
                        bgcolor: "#EFF8FF",
                        color: "#1E3A5F",
                      }}
                    >
                      Loading company information...
                    </Alert>
                  )}

                  {company?.status === "pending" && (
                    <Alert
                      severity="warning"
                      sx={{
                        ...themedAlert,
                        bgcolor: "#FFF6E5",
                        color: "#7A4B00",
                      }}
                    >
                      Your company registration is pending admin approval.
                    </Alert>
                  )}

                  {company?.status === "approved" && (
                    <Alert
                      severity="success"
                      sx={{
                        ...themedAlert,
                        bgcolor: "#ECF9F1",
                        color: "#1C5B31",
                      }}
                    >
                      Your company is approved. You can now use employer
                      features.
                    </Alert>
                  )}

                  {company?.status === "rejected" && (
                    <Alert
                      severity="error"
                      sx={{
                        ...themedAlert,
                        bgcolor: "#FDECEC",
                        color: "#8A1F1F",
                      }}
                    >
                      Your company registration was rejected. Please contact
                      admin.
                    </Alert>
                  )}

                  {msg && (
                    <Alert
                      severity="success"
                      sx={{
                        ...themedAlert,
                        bgcolor: "#ECF9F1",
                        color: "#1C5B31",
                      }}
                    >
                      {msg}
                    </Alert>
                  )}

                  {err && (
                    <Alert
                      severity="error"
                      sx={{
                        ...themedAlert,
                        bgcolor: "#FDECEC",
                        color: "#8A1F1F",
                      }}
                    >
                      {err}
                    </Alert>
                  )}

                  <Box
                    sx={{
                      p: { xs: 2, md: 3 },
                      borderRadius: 4,
                      background:
                        "linear-gradient(180deg, rgba(255,248,239,0.95), rgba(255,255,255,0.92))",
                      border: "1px solid rgba(123, 91, 69, 0.12)",
                    }}
                  >
                    <Typography
                      sx={{ color: "#4a250d", fontWeight: 800, mb: 1 }}
                    >
                      Company Details
                    </Typography>
                    <Typography
                      sx={{ color: "#7B5B45", fontSize: 14, lineHeight: 1.7 }}
                    >
                      Use the form below to submit your official company
                      profile. Once approved, you’ll be able to manage hiring
                      tools and workplace branding from your dashboard.
                    </Typography>
                  </Box>

                  <Box component="form" onSubmit={handleSubmit}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          required
                          label="Company Name"
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          disabled={Boolean(company)}
                          sx={inputSx}
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          required
                          label="Commercial Registration Number"
                          name="cr_number"
                          value={form.cr_number}
                          onChange={handleChange}
                          disabled={Boolean(company)}
                          sx={inputSx}
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Company Email"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          disabled={Boolean(company)}
                          sx={inputSx}
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Phone Number"
                          name="phone"
                          value={form.phone}
                          onChange={handleChange}
                          disabled={Boolean(company)}
                          sx={inputSx}
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Website"
                          name="website"
                          value={form.website}
                          onChange={handleChange}
                          disabled={Boolean(company)}
                          sx={inputSx}
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Industry"
                          name="industry"
                          value={form.industry}
                          onChange={handleChange}
                          disabled={Boolean(company)}
                          sx={inputSx}
                          placeholder="Example: Technology, Healthcare, Retail"
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Location"
                          name="location"
                          value={form.location}
                          onChange={handleChange}
                          disabled={Boolean(company)}
                          sx={inputSx}
                          placeholder="Example: Manama, Bahrain"
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          multiline
                          rows={4}
                          label="Company Description"
                          name="description"
                          value={form.description}
                          onChange={handleChange}
                          disabled={Boolean(company)}
                          sx={inputSx}
                          placeholder="Tell candidates what makes your company a strong place to work."
                        />
                      </Grid>
                    </Grid>

                    <Stack
                      direction="row"
                      spacing={2}
                      sx={{ mt: 3, flexWrap: "wrap" }}
                    >
                      <Button
                        type="submit"
                        disabled={loading || loadingCompany || Boolean(company)}
                        variant="contained"
                        sx={{
                          borderRadius: 999,
                          py: 1.2,
                          px: 3,
                          background:
                            "linear-gradient(135deg, #FF7D29 0%, #FEA82F 100%)",
                          textTransform: "none",
                          fontWeight: 800,
                          boxShadow: "0 12px 24px rgba(255, 125, 41, 0.28)",
                          "&:hover": {
                            background:
                              "linear-gradient(135deg, #f97316 0%, #f59e0b 100%)",
                            boxShadow: "0 14px 28px rgba(255, 125, 41, 0.32)",
                          },
                        }}
                      >
                        {loading
                          ? "Submitting..."
                          : company
                            ? "Submitted"
                            : "Submit for Approval"}
                      </Button>

                      {step === 1 && (
                        <Button
                          onClick={() => setStep(2)}
                          variant="outlined"
                          sx={{
                            borderRadius: 999,
                            py: 1.2,
                            px: 3,
                            textTransform: "none",
                            color: "#4a250d",
                            borderColor: "rgba(74,37,13,0.25)",
                          }}
                        >
                          Review Form
                        </Button>
                      )}
                    </Stack>
                  </Box>

                  <Divider sx={{ borderColor: "rgba(123, 91, 69, 0.12)" }} />

                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 4,
                      background: "rgba(255, 250, 244, 0.9)",
                      border: "1px solid rgba(255, 138, 61, 0.15)",
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      sx={{ mb: 1 }}
                    >
                      <TrendingUpIcon sx={{ color: "#FF7D29" }} />
                      <Typography sx={{ fontWeight: 800, color: "#4a250d" }}>
                        Why employers use this
                      </Typography>
                    </Stack>
                    <Typography
                      sx={{ color: "#7B5B45", lineHeight: 1.7, fontSize: 14 }}
                    >
                      This profile helps power smart matching, skill-based
                      filtering, and more accurate candidate recommendations
                      across the employer dashboard.
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Grid>
          </Grid>
        </Card>
      </Box>
    </Box>
  );
}
