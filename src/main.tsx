import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { AlertProvider } from "@components/common/AlertContext";
import { AlertModal } from "@components/common/AlertModal";
import "@styles/index.css";

const container = document.getElementById("root");
if (!container) throw new Error("Root container missing in index.html");

const root = createRoot(container);

root.render(
  <React.StrictMode>
    <AlertProvider>
      <AlertModal />
      <App />
    </AlertProvider>
  </React.StrictMode>,
);
