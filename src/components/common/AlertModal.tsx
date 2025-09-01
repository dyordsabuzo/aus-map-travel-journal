import React, { useEffect, useRef } from "react";
import { useAlert } from "@components/common/AlertContext";
import { AlertType } from "../../types/AlertType";

export const AlertModal: React.FC = () => {
  const { alert, hideAlert } = useAlert();
  const modalRef = useRef<HTMLDivElement>(null);

  const { message, type, isVisible, title } = alert;

  // Dynamically set background and text colors based on alert type
  const getColors = (alertType: AlertType) => {
    switch (alertType) {
      case "success":
        return "bg-green-100 border-green-400 text-green-700";
      case "warning":
        return "bg-yellow-100 border-yellow-400 text-yellow-700";
      case "error":
        return "bg-red-100 border-red-400 text-red-700";
      case "info":
      default:
        return "bg-blue-100 border-blue-400 text-blue-700";
    }
  };

  const alertColors = getColors(type);

  // Close alert when clicking outside or pressing Escape
  useEffect(() => {
    if (!isVisible) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        hideAlert();
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        hideAlert();
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isVisible, hideAlert]);

  if (!isVisible) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-[9999]"
        onClick={hideAlert}
      ></div>

      {/* Alert Modal */}
      <div
        ref={modalRef}
        className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                    max-w-md w-full p-6 rounded-lg shadow-xl
                    border-l-4 z-[10000] transition-all duration-300 ease-in-out
                    ${alertColors}`}
        role="alert"
      >
        <div className="flex justify-between items-center mb-4">
          <p className="font-semibold text-lg">
            {title || type.charAt(0).toUpperCase() + type.slice(1)}
          </p>
          <button
            onClick={hideAlert}
            className={`text-current opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-current focus:ring-opacity-50 rounded-full p-1 -mr-2`}
            aria-label="Close alert"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>
        <p className="text-sm">{message}</p>
        <div className="mt-4 text-right">
          <button
            onClick={hideAlert}
            className={`px-4 py-2 text-sm font-medium rounded-md
                        border border-transparent transition-colors duration-200
                        ${
                          type === "error"
                            ? "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
                            : type === "warning"
                              ? "bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500"
                              : type === "success"
                                ? "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500"
                                : "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500"
                        }
                        focus:outline-none focus:ring-2 focus:ring-offset-2`}
          >
            Got it
          </button>
        </div>
      </div>
    </>
  );
};
