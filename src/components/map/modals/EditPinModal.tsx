import React, { useState, useEffect } from "react";
import { BlogMapPin, PinType } from "../../../types/BlogType";

interface EditPinModalProps {
  pin: BlogMapPin | null;
  visible: boolean;
  onSave: (updated: {
    title: string;
    description: string;
    type: PinType;
  }) => void;
  onClose: () => void;
}

const EditPinModal: React.FC<EditPinModalProps> = ({
  pin,
  visible,
  onSave,
  onClose,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<PinType>("destination");
  const [distance, setDistance] = useState<number>(0);
  const [accommodationCost, setAccommodationCost] = useState<number>(0);
  const [featuredPhoto, setFeaturedPhoto] = useState<string>("");

  useEffect(() => {
    if (pin) {
      setTitle(pin.title);
      setDescription(pin.description || "");
      setType(pin.type || "destination");
      setDistance(typeof pin.distance === "number" ? pin.distance : 0);
      setAccommodationCost(
        typeof pin.accommodationCost === "number" ? pin.accommodationCost : 0,
      );
      setFeaturedPhoto(pin.featuredPhoto || "");
    }
  }, [pin]);

  if (!visible || !pin) return null;

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-[340px]">
        <h3 className="font-bold text-lg mb-2">Edit Pin</h3>
        <label className="block mb-2 text-sm font-semibold">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border px-2 py-1 rounded mb-3"
        />
        <label className="block mb-2 text-sm font-semibold">Type</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as PinType)}
          className="w-full border px-2 py-1 rounded mb-3"
        >
          <option value="destination">Destination</option>
          <option value="stopover">Stopover</option>
          <option value="home">Home</option>
          <option value="fuel">Fuel</option>
          <option value="sight-see">Sight-see</option>
        </select>
        <label className="block mb-2 text-sm font-semibold">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border px-2 py-1 rounded mb-3"
          rows={3}
        />
        <label className="block mb-2 text-sm font-semibold">
          Distance (km)
        </label>
        <input
          type="number"
          value={distance}
          min={0}
          step={0.1}
          onChange={(e) => setDistance(Number(e.target.value))}
          className="w-full border px-2 py-1 rounded mb-3"
          placeholder="Distance traveled"
        />
        <label className="block mb-2 text-sm font-semibold">
          Accommodation Cost ($)
        </label>
        <input
          type="number"
          value={accommodationCost}
          min={0}
          step={0.01}
          onChange={(e) => setAccommodationCost(Number(e.target.value))}
          className="w-full border px-2 py-1 rounded mb-3"
          placeholder="Accommodation cost"
        />
        <label className="block mb-2 text-sm font-semibold">Photo URL</label>
        <input
          type="text"
          value={featuredPhoto}
          onChange={(e) => setFeaturedPhoto(e.target.value)}
          className="w-full border px-2 py-1 rounded mb-3"
          placeholder="Paste image URL here"
        />
        {featuredPhoto && (
          <div className="mb-3 flex justify-center">
            <img
              src={featuredPhoto}
              alt="Pin preview"
              style={{
                maxWidth: "120px",
                maxHeight: "120px",
                borderRadius: "8px",
              }}
            />
          </div>
        )}
        <div className="flex gap-2 justify-end">
          <button className="px-3 py-1 bg-gray-300 rounded" onClick={onClose}>
            Cancel
          </button>
          <button
            className="px-3 py-1 bg-blue-600 text-white rounded"
            onClick={() =>
              onSave({
                title,
                description,
                type,
                distance,
                accommodationCost,
                featuredPhoto,
              })
            }
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPinModal;
