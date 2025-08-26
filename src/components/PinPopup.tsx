import React, { useRef } from "react";
import { Pin } from "../types";

interface PinPopupProps {
  pin: Pin;
  onMediaUpload: (files: FileList) => void;
}

const PinPopup: React.FC<PinPopupProps> = ({ pin, onMediaUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && onMediaUpload) {
      onMediaUpload(e.target.files);
    }
  };

  return (
    <div className="min-w-[200px]">
      <h4 className="mb-2 font-semibold">{pin.placeName}</h4>
      <div className="flex flex-wrap gap-2 mb-2">
        {pin.media.length > 0 ? (
          pin.media.map((file, idx) =>
            file.type.startsWith("image") ? (
              <img
                key={idx}
                src={file.url}
                alt={file.name}
                className="w-20 h-20 object-cover rounded"
              />
            ) : (
              <video
                key={idx}
                src={file.url}
                controls
                className="w-20 h-20 rounded bg-black"
              />
            ),
          )
        ) : (
          <span className="text-gray-400">No media yet.</span>
        )}
      </div>
      <input
        type="file"
        multiple
        accept="image/*,video/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      <button
        type="button"
        className="px-3 py-1 text-sm rounded border border-gray-300 bg-gray-100 hover:bg-gray-200"
        onClick={() => fileInputRef.current?.click()}
      >
        Add Photos/Videos
      </button>
    </div>
  );
};

export default PinPopup;
