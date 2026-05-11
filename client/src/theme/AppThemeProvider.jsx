/**
 * The above code defines a custom theme provider in React that allows users to toggle between light
 * and dark modes and saves the selected mode to local storage.
 * @returns The code snippet provided defines a custom `AppThemeProvider` component and a custom hook
 * `useAppThemeMode` for managing and providing theme mode functionality in a React application.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";

const ThemeModeContext = createContext({
  mode: "dark",
  setMode: () => {},
  toggleMode: () => {},
});

function getStoredMode() {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    return user?.dark_mode === false ? "light" : "dark";
  } catch {
    return "dark";
  }
}

function saveModeToUser(mode) {
  try {
    const existing = JSON.parse(localStorage.getItem("user") || "null") || {};
    const updated = {
      ...existing,
      dark_mode: mode === "dark",
    };
    localStorage.setItem("user", JSON.stringify(updated));
  } catch {}
}

export function AppThemeProvider({ children }) {
  const [mode, setModeState] = useState(getStoredMode);

  const setMode = useCallback((nextMode) => {
    setModeState(nextMode);
    saveModeToUser(nextMode);
  }, []);

  const toggleMode = useCallback(() => {
    setModeState((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      saveModeToUser(next);
      return next;
    });
  }, []);

  useEffect(() => {
    const handleStorageSync = () => {
      setModeState(getStoredMode());
    };

    window.addEventListener("storage", handleStorageSync);
    return () => window.removeEventListener("storage", handleStorageSync);
  }, []);

  const theme = useMemo(
    () =>
      createTheme({
        // 1. Disable all shadows globally
        shadows: Array(25).fill("none"),

        palette: {
          mode,
        },
        shape: {
          borderRadius: 14,
        },
        components: {
          MuiCssBaseline: {
            styleOverrides: {
              body: { margin: 0, overflowX: "hidden" },
              "#root": { minHeight: "100vh" },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                // 2. Disable background overlays (the "bold square" tint)
                backgroundImage: "none",
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                // 3. Disable background overlays
                backgroundImage: "none",
              },
            },
          },
        },
      }),
    [mode],
  );

  const value = useMemo(
    () => ({
      mode,
      setMode,
      toggleMode,
    }),
    [mode, setMode, toggleMode],
  );

  return (
    <ThemeModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}

export function useAppThemeMode() {
  return useContext(ThemeModeContext);
}
