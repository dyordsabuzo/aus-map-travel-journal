import React from "react";
import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import BlogPinPopup from "./BlogPinPopup";
import { BlogMapPin } from "../../types/BlogType";
import RestIcon from "../../svg/Rest.svg";
import HomeIcon from "../icons/HomeIcon";
import GasStation from "../icons/GasStation";
import SightSee from "../icons/SightSee";

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

  // Import createRoot once, outside the map loop for efficiency
  let createRoot: ((container: Element | DocumentFragment) => any) | undefined;
  const getCreateRoot = async () => {
    if (!createRoot) {
      // @ts-ignore
      const ReactDOM = await import("react-dom/client");
      createRoot = ReactDOM.createRoot;
    }
    return createRoot;
  };

  return (
    <>
      {pins.map((pin, index) => {
        if (pin.type === "stopover") {
          return (
            <Marker
              key={`pin-${index}-${pin.id}`}
              position={[pin.lat, pin.lng]}
              icon={L.divIcon({
                html: `<img src="${RestIcon}" style="width:30px;height:30px;" alt="Rest" />`,
                iconSize: [30, 30],
                className: "",
              })}
            >
              <Popup className="my-custom-popup" maxWidth={350}>
                <div className="popup-inner bg-white rounded-xl shadow-lg p-4 border border-blue-300">
                  <BlogPinPopup
                    pin={pin}
                    onEdit={() => onEditPin(pin)}
                    onDelete={() => onDeletePin(pin)}
                  />
                </div>
              </Popup>
            </Marker>
          );
        }
        if (pin.type === "home") {
          return (
            <Marker
              key={pin.id}
              position={[pin.lat, pin.lng]}
              icon={L.divIcon({
                html: `<span style="display:flex;align-items:center;justify-content:center;width:25px;height:25px;"><span id="home-icon-marker"></span></span>`,
                iconSize: [25, 25],
                className: "",
              })}
              eventHandlers={{
                add: async () => {
                  const el = document.querySelector("#home-icon-marker");
                  if (el) {
                    const createRootFn = await getCreateRoot();
                    if (createRootFn) {
                      const root = createRootFn(el);
                      root.render(<HomeIcon size="25" />);
                    }
                  }
                },
              }}
            >
              <Popup>
                <BlogPinPopup
                  pin={pin}
                  onEdit={() => onEditPin(pin)}
                  onDelete={() => onDeletePin(pin)}
                />
              </Popup>
            </Marker>
          );
        }
        if (pin.type === "fuel") {
          return (
            <Marker
              key={pin.id}
              position={[pin.lat, pin.lng]}
              icon={L.divIcon({
                html: `<span style="display:flex;align-items:center;justify-content:center;width:25px;height:25px;"><span id="fuel-icon-marker-${pin.id}"></span></span>`,
                iconSize: [25, 25],
                className: "",
              })}
              eventHandlers={{
                add: async () => {
                  const el = document.querySelector(
                    `#fuel-icon-marker-${pin.id}`,
                  );
                  if (el) {
                    const createRootFn = await getCreateRoot();
                    if (createRootFn) {
                      const root = createRootFn(el);
                      root.render(<GasStation size="25" />);
                    }
                  }
                },
              }}
            >
              <Popup>
                <BlogPinPopup
                  pin={pin}
                  onEdit={() => onEditPin(pin)}
                  onDelete={() => onDeletePin(pin)}
                />
              </Popup>
            </Marker>
          );
        }
        if (pin.type === "sight-see") {
          return (
            <Marker
              key={pin.id}
              position={[pin.lat, pin.lng]}
              icon={L.divIcon({
                html: `<span style="display:flex;align-items:center;justify-content:center;width:25px;height:25px;"><span id="sightsee-icon-marker-${pin.id}"></span></span>`,
                iconSize: [25, 25],
                className: "",
              })}
              eventHandlers={{
                add: async () => {
                  const el = document.querySelector(
                    `#sightsee-icon-marker-${pin.id}`,
                  );
                  if (el) {
                    const createRootFn = await getCreateRoot();
                    if (createRootFn) {
                      const root = createRootFn(el);
                      root.render(<SightSee size="25" />);
                    }
                  }
                },
              }}
            >
              <Popup>
                <BlogPinPopup
                  pin={pin}
                  onEdit={() => onEditPin(pin)}
                  onDelete={() => onDeletePin(pin)}
                />
              </Popup>
            </Marker>
          );
        }
        return (
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
        );
      })}
    </>
  );
};

export default PinsLayer;
