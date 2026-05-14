/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BOT_TOKEN: string;
  readonly VITE_CLIENT_ID: string;
  readonly VITE_CLIENT_SECRET: string;
  readonly VITE_INVITE_URL: string;
  readonly VITE_DASHBOARD_URL: string;
  readonly VITE_SUPPORT_SERVER: string;
  readonly VITE_BOT_ID: string;
  readonly VITE_TOPGG_TOKEN: string;
  readonly VITE_API_BASE_URL: string;
  readonly VITE_WS_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
