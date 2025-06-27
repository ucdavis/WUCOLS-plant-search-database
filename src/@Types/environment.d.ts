declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PUBLIC_URL: string;
      NODE_ENV: "development" | "production";
      VITE_GOOGLE_MAPS_API_KEY: string;
      VITE_PLANT_DETAIL_URL_PATTERN: string;
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {};
