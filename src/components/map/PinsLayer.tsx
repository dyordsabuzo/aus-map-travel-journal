import React from "react";
import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import BlogPinPopup from "./BlogPinPopup";
import { BlogMapPin } from "../../types/BlogType";
import RestIcon from "../../svg/Rest.svg";

interface PinsLayerProps {
  pins: BlogMapPin[];
  loading: boolean;
  onEditPin: (pin: BlogMapPin) => void;
  onDeletePin: (pin: BlogMapPin) => void;
}

const getMarkerIcon = (type?: string) =>
  type !== "stopover"
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
    : null; // We'll render Rest.svg for stopover pins

const PinsLayer: React.FC<PinsLayerProps> = ({
  pins,
  loading,
  onEditPin,
  onDeletePin,
}) => {
  if (loading) return null;

  return (
    <>
      {pins.map((pin) =>
        pin.type === "stopover" ? (
          <Marker
            key={pin.id}
            position={[pin.lat, pin.lng]}
            icon={L.divIcon({
              html: `<img src="${RestIcon}" style="width:30px;height:30px;" alt="Rest" />`,
              iconSize: [30, 30],
              className: "",
            })}
          >
            <Popup className="my-custom-popup" maxWidth={350}>
              <div className="popup-inner bg-white rounded-xl shadow-lg border border-blue-300">
                <BlogPinPopup
                  pin={pin}
                  onEdit={() => onEditPin(pin)}
                  onDelete={() => onDeletePin(pin)}
                />
              </div>
            </Popup>
          </Marker>
        ) : (
          <Marker
            key={pin.id}
            position={[pin.lat, pin.lng]}
            icon={getMarkerIcon(pin.type) ?? undefined}
          >
            <Popup>
              <BlogPinPopup
                pin={pin}
                onEdit={() => onEditPin(pin)}
                onDelete={() => onDeletePin(pin)}
              />
            </Popup>
          </Marker>
        ),
      )}
    </>
  );
};

export default PinsLayer;
