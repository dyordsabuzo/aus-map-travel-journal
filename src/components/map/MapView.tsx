import React from "react";
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
import PinPopup from "./PinPopup";
import { Pin } from "@types/PinTypes";

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

interface MapViewProps {
  pins: Pin[];
  onMapClick: (e: any) => void;
  onMediaUpload: (pinIdx: number, files: FileList) => void;
  startIdx: number | null;
  endIdx: number | null;
  onSetStart: (idx: number) => void;
  onSetEnd: (idx: number) => void;
}

function MapClickHandler({ onMapClick }: { onMapClick: (e: any) => void }) {
  useMapEvents({
    click: (e) => {
      if (onMapClick) onMapClick(e);
    },
  });
  return null;
}

const MapView: React.FC<MapViewProps> = ({
  pins,
  onMapClick,
  onMediaUpload,
  startIdx,
  endIdx,
  onSetStart,
  onSetEnd,
}) => (
  <MapContainer
    center={AUSTRALIA_CENTER}
    zoom={4}
    minZoom={4}
    maxZoom={19}
    className="h-screen w-screen"
    maxBounds={AUSTRALIA_BOUNDS}
    maxBoundsViscosity={1.0}
  >
    <TileLayer
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    />
    <MapClickHandler onMapClick={onMapClick} />
    {pins.map((pin, idx) => (
      <Marker key={idx} position={pin.coords}>
        <Popup>
          <PinPopup
            pin={pin}
            onMediaUpload={(files) => onMediaUpload(idx, files)}
          />
          <div className="flex flex-col gap-2 mt-2">
            <button
              className={`px-2 py-1 rounded text-white ${
                startIdx === idx
                  ? "bg-green-600"
                  : "bg-green-400 hover:bg-green-600"
              }`}
              onClick={() => onSetStart(idx)}
              disabled={startIdx === idx}
            >
              {startIdx === idx ? "Start Point" : "Set as Start"}
            </button>
            <button
              className={`px-2 py-1 rounded text-white ${
                endIdx === idx ? "bg-blue-600" : "bg-blue-400 hover:bg-blue-600"
              }`}
              onClick={() => onSetEnd(idx)}
              disabled={endIdx === idx}
            >
              {endIdx === idx ? "End Point" : "Set as End"}
            </button>
          </div>
        </Popup>
      </Marker>
    ))}
    {/* Draw dashed lines for all travels */}
    {pins.map((pin, idx) =>
      pin.travels.map((targetIdx) => {
        const targetPin = pins[targetIdx];
        if (!targetPin) return null;
        return (
          <Polyline
            key={`travel-${idx}-${targetIdx}`}
            positions={[pin.coords, targetPin.coords]}
            pathOptions={{
              color: "#2563eb",
              dashArray: "8 12",
              weight: 4,
              opacity: 0.7,
            }}
          />
        );
      })
    )}
  </MapContainer>
);

export default MapView;
