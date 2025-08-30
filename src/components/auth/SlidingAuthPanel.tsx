import React from "react";
import AuthUI from "./AuthUI";

const SlidingAuthPanel: React.FC<{
  open: boolean;
  onClose: () => void;
}> = ({ open, onClose }) => (
  <>
    {/* Overlay */}
    <div
      className={`fixed inset-0 z-[1999] bg-black bg-opacity-30 transition-opacity duration-500 ${
        open
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      }`}
      onClick={onClose}
      aria-hidden="true"
    />
    {/* Sliding Panel (from left) */}
    <div
      className={`fixed top-0 left-0 h-full w-80 max-w-full z-[2000] bg-white dark:bg-gray-900 shadow-lg transition-transform duration-500 ${
        open ? "translate-x-0" : "-translate-x-full pointer-events-none"
      }`}
      style={{ maxWidth: "100vw" }}
      role="dialog"
      aria-modal="true"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <span className="font-bold text-lg text-gray-800 dark:text-gray-100">
          Authentication
        </span>
        <button
          className="text-2xl font-bold text-gray-600 dark:text-gray-300 hover:text-blue-600"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
      </div>
      <div className="p-4">
        <AuthUI />
      </div>
    </div>
  </>
);

export default SlidingAuthPanel;
