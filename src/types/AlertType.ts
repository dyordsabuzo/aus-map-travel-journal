// Define the types for the alert state and context
export type AlertType = "info" | "success" | "warning" | "error";

export type AlertOptions = {
  message: string;
  type?: AlertType;
  title?: string;
  duration?: number; // Duration in milliseconds for auto-dismissal
  onClose?: () => void; // Callback function when alert is closed
};

export type AlertState = {
  message: string;
  type: AlertType;
  isVisible: boolean;
  title?: string;
  duration?: number;
  onClose?: () => void;
};

export type AlertContextType = {
  showAlert: (options: AlertOptions) => void;
  hideAlert: () => void;
  alert: AlertState;
};
