import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { BlogRoutes } from "@components/blog/BlogRoutes";
import AddressInput from "@components/AddressInput";
import { geocodeAddress } from "@utils/geocode";
import { Pin } from "@types/PinTypes";
import MapView from "@components/map/MapView";
import { logger } from "@utils/logger";
import { useAlert } from "@components/common/AlertContext";

const initialPins: Pin[] = [];

function App() {
  const { showAlert } = useAlert(); // Initialize the alert hook
  const [pins, setPins] = useState<Pin[]>(initialPins);
  const [startIdx, setStartIdx] = useState<number | null>(null);
  const [endIdx, setEndIdx] = useState<number | null>(null);
  const [isGeocoding, setIsGeocoding] = useState<boolean>(false);

  // Handle map click to add a new pin
  const handleMapClick = (e: any) => {
    if (!e.latlng) return;
    const coords: [number, number] = [e.latlng.lat, e.latlng.lng];
    const placeName = prompt("Enter the name of this place:");
    if (!placeName) return;
    setPins((prev) => [...prev, { coords, placeName, media: [], travels: [] }]);
    logger.info("Pin added by map click:", { coords, placeName });
  };

  // Handle media upload for a pin
  const handleMediaUpload = (pinIdx: number, files: FileList) => {
    const fileObjs = Array.from(files).map((file) => ({
      url: URL.createObjectURL(file),
      type: file.type,
      name: file.name,
    }));
    setPins((prev) =>
      prev.map((pin, idx) =>
        idx === pinIdx ? { ...pin, media: [...pin.media, ...fileObjs] } : pin
      )
    );
    logger.info("Media uploaded for pin:", {
      pinIdx,
      files: fileObjs.map((f) => f.name),
    });
  };

  // Set a pin as start point
  const handleSetStart = (idx: number) => {
    setStartIdx(idx);
    // If end is same as start, reset end
    if (endIdx === idx) setEndIdx(null);
  };

  // Set a pin as end point
  const handleSetEnd = (idx: number) => {
    setEndIdx(idx);
    // If start is same as end, reset start
    if (startIdx === idx) setStartIdx(null);

    // If a start point is selected, add this end point to the travels of the start pin
    if (startIdx !== null && startIdx !== idx) {
      setPins((prevPins) =>
        prevPins.map((pin, i) =>
          i === startIdx
            ? {
                ...pin,
                travels: pin.travels.includes(idx)
                  ? pin.travels
                  : [...pin.travels, idx],
              }
            : pin
        )
      );
    }
  };

  // Geocode address and add pin (modular)
  const handleAddressSubmit = async (address: string) => {
    // const { showAlert } = useAlert();
    setIsGeocoding(true);
    try {
      logger.info("Geocoding address submitted:", address);
      const result = await geocodeAddress(address);
      if (result) {
        setPins((prev) => [
          ...prev,
          {
            coords: [result.lat, result.lon],
            placeName: result.displayName,
            media: [],
            travels: [],
          },
        ]);
        logger.success("Pin added by address:", {
          address,
          coords: [result.lat, result.lon],
        });
      } else {
        logger.warn("Address not found for geocoding:", address);
        showAlert({
          message: "Address not found. Please try a different address.",
          type: "warning",
          duration: 5000, // Example: automatically dismiss after 5 seconds
        });
      }
    } catch (err) {
      logger.error("Error occurred while geocoding address:", err);
      showAlert({
        message: "Error occurred while geocoding address.",
        type: "error",
        title: "Geocoding Error", // Example: custom title
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
              <Route
                path="/aus-map-travel-journal"
                element={
                  <MapView
                    pins={pins}
                    onMapClick={handleMapClick}
                    onMediaUpload={handleMediaUpload}
                    startIdx={startIdx}
                    endIdx={endIdx}
                    onSetStart={handleSetStart}
                    onSetEnd={handleSetEnd}
                  />
                }
              />
              <Route
                path="/aus-map-travel-journal/blogs/*"
                element={<BlogRoutes />}
              />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
