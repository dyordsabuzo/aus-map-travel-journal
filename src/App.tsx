import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { BlogRoutes } from "@components/blog/BlogRoutes";
import AddressInput from "@components/AddressInput";
import { geocodeAddress } from "@utils/geocode";
import MapView from "@components/map/MapView";
import { logger } from "@utils/logger";
import { useAlert } from "@components/common/AlertContext";

function App() {
  const { showAlert } = useAlert(); // Initialize the alert hook
  const [isGeocoding, setIsGeocoding] = useState<boolean>(false);

  const baseRoute = import.meta.env.VITE_BASE || "";

  // Geocode address and add pin (modular)
  // NOTE: This logic can be kept if you want to allow users to add pins interactively,
  // but these pins will not persist unless you save them to markdown/blog files.
  const handleAddressSubmit = async (address: string) => {
    setIsGeocoding(true);
    try {
      logger.info("Geocoding address submitted:", address);
      const result = await geocodeAddress(address);
      if (result) {
        showAlert({
          message:
            "Address found! Please add this location to a blog post to make it persistent.",
          type: "success",
          duration: 5000,
        });
      } else {
        logger.warn("Address not found for geocoding:", address);
        showAlert({
          message: "Address not found. Please try a different address.",
          type: "warning",
          duration: 5000,
        });
      }
    } catch (err) {
      logger.error("Error occurred while geocoding address:", err);
      showAlert({
        message: "Error occurred while geocoding address.",
        type: "error",
        title: "Geocoding Error",
      });
    } finally {
      setIsGeocoding(false);
    }
  };

  return (
    <Router>
      <div className="h-screen w-screen bg-gray-100 flex flex-col">
        <nav className="bg-white shadow px-4 py-2 flex items-center">
          <Link to="/" className="text-xl font-bold text-blue-700 mr-6">
            Aussie Map Travel Journal
          </Link>
          <Link to="/blogs" className="text-blue-600 hover:underline">
            Blogs
          </Link>
        </nav>
        <div className="flex-1 flex flex-col">
          {/* Address input for geocoding */}
          <AddressInput
            onSubmit={handleAddressSubmit}
            loading={isGeocoding}
            placeholder="Enter an address (e.g. Sydney Opera House, NSW)"
            buttonLabel="Add Pin by Address"
          />
          <div className="flex-1">
            <Routes>
              <Route path={`${baseRoute}/`} element={<MapView />} />
              <Route path={`${baseRoute}/blogs/*`} element={<BlogRoutes />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
