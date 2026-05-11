/**
 * The AdminPlaceholder function returns a styled card component with a title and a message indicating
 * that the page is under construction.
 * @returns The `AdminPlaceholder` component is being returned. It renders a styled `Card` component
 * from Material-UI containing a `CardContent` component with a `Typography` component for the title
 * and a message indicating that the page is under construction.
 */
import { Card, CardContent, Typography } from "@mui/material";

export default function AdminPlaceholder({ title }) {
  return (
    <Card
      sx={{
        borderRadius: 4,
        background: "#102347",
        color: "#fff",
        boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
      }}
    >
      <CardContent>
        <Typography variant="h5" fontWeight="bold" mb={1}>
          {title}
        </Typography>
        <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)" }}>
          This page is under construction.
        </Typography>
      </CardContent>
    </Card>
  );
}
