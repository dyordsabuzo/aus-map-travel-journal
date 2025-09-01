import React from "react";

interface AddPinButtonProps {
  onClick: () => void;
  label?: string;
  className?: string;
}

const AddPinButton: React.FC<AddPinButtonProps> = ({
  onClick,
  label = "Add pin",
  className = "",
}) => (
  <button
    className={`bg-green-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-green-700 transition-all text-sm ${className}`}
    style={{ minWidth: "70px" }}
    onClick={onClick}
    aria-label={label}
    type="button"
  >
    {label}
  </button>
);

export default AddPinButton;
