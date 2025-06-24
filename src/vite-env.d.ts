/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_MAPS_API_KEY: string
  readonly VITE_PLANT_DETAIL_URL_PATTERN: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
