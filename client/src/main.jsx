// This is the entry point of the React application. It imports necessary modules and renders the main App component wrapped in a theme provider. The BrowserRouter is not used here, so it seems like routing is handled within the App component or not used at all. The AppThemeProvider is likely providing a context for theming throughout the application.
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AppThemeProvider } from "./theme/AppThemeProvider";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppThemeProvider>
      <App />
    </AppThemeProvider>
  </React.StrictMode>,
);
