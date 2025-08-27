/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly ORS_API_KEY: string;
  readonly VITE_ORS_API_KEY: string;
  readonly LOG_LEVEL: string;
  readonly VITE_LOG_LEVEL: string;

  // add more env variables here if needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
