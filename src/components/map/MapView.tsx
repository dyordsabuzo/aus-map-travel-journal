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
import BlogPinPopup from "./BlogPinPopup";
import { BlogMapPin } from "../../types/BlogType";
import { getBlogMapPins } from "@utils/blogProcessor";

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

const MapView: React.FC = () => {
  const [pins, setPins] = React.useState<BlogMapPin[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchPins = async () => {
      setLoading(true);
      const blogPins = await getBlogMapPins();
      setPins(blogPins);
      setLoading(false);
    };
    fetchPins();
  }, []);

  return (
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
      <MapClickHandler />
      {!loading &&
        pins.map((pin, idx) => (
          <Marker key={pin.id} position={[pin.lat, pin.lng]}>
            <Popup>
              <BlogPinPopup pin={pin} />
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  );
};

export default MapView;
