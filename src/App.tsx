import React, { useState } from "react";
import MapView from "./components/MapView";
import { Pin } from "./types";

const initialPins: Pin[] = [];

function App() {
  const [pins, setPins] = useState<Pin[]>(initialPins);
  const [startIdx, setStartIdx] = useState<number | null>(null);
  const [endIdx, setEndIdx] = useState<number | null>(null);

  // Handle map click to add a new pin
  const handleMapClick = (e: any) => {
    if (!e.latlng) return;
    const coords: [number, number] = [e.latlng.lat, e.latlng.lng];
    const placeName = prompt("Enter the name of this place:");
    if (!placeName) return;
    setPins((prev) => [...prev, { coords, placeName, media: [], travels: [] }]);
  };

  // Handle media upload for a pin
  const handleMediaUpload = (pinIdx: number, files: FileList) => {
    const fileObjs = Array.from(files).map((file) => ({
      url: URL.createObjectURL(file),
      type: file.type,
      name: file.name,
    }));
    setPins((prev) =>
      prev.map((pin, idx) =>
        idx === pinIdx ? { ...pin, media: [...pin.media, ...fileObjs] } : pin,
      ),
    );
  };

  // Set a pin as start point
  const handleSetStart = (idx: number) => {
    setStartIdx(idx);
    // If end is same as start, reset end
    if (endIdx === idx) setEndIdx(null);
  };

  // Set a pin as end point
  const handleSetEnd = (idx: number) => {
    setEndIdx(idx);
    // If start is same as end, reset start
    if (startIdx === idx) setStartIdx(null);

    // If a start point is selected, add this end point to the travels of the start pin
    if (startIdx !== null && startIdx !== idx) {
      setPins((prevPins) =>
        prevPins.map((pin, i) =>
          i === startIdx
            ? {
                ...pin,
                travels: pin.travels.includes(idx)
                  ? pin.travels
                  : [...pin.travels, idx],
              }
            : pin,
        ),
      );
    }
  };

  return (
    <div className="h-screen w-screen bg-gray-100">
      <MapView
        pins={pins}
        onMapClick={handleMapClick}
        onMediaUpload={handleMediaUpload}
        startIdx={startIdx}
        endIdx={endIdx}
        onSetStart={handleSetStart}
        onSetEnd={handleSetEnd}
      />
    </div>
  );
}

export default App;
