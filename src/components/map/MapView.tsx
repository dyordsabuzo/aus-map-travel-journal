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
import AddPinByCoordsInput from "./AddPinByCoordsInput";
import TravelStatsBox from "./TravelStatsBox/TravelStatsBox";
import UserProfileBox from "../auth/UserProfileBox";
import { useAuth } from "../auth/AuthContext";
import {
  updatePin as updateFirestorePin,
  deletePin as deleteFirestorePin,
} from "../../firebase/firestore";
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
  const { pins, addPin, loading, resetPins } = useBlogPins();
  const [showAddPinInput, setShowAddPinInput] = useState(false);
  const [addressInput, setAddressInput] = useState("");
  const [savingLocation, setSavingLocation] = useState(false);
  const { showAlert } = useAlert();
  const [showLocationHelp, setShowLocationHelp] = useState(false);
  const [manualPinMode, setManualPinMode] = useState(false);
  // Removed manualPinCoords as it's unused

  // State for Add Pin by Coordinates modal
  const [showAddPinByCoords, setShowAddPinByCoords] = useState(false);

  // Add missing user and showAllPins state
  const { user } = useAuth();
  const [showAllPins, setShowAllPins] = useState<boolean>(false);

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
          ...(user ? { userId: user.uid } : {}),
        };
        await addPin(newPin);
        handleInputClose();
      } else {
        alert("Address not found. Please try a different address.");
      }
    },
    [addressInput, addPin, handleInputClose, user],
  );

  // Compute travel stats from pins
  // Filter pins for user-specific stats
  // Ensure pins is always BlogMapPin[]
  const pinsArray: BlogMapPin[] = Array.isArray(pins)
    ? (pins as BlogMapPin[])
    : [];
  const userPins = user
    ? pinsArray.filter((p: BlogMapPin) => p.userId === user.uid)
    : [];
  const statsPins = showAllPins ? pinsArray : userPins;

  const mileageKm = calculateMileage(statsPins);
  const townsVisited = getUniqueTowns(statsPins).length;
  // Example state extractor: assumes state info is in pin.category or first tag
  const stateExtractor = (pin: BlogMapPin) =>
    pin.category || (pin.tags && pin.tags.length > 0 ? pin.tags[0] : undefined);
  const townsPerState = getTownsPerState(statsPins, stateExtractor);

  // Pin edit/delete modal state
  const [editingPin, setEditingPin] = useState<BlogMapPin | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editType, setEditType] = useState<"stopover" | "destination">(
    "destination",
  );
  const [deletingPin, setDeletingPin] = useState<BlogMapPin | null>(null);

  // Edit pin handler
  const handleEditPin = async () => {
    if (editingPin) {
      await updateFirestorePin(editingPin.id, {
        title: editTitle,
        description: editDescription,
        type: editingPin.type || "destination",
      });
      showAlert({
        message: "Pin updated!",
        type: "success",
        duration: 3000,
      });
      setEditingPin(null);
      setEditTitle("");
      setEditDescription("");
      resetPins();
    }
  };

  // Delete pin handler
  const handleDeletePin = async () => {
    if (deletingPin) {
      await deleteFirestorePin(deletingPin.id);
      showAlert({
        message: "Pin deleted!",
        type: "info",
        duration: 3000,
      });
      setDeletingPin(null);
      resetPins();
    }
  };

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
        {/* User Profile Box */}
        <UserProfileBox />
        {/* Toggle user pins/all pins */}
        {user && (
          <div className="fixed top-44 left-8 z-[1000]">
            <button
              className={`px-3 py-1 rounded shadow text-sm font-semibold ${
                showAllPins
                  ? "bg-gray-300 text-gray-700"
                  : "bg-blue-600 text-white"
              }`}
              onClick={() => setShowAllPins((v: boolean) => !v)}
            >
              {showAllPins ? "Show My Pins Only" : "Show All Pins"}
            </button>
            <span className="ml-2 text-xs text-gray-600">
              Pins created: {userPins.length}
            </span>
          </div>
        )}
        {/* Only show AddPinButton, AddPinInput, and AddPinByCoordsInput if user is logged in */}
        {user && (
          <>
            <AddPinButton onClick={handleAddPinClick} />
            <AddPinInput
              visible={showAddPinInput}
              address={addressInput}
              onAddressChange={handleAddressChange}
              onSubmit={handleAddressSubmit}
              onClose={handleInputClose}
            />
            {/* Add Pin by Coordinates Button */}
            <button
              className="fixed top-32 right-8 z-[1000] bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-700 transition-all text-sm flex items-center"
              style={{ minWidth: "70px" }}
              onClick={() => setShowAddPinByCoords(true)}
              aria-label="Add pin by coordinates"
            >
              Add Pin by Coordinates
            </button>
            <AddPinByCoordsInput
              visible={showAddPinByCoords}
              onClose={() => setShowAddPinByCoords(false)}
              onSubmit={async ({ lat, lng, title, description, type }) => {
                const newPin: BlogMapPin = {
                  id: "",
                  lat,
                  lng,
                  title,
                  blogUrl: "#",
                  featuredPhoto: "",
                  date: new Date().toISOString(),
                  description,
                  tags: [],
                  category: "",
                  featured: false,
                  userId: user.uid,
                  type,
                };
                await addPin(newPin);
                setShowAddPinByCoords(false);
                showAlert({
                  message: `Pin added at (${lat}, ${lng})!`,
                  type: "success",
                  duration: 4000,
                });
              }}
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
                      const newPin: BlogMapPin = {
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
                        userId: user.uid,
                      };
                      await addPin(newPin);
                      setSavingLocation(false);
                      showAlert({
                        message: `Current location saved as a pin!`,
                        type: "success",
                        duration: 4000,
                      });
                    },
                    () => {
                      setSavingLocation(false);
                      showAlert({
                        message:
                          "Unable to get current location. You can manually enter an address, coordinates, or click on the map to set your location.",
                        type: "warning",
                        duration: 6000,
                      });
                      setShowLocationHelp(true);
                      setManualPinMode(true);
                      setShowAddPinInput(true);
                    },
                  );
                } else {
                  setSavingLocation(false);
                  showAlert({
                    message:
                      "Geolocation is not supported by your browser. You can manually enter an address, coordinates, or click on the map to set your location.",
                    type: "error",
                    duration: 6000,
                  });
                  setShowLocationHelp(true);
                  setManualPinMode(true);
                  setShowAddPinInput(true);
                }
              }}
              disabled={savingLocation}
              aria-label="Save current location"
            >
              {savingLocation ? "Saving..." : "Save Current Location"}
            </button>
          </>
        )}
        {/* If not logged in, show a message */}
        {!user && (
          <div className="fixed top-24 right-8 z-[1000] bg-gray-200 text-gray-700 px-4 py-2 rounded shadow-lg text-sm">
            Please log in to add pins.
          </div>
        )}

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
          {/* Map click handler for manual pin placement */}
          <MapClickHandler
            onMapClick={
              manualPinMode && user
                ? (e: any) => {
                    const { lat, lng } = e.latlng;
                    setManualPinMode(false);
                    setShowLocationHelp(false);
                    setShowAddPinInput(false);
                    showAlert({
                      message: "Location selected! Saving pin...",
                      type: "success",
                      duration: 4000,
                    });
                    const newPin: BlogMapPin = {
                      id: "",
                      lat,
                      lng,
                      title: "Manual Location Pin",
                      blogUrl: "#",
                      featuredPhoto: "",
                      date: new Date().toISOString(),
                      description: "",
                      tags: [],
                      category: "",
                      featured: false,
                      userId: user.uid,
                    };
                    addPin(newPin);
                  }
                : undefined
            }
          />
          {!loading &&
            statsPins.map((pin: BlogMapPin) => {
              // Set marker color to light blue if pin.type === 'stopover', else normal blue
              const markerIcon =
                pin.type !== "stopover"
                  ? L.icon({
                      iconUrl:
                        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
                      iconSize: [25, 41],
                      iconAnchor: [12, 41],
                      popupAnchor: [1, -34],
                      shadowUrl:
                        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
                      shadowSize: [41, 41],
                    })
                  : L.icon({
                      iconUrl:
                        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-lightblue.png",
                      iconSize: [25, 41],
                      iconAnchor: [12, 41],
                      popupAnchor: [1, -34],
                      shadowUrl:
                        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
                      shadowSize: [41, 41],
                    });
              return (
                <Marker
                  key={pin.id}
                  position={[pin.lat, pin.lng]}
                  icon={markerIcon}
                >
                  <Popup>
                    <BlogPinPopup
                      pin={pin}
                      onEdit={() => {
                        setEditingPin(pin);
                        setEditTitle(pin.title);
                        setEditDescription(pin.description || "");
                        setEditType(pin.type || "destination");
                      }}
                      onDelete={() => setDeletingPin(pin)}
                    />
                  </Popup>
                </Marker>
              );
            })}
        </MapContainer>
        {/* Help tooltip for manual location */}
        {showLocationHelp && (
          <div className="fixed top-36 right-8 z-[1100] bg-yellow-100 border border-yellow-400 text-yellow-900 px-4 py-3 rounded shadow-lg w-80">
            <div className="font-bold mb-1">Location Help</div>
            <div>
              <span>
                Your browser could not determine your location.
                <br />
                <b>Tip:</b> You can manually set your location by clicking on
                the map, or enter an address using "Add pin".
              </span>
            </div>
            <button
              className="mt-3 px-3 py-1 bg-yellow-300 rounded text-sm font-semibold hover:bg-yellow-400"
              onClick={() => setShowLocationHelp(false)}
            >
              Dismiss
            </button>
          </div>
        )}
      </div>
      {/* Edit Pin Modal */}
      {editingPin && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-[340px]">
            <h3 className="font-bold text-lg mb-2">Edit Pin</h3>
            <label className="block mb-2 text-sm font-semibold">Title</label>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full border px-2 py-1 rounded mb-3"
            />
            <label className="block mb-2 text-sm font-semibold">Type</label>
            <select
              value={editingPin?.type || "destination"}
              onChange={(e) => {
                if (editingPin) {
                  setEditingPin({
                    ...editingPin,
                    type: e.target.value as "stopover" | "destination",
                  });
                }
              }}
              className="w-full border px-2 py-1 rounded mb-3"
            >
              <option value="destination">Destination</option>
              <option value="stopover">Stopover</option>
            </select>
            <label className="block mb-2 text-sm font-semibold">
              Description
            </label>
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="w-full border px-2 py-1 rounded mb-3"
              rows={3}
            />
            <div className="flex gap-2 justify-end">
              <button
                className="px-3 py-1 bg-gray-300 rounded"
                onClick={() => setEditingPin(null)}
              >
                Cancel
              </button>
              <button
                className="px-3 py-1 bg-blue-600 text-white rounded"
                onClick={handleEditPin}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Delete Pin Modal */}
      {deletingPin && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-[340px]">
            <h3 className="font-bold text-lg mb-2">Delete Pin</h3>
            <p className="mb-4">
              Are you sure you want to delete{" "}
              <span className="font-semibold">{deletingPin.title}</span>?
            </p>
            <div className="flex gap-2 justify-end">
              <button
                className="px-3 py-1 bg-gray-300 rounded"
                onClick={() => setDeletingPin(null)}
              >
                Cancel
              </button>
              <button
                className="px-3 py-1 bg-red-600 text-white rounded"
                onClick={handleDeletePin}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapView;
