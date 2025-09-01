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
import { BlogMapPin, PinType } from "../../types/BlogType";
import { useBlogPins } from "./hooks/useBlogPins";
import { geocodeAddress } from "./utils/geocodeAddress";
import { useAlert } from "@components/common/AlertContext";
import EditPinModal from "./modals/EditPinModal";
import DeletePinModal from "./modals/DeletePinModal";
import PinControls from "./PinControls";
import PinsLayer from "./PinsLayer";

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
  const { showAlert } = useAlert();
  const { user } = useAuth();

  // Pin controls state
  const [showAddPinInput, setShowAddPinInput] = useState(false);
  const [addressInput, setAddressInput] = useState("");
  const [showAddPinByCoords, setShowAddPinByCoords] = useState(false);
  const [savingLocation, setSavingLocation] = useState(false);
  const [showLocationHelp, setShowLocationHelp] = useState(false);
  const [manualPinMode, setManualPinMode] = useState(false);

  // Pin modals state
  const [editingPin, setEditingPin] = useState<BlogMapPin | null>(null);
  const [deletingPin, setDeletingPin] = useState<BlogMapPin | null>(null);

  // Pin filter state
  const [showAllPins, setShowAllPins] = useState<boolean>(false);

  // Pin stats
  const pinsArray: BlogMapPin[] = Array.isArray(pins)
    ? (pins as BlogMapPin[])
    : [];
  const userPins = user ? pinsArray.filter((p) => p.userId === user.uid) : [];
  const statsPins = showAllPins ? pinsArray : userPins;
  const mileageKm = calculateMileage(statsPins);
  const townsVisited = getUniqueTowns(statsPins).length;
  const stateExtractor = (pin: BlogMapPin) =>
    pin.category || (pin.tags && pin.tags.length > 0 ? pin.tags[0] : undefined);
  const townsPerState = getTownsPerState(statsPins, stateExtractor);

  // Pin add/edit handlers
  const handleAddressChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setAddressInput(e.target.value),
    [],
  );
  const handleInputClose = useCallback(() => {
    setShowAddPinInput(false);
    setAddressInput("");
  }, []);
  const handleAddressSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!addressInput.trim()) return;
      const geo = await geocodeAddress(addressInput);
      if (geo) {
        const newPin: BlogMapPin = {
          id: "",
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
          userId: user?.uid,
          type: "destination",
        };
        await addPin(newPin);
        handleInputClose();
      } else {
        showAlert({
          message: "Address not found. Please try a different address.",
          type: "warning",
          duration: 5000,
        });
      }
    },
    [addressInput, addPin, handleInputClose, user, showAlert],
  );
  const handleAddPinByCoords = async ({
    lat,
    lng,
    title,
    description,
    type,
  }: {
    lat: number;
    lng: number;
    title: string;
    description: string;
    type: PinType;
  }) => {
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
      userId: user?.uid,
      type,
    };
    await addPin(newPin);
    showAlert({
      message: `Pin added at (${lat}, ${lng})!`,
      type: "success",
      duration: 4000,
    });
  };

  // Edit pin handler
  const handleEditPin = async (updated: {
    title: string;
    description: string;
    type: PinType;
  }) => {
    if (editingPin) {
      await updateFirestorePin(editingPin.id, {
        title: updated.title,
        description: updated.description,
        type: updated.type,
      });
      showAlert({
        message: "Pin updated!",
        type: "success",
        duration: 3000,
      });
      setEditingPin(null);
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

  // Map click handler for manual pin placement
  const MapClickHandler = useCallback(() => {
    useMapEvents({
      click: (e) => {
        if (manualPinMode && user) {
          const { lat, lng } = e.latlng;
          setManualPinMode(false);
          setShowLocationHelp(false);
          setShowAddPinInput(false);
          showAlert({
            message: "Location selected! Saving pin...",
            type: "success",
            duration: 4000,
          });
          handleAddPinByCoords({
            lat,
            lng,
            title: "Manual Location Pin",
            description: "",
            type: "destination",
          });
        }
      },
    });
    return null;
  }, [manualPinMode, user, showAlert]);

  // Compute travel stats from pins
  // Filter pins for user-specific stats
  // Ensure pins is always BlogMapPin[]
  // const pinsArray: BlogMapPin[] = Array.isArray(pins)
  //   ? (pins as BlogMapPin[])
  //   : [];
  // const userPins = user
  //   ? pinsArray.filter((p: BlogMapPin) => p.userId === user.uid)
  //   : [];
  // const statsPins = showAllPins ? pinsArray : userPins;

  // const mileageKm = calculateMileage(statsPins);
  // const townsVisited = getUniqueTowns(statsPins).length;
  // Example state extractor: assumes state info is in pin.category or first tag
  // const stateExtractor = (pin: BlogMapPin) =>
  //   pin.category || (pin.tags && pin.tags.length > 0 ? pin.tags[0] : undefined);
  // const townsPerState = getTownsPerState(statsPins, stateExtractor);

  // Pin edit/delete modal state
  // const [editingPin, setEditingPin] = useState<BlogMapPin | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editType, setEditType] = useState<"stopover" | "destination">(
    "destination",
  );
  // const [deletingPin, setDeletingPin] = useState<BlogMapPin | null>(null);

  // Edit pin handler
  // const handleEditPin = async () => {
  //   if (editingPin) {
  //     await updateFirestorePin(editingPin.id, {
  //       title: editTitle,
  //       description: editDescription,
  //       type: editingPin.type || "destination",
  //     });
  //     showAlert({
  //       message: "Pin updated!",
  //       type: "success",
  //       duration: 3000,
  //     });
  //     setEditingPin(null);
  //     setEditTitle("");
  //     setEditDescription("");
  //     resetPins();
  //   }
  // };

  // Delete pin handler
  // const handleDeletePin = async () => {
  //   if (deletingPin) {
  //     await deleteFirestorePin(deletingPin.id);
  //     showAlert({
  //       message: "Pin deleted!",
  //       type: "info",
  //       duration: 3000,
  //     });
  //     setDeletingPin(null);
  //     resetPins();
  //   }
  // };

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
          <div className="fixed bottom-44 left-8 z-[1000]">
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
        <PinControls
          user={user}
          showAddPinInput={showAddPinInput}
          setShowAddPinInput={setShowAddPinInput}
          addressInput={addressInput}
          setAddressInput={setAddressInput}
          handleAddressChange={handleAddressChange}
          handleAddressSubmit={handleAddressSubmit}
          handleInputClose={handleInputClose}
          showAddPinByCoords={showAddPinByCoords}
          setShowAddPinByCoords={setShowAddPinByCoords}
          handleAddPinByCoords={handleAddPinByCoords}
          savingLocation={savingLocation}
          setSavingLocation={setSavingLocation}
          showAlert={showAlert}
          setShowLocationHelp={setShowLocationHelp}
          setManualPinMode={setManualPinMode}
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
          <PinsLayer
            pins={statsPins}
            loading={loading}
            onEditPin={(pin) => setEditingPin(pin)}
            onDeletePin={(pin) => setDeletingPin(pin)}
          />
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
        <EditPinModal
          pin={editingPin}
          visible={!!editingPin}
          onSave={handleEditPin}
          onClose={() => setEditingPin(null)}
        />
        <DeletePinModal
          pin={deletingPin}
          onCancel={() => setDeletingPin(null)}
          onConfirm={handleDeletePin}
        />
      </div>
    </div>
  );
};

export default MapView;
