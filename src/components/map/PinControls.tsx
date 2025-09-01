import React from "react";
import AddPinButton from "./AddPinButton";
import AddPinInput from "./AddPinInput";
import AddPinByCoordsInput from "./AddPinByCoordsInput";

interface PinControlsProps {
  user: { uid: string } | null;
  showAddPinInput: boolean;
  setShowAddPinInput: (v: boolean) => void;
  addressInput: string;
  setAddressInput: (v: string) => void;
  handleAddressChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAddressSubmit: (e: React.FormEvent) => void;
  handleInputClose: () => void;
  showAddPinByCoords: boolean;
  setShowAddPinByCoords: (v: boolean) => void;
  handleAddPinByCoords: (pin: {
    lat: number;
    lng: number;
    title: string;
    description: string;
    type: "stopover" | "destination";
  }) => Promise<void>;
  savingLocation: boolean;
  setSavingLocation: (v: boolean) => void;
  showAlert: (opts: {
    message: string;
    type: string;
    duration?: number;
  }) => void;
  setShowLocationHelp: (v: boolean) => void;
  setManualPinMode: (v: boolean) => void;
}

const PinControls: React.FC<PinControlsProps> = ({
  user,
  showAddPinInput,
  setShowAddPinInput,
  addressInput,
  // setAddressInput, // Removed unused prop to fix diagnostic
  handleAddressChange,
  handleAddressSubmit,
  handleInputClose,
  showAddPinByCoords,
  setShowAddPinByCoords,
  handleAddPinByCoords,
  savingLocation,
  setSavingLocation,
  showAlert,
  setShowLocationHelp,
  setManualPinMode,
}) => {
  if (!user) {
    return (
      <div className="fixed top-24 right-8 z-[1000] bg-gray-200 text-gray-700 px-4 py-2 rounded shadow-lg text-sm">
        Please log in to add pins.
      </div>
    );
  }

  return (
    <>
      <AddPinButton onClick={() => setShowAddPinInput(!showAddPinInput)} />
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
        onSubmit={async (pin) => {
          await handleAddPinByCoords(pin);
          setShowAddPinByCoords(false);
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
                await handleAddPinByCoords({
                  lat: latitude,
                  lng: longitude,
                  title: "My Current Location",
                  description: "",
                  type: "destination",
                });
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
  );
};

export default PinControls;
