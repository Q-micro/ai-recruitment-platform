/**
 * The `EmployerCreateJob` function in this React component allows employers to create a new job post
 * with various details and provides feedback messages for successful or failed job creation.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Typography,
  TextField,
  MenuItem,
  Paper,
  Stack,
  Button,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";

const API_BASE_URL = "http://localhost:3001";

const JOB_TYPE_OPTIONS = [
  "Full-time",
  "Part-time",
  "Internship",
  "Contract",
  "Remote",
  "Hybrid",
];

const STATUS_OPTIONS = ["open", "closed", "draft"];

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

export default function EmployerCreateJob() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const [messageOpen, setMessageOpen] = useState(false);
  const [messageType, setMessageType] = useState("success");
  const [messageText, setMessageText] = useState("");
  const [goToJobsAfterClose, setGoToJobsAfterClose] = useState(false);

  function showMessage(type, text, shouldGoToJobs = false) {
    setMessageType(type);
    setMessageText(text);
    setGoToJobsAfterClose(shouldGoToJobs);
    setMessageOpen(true);
  }

  function closeMessage() {
    setMessageOpen(false);

    if (goToJobsAfterClose) {
      navigate("/employer/jobs");
    }
  }

  function handleFormChange(field, value) {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function handleCreateJob() {
    try {
      setSaving(true);

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("You are not logged in");
      }

      if (!formData.title.trim()) {
        throw new Error("Job title is required");
      }

      if (!formData.position.trim()) {
        throw new Error("Position is required");
      }

      if (!formData.job_type.trim()) {
        throw new Error("Job type is required");
      }

      const payload = {
        ...formData,
        title: formData.title.trim(),
        position: formData.position.trim(),
        salary: formData.salary.trim() || null,
        location: formData.location.trim() || null,
        source: formData.source.trim() || null,
        contact_email: formData.contact_email.trim() || null,
        contact_phone: formData.contact_phone.trim() || null,
        description: formData.description.trim() || null,
      };

      const res = await fetch(`${API_BASE_URL}/employer/jobs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Failed to create job");
      }

      showMessage("success", "Job created successfully.", true);
    } catch (err) {
      console.error(err);
      showMessage("error", err.message || "Failed to create job.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Box>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          borderRadius: 4,
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(6px)",
          border: "1px solid rgba(122, 86, 48, 0.10)",
          boxShadow: "0 10px 28px rgba(122, 86, 48, 0.10)",
          maxWidth: 1000,
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
          spacing={2}
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
              Create Job
            </Typography>
            <Typography sx={{ color: "#7a5630", mt: 0.75 }}>
              Add a new job post for candidates to view.
            </Typography>
          </Box>

          <Button
            startIcon={<ArrowBackRoundedIcon />}
            variant="outlined"
            onClick={() => navigate("/employer/jobs")}
            sx={secondaryBtnSx}
          >
            Back to Jobs
          </Button>
        </Stack>

        <Stack spacing={2}>
          <TextField
            label="Job Title"
            fullWidth
            value={formData.title}
            onChange={(e) => handleFormChange("title", e.target.value)}
            sx={fieldSx}
            required
          />

          <TextField
            label="Position"
            fullWidth
            value={formData.position}
            onChange={(e) => handleFormChange("position", e.target.value)}
            sx={fieldSx}
            required
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
            required
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
            onChange={(e) => handleFormChange("contact_email", e.target.value)}
            sx={fieldSx}
          />

          <TextField
            label="Contact Phone"
            fullWidth
            value={formData.contact_phone}
            onChange={(e) => handleFormChange("contact_phone", e.target.value)}
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
                    backgroundColor: "#FF7D29",
                    opacity: 1,
                  },
                  "& .MuiSwitch-track": {
                    backgroundColor: "rgba(122,86,48,0.25)",
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

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            sx={{ pt: 1 }}
          >
            <Button
              variant="outlined"
              onClick={() => navigate("/employer/jobs")}
              sx={secondaryBtnSx}
            >
              Cancel
            </Button>

            <Button
              variant="contained"
              startIcon={<SaveRoundedIcon />}
              onClick={handleCreateJob}
              disabled={saving}
              sx={primaryBtnSx}
            >
              {saving ? "Creating..." : "Create Job"}
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Dialog
        open={messageOpen}
        onClose={closeMessage}
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
          <Button onClick={closeMessage} variant="contained" sx={primaryBtnSx}>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    color: "#4a2b12",
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.55)",
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "rgba(122,86,48,0.10)",
  },
  "& .MuiInputLabel-root": {
    color: "#7a5630",
  },
  "& .MuiSvgIcon-root": {
    color: "#6a4120",
  },
};

const primaryBtnSx = {
  textTransform: "none",
  fontWeight: 800,
  borderRadius: 3,
  px: 2,
  color: "#fff",
  background: "linear-gradient(135deg, #FF7D29 0%, #F4B63D 100%)",
  boxShadow: "0 10px 22px rgba(255,125,41,0.24)",
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
  backgroundColor: "rgba(255,255,255,0.24)",
  "&:hover": {
    borderColor: "rgba(122,86,48,0.22)",
    backgroundColor: "rgba(255,255,255,0.42)",
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
