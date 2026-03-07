import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";

const theme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#0b1437",
      paper: "#111c44",
    },
    primary: {
      main: "#0075ff",
    },
    secondary: {
      main: "#6ad2ff",
    },
    text: {
      primary: "#ffffff",
      secondary: "#a3aed0",
    },
  },
  shape: {
    borderRadius: 16,
  },
  typography: {
    fontFamily: "Inter, Arial, sans-serif",
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);

//to install MUI in laptop
//npm install @mui/material @mui/icons-material @emotion/react @emotion/styled

//versions to be compatible 
//npm install react@18 react-dom@18

//clean 
//Remove-Item -Recurse -Force node_modules
//Remove-Item package-lock.json
//npm install


//that might not work 
//in cd client 
//Remove-Item -Recurse -Force node_modules
//Remove-Item package-lock.json

//npm install react@18.2.0 react-dom@18.2.0
//npm install

