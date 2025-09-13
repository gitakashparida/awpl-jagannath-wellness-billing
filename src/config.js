// Load environment variables from .env file in development
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const config = {
    supabase: {
        url: import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL,
        anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY,
    },
    workerUrl: import.meta.env.VITE_WORKER_URL || process.env.VITE_WORKER_URL
};

export default config;
