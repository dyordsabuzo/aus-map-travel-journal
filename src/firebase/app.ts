import { Logger } from "@/utils/logger";
import { initializeApp } from "firebase/app";

export const getApp = () => {
  return Logger.withTryCatchSync(() => {
    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    };

    // Check if any required environment variable is missing
    if (
      !firebaseConfig.apiKey ||
      !firebaseConfig.authDomain ||
      !firebaseConfig.projectId ||
      !firebaseConfig.storageBucket ||
      !firebaseConfig.messagingSenderId ||
      !firebaseConfig.appId
    ) {
      throw new Error(
        "Missing Firebase configuration. Please check your environment variables.",
      );
    }

    return initializeApp(firebaseConfig);
  }, "initializing firebase app");
};
