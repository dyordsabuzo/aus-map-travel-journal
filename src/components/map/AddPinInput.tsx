import React, { useRef, useEffect } from "react";

interface AddPinInputProps {
  visible: boolean;
  address: string;
  onAddressChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

const AddPinInput: React.FC<AddPinInputProps> = ({
  visible,
  address,
  onAddressChange,
  onSubmit,
  onClose,
}) => {
  const inputFormRef = useRef<HTMLFormElement>(null);

  // Hide input when clicking outside
  useEffect(() => {
    if (!visible) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        inputFormRef.current &&
        !inputFormRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [visible, onClose]);

  return (
    <form
      ref={inputFormRef}
      onSubmit={onSubmit}
      className={`fixed top-16 right-8 z-[1000] bg-white rounded-lg shadow-lg px-4 py-3 flex items-center gap-2 transition-all duration-500 ${
        visible
          ? "translate-x-0 opacity-100"
          : "translate-x-[400px] opacity-0 pointer-events-none"
      }`}
      style={{ minWidth: "220px" }}
    >
      <input
        type="text"
        placeholder="Enter address..."
        value={address}
        onChange={onAddressChange}
        className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none"
        autoFocus={visible}
      />
      <button
        type="submit"
        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-xs"
      >
        Add
      </button>
    </form>
  );
};

export default AddPinInput;
