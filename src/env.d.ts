/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly ORS_API_KEY: string;
  readonly VITE_ORS_API_KEY: string;
  readonly LOG_LEVEL: string;
  readonly VITE_LOG_LEVEL: string;

  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
  // add more env variables here if needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
