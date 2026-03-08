import {
  Box,
  Card,
  CardContent,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import AdminLayout from "../../components/AdminLayout";

function StatCard({ title, value, change }) {
  return (
    <Card
      sx={{
        borderRadius: 4,
        background: "#102347",
        color: "#fff",
        boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
        height: "100%",
      }}
    >
      <CardContent>
        <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)", mb: 1 }}>
          {title}
        </Typography>

        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="h5" fontWeight="bold">
            {value}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: "#22c55e",
              backgroundColor: "rgba(34,197,94,0.12)",
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
        background: "#102347",
        color: "#fff",
        boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
        height: height || "100%",
      }}
    >
      <CardContent sx={{ height: "100%" }}>
        <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)" }}>
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

export default function AdminDashboard() {
  return (
    <AdminLayout title="Dashboard">
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Users" value="50.8K" change="+28.4%" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Employers" value="23.6K" change="+12.6%" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Jobs Posted" value="756" change="+3.1%" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Applications" value="2.3K" change="+11.3%" />
        </Grid>

        <Grid item xs={12} md={8}>
          <PanelCard title="Total revenue" subtitle="$240.8K" height="420px">
            <Box
              sx={{
                mt: 2,
                height: "300px",
                borderRadius: 4,
                background:
                  "linear-gradient(180deg, rgba(255,101,0,0.08), rgba(30,62,98,0.18))",
                border: "1px solid rgba(255,255,255,0.05)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "rgba(255,255,255,0.55)",
                fontSize: "14px",
              }}
            >
              Chart area placeholder
            </Box>
          </PanelCard>
        </Grid>

        <Grid item xs={12} md={4}>
          <Stack spacing={3} sx={{ height: "100%" }}>
            <PanelCard title="Total profit" subtitle="$144.6K" height="198px">
              <Box
                sx={{
                  mt: 2,
                  height: "90px",
                  borderRadius: 3,
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.05)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "rgba(255,255,255,0.55)",
                  fontSize: "13px",
                }}
              >
                Mini chart placeholder
              </Box>
            </PanelCard>

            <PanelCard title="Total sessions" subtitle="400" height="198px">
              <Box
                sx={{
                  mt: 2,
                  height: "90px",
                  borderRadius: 3,
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.05)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "rgba(255,255,255,0.55)",
                  fontSize: "13px",
                }}
              >
                Mini chart placeholder
              </Box>
            </PanelCard>
          </Stack>
        </Grid>
      </Grid>
    </AdminLayout>
  );
}