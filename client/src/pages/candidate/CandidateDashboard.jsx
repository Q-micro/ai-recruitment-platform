import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CandidateLayout from "../../components/CandidateLayout";

function JobCard({ title, company, location, type, colors }) {
  return (
    <Card
      sx={{
        borderRadius: 4,
        boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
        height: "100%",
        backgroundColor: colors.card,
        color: colors.text,
      }}
    >
      <CardContent>
        <Typography variant="h6" fontWeight="bold" sx={{ color: colors.text, mb: 1 }}>
          {title}
        </Typography>
        <Typography sx={{ color: colors.subtext, mb: 0.5 }}>
          {company}
        </Typography>
        <Typography variant="body2" sx={{ color: colors.subtext, mb: 2 }}>
          {location} • {type}
        </Typography>

        <Button
          variant="contained"
          sx={{
            textTransform: "none",
            backgroundColor: colors.accent,
            "&:hover": { backgroundColor: colors.accent, opacity: 0.9 },
          }}
        >
          View Job
        </Button>
      </CardContent>
    </Card>
  );
}

function SmallInfoCard({ title, value, subtitle, colors }) {
  return (
    <Card
      sx={{
        borderRadius: 4,
        boxShadow: "0 8px 24px rgba(0,0,0,0.05)",
        height: "100%",
        backgroundColor: colors.card,
        color: colors.text,
      }}
    >
      <CardContent>
        <Typography variant="body2" sx={{ color: colors.subtext, mb: 1 }}>
          {title}
        </Typography>
        <Typography variant="h5" fontWeight="bold" sx={{ color: colors.text }}>
          {value}
        </Typography>
        <Typography variant="body2" sx={{ color: colors.subtext, mt: 1 }}>
          {subtitle}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function CandidateDashboard() {
  return (
    <CandidateLayout>
      {(colors, mode) => (
        <>
          <Card
            sx={{
              borderRadius: 5,
              mb: 4,
              background:
                mode === "dark"
                  ? "linear-gradient(135deg, #082032 0%, #334756 100%)"
                  : "linear-gradient(135deg, #C4E1F6 0%, #FEEE91 100%)",
              color: mode === "dark" ? "#fff" : "#082032",
              boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h4" fontWeight="bold" mb={1}>
                Welcome back
              </Typography>
              <Typography sx={{ opacity: 0.85, mb: 3 }}>
                Discover jobs, track applications, and move one step closer to your next opportunity.
              </Typography>

              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <TextField
                  fullWidth
                  placeholder="Job title or keyword"
                  variant="outlined"
                  sx={{
                    backgroundColor: "#fff",
                    borderRadius: 3,
                  }}
                />
                <TextField
                  fullWidth
                  placeholder="Location"
                  variant="outlined"
                  sx={{
                    backgroundColor: "#fff",
                    borderRadius: 3,
                  }}
                />
                <Button
                  variant="contained"
                  sx={{
                    minWidth: 160,
                    textTransform: "none",
                    backgroundColor: colors.accent,
                    "&:hover": { backgroundColor: colors.accent, opacity: 0.9 },
                  }}
                >
                  Search Jobs
                </Button>
              </Stack>
            </CardContent>
          </Card>

          <Grid container spacing={3} mb={1}>
            <Grid item xs={12} sm={4}>
              <SmallInfoCard
                title="Applications Sent"
                value="12"
                subtitle="Keep tracking your active job applications"
                colors={colors}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <SmallInfoCard
                title="Saved Jobs"
                value="7"
                subtitle="Jobs you bookmarked to review later"
                colors={colors}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <SmallInfoCard
                title="Profile Completion"
                value="85%"
                subtitle="Complete your profile for better visibility"
                colors={colors}
              />
            </Grid>
          </Grid>

          <Box mt={4}>
            <Typography variant="h5" fontWeight="bold" sx={{ color: colors.text, mb: 2 }}>
              Recommended Jobs
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <JobCard
                  title="Frontend Developer"
                  company="FutureTech"
                  location="Remote"
                  type="Full-time"
                  colors={colors}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <JobCard
                  title="UI/UX Designer"
                  company="Pixel Studio"
                  location="Manama"
                  type="Hybrid"
                  colors={colors}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <JobCard
                  title="Marketing Specialist"
                  company="Bright Media"
                  location="Remote"
                  type="Part-time"
                  colors={colors}
                />
              </Grid>
            </Grid>
          </Box>
        </>
      )}
    </CandidateLayout>
  );
}