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
} from "../../utils/travelstats";
import { BlogMapPin } from "../../types/BlogType";
import { useBlogPins } from "./hooks/useBlogPins";
import { geocodeAddress } from "./utils/geocodeAddress";

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
  const { pins, addPin, loading } = useBlogPins();
  const [showAddPinInput, setShowAddPinInput] = useState(false);
  const [addressInput, setAddressInput] = useState("");

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
          id: `user-${Date.now()}`,
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
        addPin(newPin);
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
  const stateExtractor = (pin: BlogMapPin) =>
    pin.category || (pin.tags && pin.tags.length > 0 ? pin.tags[0] : undefined);
  const townsPerState = getTownsPerState(pins, stateExtractor);

  return (
    <div className="relative h-screen w-screen">
      <AddPinButton onClick={handleAddPinClick} />
      <AddPinInput
        visible={showAddPinInput}
        address={addressInput}
        onAddressChange={handleAddressChange}
        onSubmit={handleAddressSubmit}
        onClose={handleInputClose}
      />
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
  );
};

export default MapView;
