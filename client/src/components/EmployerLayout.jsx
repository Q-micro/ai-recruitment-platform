import { Box } from "@mui/material";
import EmployerSidebar from "./EmployerSidebar";
import EmployerTopbar from "./EmployerTopbar";

export default function EmployerLayout({ children }) {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh", background: "#FEFFD2" }}>
      <EmployerSidebar />

      <Box sx={{ flexGrow: 1, p: 3 }}>
        <EmployerTopbar />
        {children}
      </Box>
    </Box>
  );
}