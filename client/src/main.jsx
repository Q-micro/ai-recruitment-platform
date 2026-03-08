import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#FF6500",
    },
    background: {
      default: "#0B192C",
      paper: "#1E3E62",
    },
    text: {
      primary: "#ffffff",
    },
  },
  shape: {
    borderRadius: 16,
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

