import React, { useState } from "react";

export interface AddPinByCoordsInputProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (pin: {
    lat: number;
    lng: number;
    title: string;
    description: string;
    type: "stopover" | "destination";
  }) => void;
}

const isValidLat = (lat: number) => lat >= -90 && lat <= 90;
const isValidLng = (lng: number) => lng >= -180 && lng <= 180;

const AddPinByCoordsInput: React.FC<AddPinByCoordsInputProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const [lat, setLat] = useState<string>("");
  const [lng, setLng] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [type, setType] = useState<"stopover" | "destination">("destination");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);

    if (isNaN(latNum) || isNaN(lngNum)) {
      setError("Latitude and longitude must be numbers.");
      return;
    }
    if (!isValidLat(latNum) || !isValidLng(lngNum)) {
      setError(
        "Latitude must be between -90 and 90. Longitude must be between -180 and 180.",
      );
      return;
    }
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }

    setError("");
    onSubmit({
      lat: latNum,
      lng: lngNum,
      title: title.trim(),
      description: description.trim(),
      type,
    });
    setLat("");
    setLng("");
    setTitle("");
    setDescription("");
    setType("destination");
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-[340px]">
        <h3 className="font-bold text-lg mb-2">Add Pin by Coordinates</h3>
        <form onSubmit={handleSubmit}>
          <label className="block mb-2 text-sm font-semibold">Latitude</label>
          <input
            type="number"
            step="any"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            className="w-full border px-2 py-1 rounded mb-3"
            placeholder="e.g. -33.8688"
            required
          />
          <label className="block mb-2 text-sm font-semibold">Longitude</label>
          <input
            type="number"
            step="any"
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            className="w-full border px-2 py-1 rounded mb-3"
            placeholder="e.g. 151.2093"
            required
          />
          <label className="block mb-2 text-sm font-semibold">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border px-2 py-1 rounded mb-3"
            placeholder="Pin title"
            required
          />
          <label className="block mb-2 text-sm font-semibold">Type</label>
          <select
            value={type}
            onChange={(e) =>
              setType(
                e.target.value as "stopover" | "destination" | "home" | "fuel",
              )
            }
            className="w-full border px-2 py-1 rounded mb-3"
            required
          >
            <option value="destination">Destination</option>
            <option value="stopover">Stopover</option>
            <option value="home">Home</option>
            <option value="fuel">Fuel</option>
          </select>
          <label className="block mb-2 text-sm font-semibold">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border px-2 py-1 rounded mb-3"
            rows={2}
            placeholder="Pin description (optional)"
          />
          {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
          <div className="flex gap-2 justify-end mt-2">
            <button
              type="button"
              className="px-3 py-1 bg-gray-300 rounded"
              onClick={() => {
                setError("");
                setLat("");
                setLng("");
                setTitle("");
                setDescription("");
                onClose();
                setType("destination");
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1 bg-blue-600 text-white rounded"
            >
              Add Pin
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPinByCoordsInput;
