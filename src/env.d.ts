/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly ORS_API_KEY: string;
  readonly VITE_ORS_API_KEY: string;
  // add more env variables here if needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
