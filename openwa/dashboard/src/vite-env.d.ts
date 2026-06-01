/// <reference types="vite/client" />

declare const __APP_VERSION__: string;
declare const __BUILD_TIME__: string;

interface ImportMetaEnv {
  /** Absolute backend API base URL, e.g. https://api.example.com/api (unset in dev). */
  readonly VITE_API_URL?: string;
  /** Optional explicit Socket.IO origin, e.g. https://api.example.com. */
  readonly VITE_WS_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
