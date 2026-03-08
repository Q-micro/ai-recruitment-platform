import { Box, Typography } from "@mui/material";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";

export default function AdminLayout({ title, children }) {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh", background: "#0B192C" }}>
      <AdminSidebar />

      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Box
          sx={{
            mb: 3,
            p: 2.5,
            borderRadius: 4,
            background: "#1E3E62",
            color: "#fff",
            boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
          }}
        >
          <Typography variant="body2" sx={{ opacity: 0.8, mb: 0.5 }}>
            Admin / {title}
          </Typography>
          <Typography variant="h4" fontWeight="bold">
            {title}
          </Typography>
        </Box>

        {children}
      </Box>
    </Box>
  );
}