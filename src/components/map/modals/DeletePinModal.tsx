import React from "react";
import { BlogMapPin } from "../../../types/BlogType";

interface DeletePinModalProps {
  pin: BlogMapPin | null;
  onCancel: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

const DeletePinModal: React.FC<DeletePinModalProps> = ({
  pin,
  onCancel,
  onConfirm,
  loading = false,
}) => {
  if (!pin) return null;

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-[340px]">
        <h3 className="font-bold text-lg mb-2">Delete Pin</h3>
        <p className="mb-4">
          Are you sure you want to delete{" "}
          <span className="font-semibold">{pin.title}</span>?
        </p>
        <div className="flex gap-2 justify-end">
          <button
            className="px-3 py-1 bg-gray-300 rounded"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="px-3 py-1 bg-red-600 text-white rounded"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeletePinModal;
