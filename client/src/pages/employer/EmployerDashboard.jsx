import {
  Box,
  Card,
  CardContent,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import EmployerLayout from "../../components/EmployerLayout";

function StatCard({ title, value, change }) {
  return (
    <Card
      sx={{
        borderRadius: 4,
        background: "#FFEEA9",
        color: "#4a2b12",
        boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
        height: "100%",
      }}
    >
      <CardContent>
        <Typography variant="body2" sx={{ color: "#7a5630", mb: 1 }}>
          {title}
        </Typography>

        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="h5" fontWeight="bold">
            {value}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: "#8a4b12",
              backgroundColor: "rgba(255,125,41,0.18)",
              px: 1,
              py: 0.3,
              borderRadius: 2,
            }}
          >
            {change}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}

function PanelCard({ title, subtitle, children, height }) {
  return (
    <Card
      sx={{
        borderRadius: 4,
        background: "#FFEEA9",
        color: "#4a2b12",
        boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
        height: height || "100%",
      }}
    >
      <CardContent sx={{ height: "100%" }}>
        <Typography variant="body2" sx={{ color: "#7a5630" }}>
          {title}
        </Typography>
        <Typography variant="h5" fontWeight="bold" sx={{ mt: 1, mb: 2 }}>
          {subtitle}
        </Typography>
        {children}
      </CardContent>
    </Card>
  );
}

export default function EmployerDashboard() {
  return (
    <EmployerLayout>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="My Jobs" value="18" change="+4.2%" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Active Posts" value="9" change="+2.1%" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Applications" value="326" change="+11.8%" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Shortlisted" value="42" change="+5.4%" />
        </Grid>

        <Grid item xs={12} md={8}>
          <PanelCard title="Hiring overview" subtitle="Monthly applications" height="420px">
            <Box
              sx={{
                mt: 2,
                height: "300px",
                borderRadius: 4,
                background:
                  "linear-gradient(180deg, rgba(255,125,41,0.08), rgba(255,238,169,0.5))",
                border: "1px solid rgba(0,0,0,0.05)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#8a6a3c",
                fontSize: "14px",
              }}
            >
              Chart area placeholder
            </Box>
          </PanelCard>
        </Grid>

        <Grid item xs={12} md={4}>
          <Stack spacing={3} sx={{ height: "100%" }}>
            <PanelCard title="Open roles" subtitle="12" height="198px">
              <Box
                sx={{
                  mt: 2,
                  height: "90px",
                  borderRadius: 3,
                  background: "rgba(255,255,255,0.35)",
                  border: "1px solid rgba(0,0,0,0.05)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#8a6a3c",
                  fontSize: "13px",
                }}
              >
                Mini chart placeholder
              </Box>
            </PanelCard>

            <PanelCard title="Interview stage" subtitle="24 candidates" height="198px">
              <Box
                sx={{
                  mt: 2,
                  height: "90px",
                  borderRadius: 3,
                  background: "rgba(255,255,255,0.35)",
                  border: "1px solid rgba(0,0,0,0.05)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#8a6a3c",
                  fontSize: "13px",
                }}
              >
                Mini chart placeholder
              </Box>
            </PanelCard>
          </Stack>
        </Grid>
      </Grid>
    </EmployerLayout>
  );
}