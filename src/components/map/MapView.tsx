import React, { useState, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  Polyline,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import BlogPinPopup from "./BlogPinPopup";
import AddPinButton from "./AddPinButton";
import AddPinInput from "./AddPinInput";
import TravelStatsBox from "./TravelStatsBox/TravelStatsBox";
import {
  calculateMileage,
  getUniqueTowns,
  getTownsPerState,
} from "./TravelStatsBox/utils";
import { BlogMapPin } from "../../types/BlogType";
import { useBlogPins } from "./hooks/useBlogPins";
import { geocodeAddress } from "./utils/geocodeAddress";
import { useAlert } from "@components/common/AlertContext";

// Define selected icon outside the component to avoid recreation
const selectedIcon = L.icon({
  iconUrl:
    "https://cdn.jsdelivr.net/npm/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  shadowSize: [41, 41],
});

// Fix default marker icon issue with Leaflet in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const AUSTRALIA_CENTER: [number, number] = [-25.2744, 133.7751];
const AUSTRALIA_BOUNDS: [[number, number], [number, number]] = [
  [-44, 112], // Southwest
  [-10, 154], // Northeast
];

// No longer need MapViewProps, pins will be fetched internally

function MapClickHandler({ onMapClick }: { onMapClick?: (e: any) => void }) {
  useMapEvents({
    click: (e) => {
      if (onMapClick) onMapClick(e);
    },
  });
  return null;
}

const MapView: React.FC<{
  initialCenter?: [number, number];
  initialZoom?: number;
  bounds?: [[number, number], [number, number]];
}> = ({
  initialCenter = [-25.2744, 133.7751],
  initialZoom = 4,
  bounds = [
    [-44, 112], // Southwest
    [-10, 154], // Northeast
  ],
}) => {
  const { pins, addPin, loading, updatePin, resetPins } = useBlogPins();
  const [showAddPinInput, setShowAddPinInput] = useState(false);
  const [addressInput, setAddressInput] = useState("");
  const [savingLocation, setSavingLocation] = useState(false);
  const { showAlert } = useAlert();

  // Show/hide input field
  const handleAddPinClick = useCallback(() => {
    setShowAddPinInput((prev) => !prev);
  }, []);

  // Input change handler
  const handleAddressChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setAddressInput(e.target.value);
    },
    [],
  );

  // Hide input field
  const handleInputClose = useCallback(() => {
    setShowAddPinInput(false);
    setAddressInput("");
  }, []);

  // Submit handler: geocode and add pin
  const handleAddressSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!addressInput.trim()) return;

      const geo = await geocodeAddress(addressInput);
      if (geo) {
        const newPin: BlogMapPin = {
          id: "", // Firestore will assign ID
          lat: geo.lat,
          lng: geo.lng,
          title: geo.displayName,
          blogUrl: "#",
          featuredPhoto: "",
          date: new Date().toISOString(),
          description: "",
          tags: [],
          category: "",
          featured: false,
        };
        await addPin(newPin);
        handleInputClose();
      } else {
        alert("Address not found. Please try a different address.");
      }
    },
    [addressInput, addPin, handleInputClose],
  );

  // Compute travel stats from pins
  const mileageKm = calculateMileage(pins);
  const townsVisited = getUniqueTowns(pins).length;
  // Example state extractor: assumes state info is in pin.category or first tag
  const stateExtractor = (pin) =>
    pin.category || (pin.tags && pin.tags.length > 0 ? pin.tags[0] : undefined);
  const townsPerState = getTownsPerState(pins, stateExtractor);

  return (
    <div className="relative h-screen w-screen">
      {/* Spinner overlay when loading pins */}
      {loading && (
        <div className="fixed inset-0 z-[2000] flex flex-col items-center justify-center bg-black bg-opacity-40 pointer-events-auto transition-opacity">
          <div className="flex flex-col items-center">
            <svg
              className="animate-spin h-12 w-12 text-blue-500 mb-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              />
            </svg>
            <span className="text-white text-xl font-semibold">
              Fetching pins ...
            </span>
          </div>
        </div>
      )}
      <div
        className={
          loading
            ? "pointer-events-none opacity-40"
            : "opacity-100 transition-opacity"
        }
      >
        <AddPinButton onClick={handleAddPinClick} />
        <AddPinInput
          visible={showAddPinInput}
          address={addressInput}
          onAddressChange={handleAddressChange}
          onSubmit={handleAddressSubmit}
          onClose={handleInputClose}
        />
        {/* Floating Save Current Location Button */}
        <button
          className="fixed top-24 right-8 z-[1000] bg-green-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-green-700 transition-all text-sm flex items-center"
          style={{ minWidth: "70px" }}
          onClick={async () => {
            setSavingLocation(true);
            if ("geolocation" in navigator) {
              navigator.geolocation.getCurrentPosition(
                async (pos) => {
                  const { latitude, longitude } = pos.coords;
                  const newPin = {
                    id: "",
                    lat: latitude,
                    lng: longitude,
                    title: "My Current Location",
                    blogUrl: "#",
                    featuredPhoto: "",
                    date: new Date().toISOString(),
                    description: "",
                    tags: [],
                    category: "",
                    featured: false,
                  };
                  await addPin(newPin);
                  setSavingLocation(false);
                  showAlert({
                    message: "Current location saved as a pin!",
                    type: "success",
                    duration: 4000,
                  });
                },
                (err) => {
                  setSavingLocation(false);
                  showAlert({
                    message:
                      "Unable to get current location. Please enter an address manually using 'Add pin'.",
                    type: "warning",
                    duration: 6000,
                  });
                  setShowAddPinInput(true);
                },
              );
            } else {
              setSavingLocation(false);
              showAlert({
                message:
                  "Geolocation is not supported by your browser. Please enter an address manually using 'Add pin'.",
                type: "error",
                duration: 6000,
              });
              setShowAddPinInput(true);
            }
          }}
          disabled={savingLocation}
          aria-label="Save current location"
        >
          {savingLocation ? "Saving..." : "Save Current Location"}
        </button>
        {/* Floating TravelStatsBox under zoom controls */}
        <TravelStatsBox
          stats={{
            mileageKm,
            townsVisited,
            townsPerState,
          }}
          className=""
          style={{ top: 80, left: 16 }} // adjust as needed for zoom control position
        />
        <MapContainer
          center={initialCenter}
          zoom={initialZoom}
          minZoom={initialZoom}
          maxZoom={19}
          className="h-screen w-screen"
          maxBounds={bounds}
          maxBoundsViscosity={1.0}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <MapClickHandler />
          {!loading &&
            pins.map((pin) => (
              <Marker key={pin.id} position={[pin.lat, pin.lng]}>
                <Popup>
                  <BlogPinPopup pin={pin} />
                </Popup>
              </Marker>
            ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default MapView;
