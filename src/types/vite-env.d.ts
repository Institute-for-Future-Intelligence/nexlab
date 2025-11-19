/// <reference types="vite/client" />

interface ImportMetaEnv {
    // Define all environment variables you use here
    readonly VITE_API_KEY: string;
    readonly VITE_AUTH_DOMAIN: string;
    readonly VITE_PROJECT_ID: string;
    readonly VITE_STORAGE_BUCKET: string;
    readonly VITE_MESSAGING_SENDER_ID: string;
    readonly VITE_APP_ID: string;
    readonly VITE_DEPLOY_ENV: string;
    readonly VITE_GOOGLE_ANALYTICS_ID: string;
    readonly VITE_CHATBOT_DEFAULT_ID: string;
    // REMOVED: VITE_GEMINI_*_API_KEY - now handled securely by Firebase Functions
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}