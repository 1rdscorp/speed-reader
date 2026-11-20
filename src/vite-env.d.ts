/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL of the page endpoint used for link import; link import is off when unset. */
  readonly VITE_PAGE_ENDPOINT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
