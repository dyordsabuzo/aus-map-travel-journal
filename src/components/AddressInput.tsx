import React, { useState, FormEvent } from "react";

interface AddressInputProps {
  onSubmit: (address: string) => void;
  loading?: boolean;
  placeholder?: string;
  buttonLabel?: string;
  className?: string;
}

const AddressInput: React.FC<AddressInputProps> = ({
  onSubmit,
  loading = false,
  placeholder = "Enter an address (e.g. Sydney Opera House, NSW)",
  buttonLabel = "Add Pin by Address",
  className = "",
}) => {
  const [address, setAddress] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (address.trim() && !loading) {
      onSubmit(address.trim());
      setAddress("");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex items-center gap-2 px-4 py-2 bg-white border-b border-gray-200 ${className}`}
      style={{ zIndex: 10 }}
    >
      <input
        type="text"
        className="flex-1 px-3 py-2 border border-gray-300 rounded"
        placeholder={placeholder}
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        disabled={loading}
        autoComplete="off"
      />
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        disabled={loading || !address.trim()}
      >
        {loading ? "Locating..." : buttonLabel}
      </button>
    </form>
  );
};

export default AddressInput;
