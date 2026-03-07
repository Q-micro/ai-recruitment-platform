import { Box, Card, CardContent, Grid, Typography } from "@mui/material";

export default function EmployerDashboard() {
  return (
    <Box sx={{ p: 3, minHeight: "100vh", background: "#eef4ff" }}>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Employer Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                My Jobs
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                6
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Active Jobs
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                4
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
                42
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Shortlisted
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                9
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ mt: 4, borderRadius: 4, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" mb={1}>
            Recruitment Summary
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Later you can show recent applicants, posted jobs, and hiring activity here.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}