import { Box, useMediaQuery } from "@mui/material";
import { useMemo, useState } from "react";
import CandidateNavbar from "./CandidateNavbar";

export default function CandidateLayout({ children }) {
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");
  const [mode, setMode] = useState(prefersDark ? "dark" : "light");

  const colors = useMemo(() => {
    if (mode === "dark") {
      return {
        bg: "linear-gradient(180deg, #081f32 0%, #2C394B 100%)",
        page: "#082032",
        card: "#2C394B",
        card2: "#334756",
        text: "#ffffff",
        subtext: "#c9d4df",
        accent: "#FF4C29",
        nav: "rgba(8,32,50,0.92)",
        navBorder: "rgba(255,255,255,0.08)",
      };
    }

    return {
      bg: "linear-gradient(180deg, #fffdf6 0%, #f7fbff 100%)",
      page: "#FEFFD2",
      card: "#ffffff",
      card2: "#C4E1F6",
      text: "#082032",
      subtext: "#4f6475",
      accent: "#FF9D3D",
      nav: "rgba(255,255,255,0.92)",
      navBorder: "rgba(0,0,0,0.06)",
    };
  }, [mode]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: colors.bg,
      }}
    >
      <CandidateNavbar
        mode={mode}
        setMode={setMode}
        colors={colors}
      />

      <Box sx={{ px: { xs: 2, md: 4 }, py: 4 }}>
        {typeof children === "function" ? children(colors, mode) : children}
      </Box>
    </Box>
  );
}