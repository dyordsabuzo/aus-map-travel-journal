import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { BlogRoutes } from "@components/blog/BlogRoutes";
import { geocodeAddress } from "@utils/geocode";
import MapView from "@components/map/MapView";
import { logger } from "@utils/logger";
import { useAlert } from "@components/common/AlertContext";
import { AuthProvider } from "@components/auth/AuthContext";
import SlidingAuthPanel from "@components/auth/SlidingAuthPanel";

// Theme toggle button
const ThemeToggle: React.FC<{
  theme: string;
  setTheme: (t: string) => void;
}> = ({ theme, setTheme }) => (
  <button
    className="ml-auto px-3 py-1 rounded text-sm bg-gray-200 dark:bg-gray-700 dark:text-gray-100 text-gray-800 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    aria-label="Toggle dark mode"
    type="button"
  >
    {theme === "dark" ? "🌙 Dark" : "☀️ Light"}
  </button>
);

function App() {
  const { showAlert } = useAlert(); // Initialize the alert hook
  const [isGeocoding, setIsGeocoding] = useState<boolean>(false);

  // Theme state
  const [theme, setTheme] = useState<string>(
    window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light",
  );

  React.useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const baseRoute = import.meta.env.VITE_BASE || "";
  const [authPanelOpen, setAuthPanelOpen] = useState(false);

  // Geocode address and add pin (modular)
  // NOTE: This logic can be kept if you want to allow users to add pins interactively,
  // but these pins will not persist unless you save them to markdown/blog files.

  // React Query client
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="h-screen w-screen bg-gray-100 flex flex-col">
            <nav className="bg-white shadow px-4 py-2 flex items-center">
              {/* Hamburger icon */}
              <button
                className="mr-4 text-2xl font-bold text-gray-700 dark:text-gray-200 hover:text-blue-600"
                onClick={() => setAuthPanelOpen(true)}
                aria-label="Open authentication"
              >
                &#9776;
              </button>
              <Link to="/" className="text-xl font-bold text-blue-700 mr-6">
                Aussie Map Travel Journal
              </Link>
              <ThemeToggle theme={theme} setTheme={setTheme} />
            </nav>
            <div className="flex-1 flex flex-col">
              <div className="flex-1">
                <Routes>
                  <Route path={`${baseRoute}/`} element={<MapView />} />
                  <Route
                    path={`${baseRoute}/blogs/*`}
                    element={<BlogRoutes />}
                  />
                </Routes>
              </div>
            </div>
            {/* Sliding authentication panel */}
            <SlidingAuthPanel
              open={authPanelOpen}
              onClose={() => setAuthPanelOpen(false)}
            />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
