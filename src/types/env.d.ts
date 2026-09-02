/// <reference types="vite/client" />

/**
 * Type declarations for VITE_ environment variables.
 * All variables must be declared here to get autocomplete and type safety.
 * Values are set in .env.local (never committed) based on .env.example.
 */
interface ImportMetaEnv {
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_ENV: 'development' | 'staging' | 'production';
  readonly VITE_API_BASE_URL: string;
  readonly VITE_MARKET_API_BASE_URL: string;
  readonly VITE_AI_SERVICE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
