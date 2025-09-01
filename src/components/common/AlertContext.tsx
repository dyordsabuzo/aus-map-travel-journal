import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  useEffect, // Add useEffect
  ReactNode,
} from "react";
import {
  AlertContextType,
  AlertState,
  AlertOptions,
  AlertType,
} from "../../types/AlertType";

const AlertContext = createContext<AlertContextType | undefined>(undefined);

// AlertProvider component
export const AlertProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [alert, setAlert] = useState<AlertState>({
    message: "",
    type: "info",
    isVisible: false,
    title: undefined,
    duration: undefined,
    onClose: undefined,
  });

  // Function to show the alert
  const showAlert = useCallback(
    ({ message, type = "info", title, duration, onClose }: AlertOptions) => {
      setAlert({ message, type, isVisible: true, title, duration, onClose });
    },
    [],
  );

  // Function to hide the alert
  const hideAlert = useCallback(() => {
    setAlert((prev: AlertState) => {
      if (prev.isVisible && prev.onClose) {
        prev.onClose(); // Call the callback if it exists and alert was visible
      }
      return {
        message: "",
        type: "info",
        isVisible: false,
        title: undefined,
        duration: undefined,
        onClose: undefined,
      };
    });
  }, []); // hideAlert now depends on the alert state indirectly through prev

  // Effect for auto-dismissal
  useEffect(() => {
    if (alert.isVisible && alert.duration && alert.duration > 0) {
      const timer = setTimeout(() => {
        hideAlert();
      }, alert.duration);
      return () => clearTimeout(timer); // Cleanup on unmount or if alert hides manually
    }
  }, [alert.isVisible, alert.duration, hideAlert]); // Dependency array for the effect

  const value = {
    showAlert,
    hideAlert,
    alert,
  };

  return (
    <AlertContext.Provider value={value}>{children}</AlertContext.Provider>
  );
};

// Custom hook to use the alert context
export const useAlert = () => {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return context;
};
