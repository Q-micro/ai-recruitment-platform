import { Box, Card, CardContent, Grid, Typography } from "@mui/material";

export default function AdminDashboard() {
  return (
    <Box sx={{ p: 3, minHeight: "100vh", background: "#f4f7fe" }}>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Admin Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Total Users
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                120
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Employers
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                18
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Open Jobs
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                34
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Applications
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                256
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ mt: 4, borderRadius: 4, background: "linear-gradient(135deg, rgba(17,28,68,0.95), rgba(17,28,68,0.75))",
    boxShadow: "0 8px 32px rgba(0,0,0,0.25)", }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" mb={1}>
            Platform Overview
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Later you can show recent users, latest jobs, reports, and analytics here.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}