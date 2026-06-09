// ============================================
// WHATSAPP BOT CONFIGURATION FOR TERMUX
// ============================================
// Edit the values below with your own information
// After cloning to Termux, edit ONLY this file

export default {
    // ----- REQUIRED SETTINGS (CHANGE THESE!) -----
    
    // Command prefix (default is -)
    PREFIX: '-',
    
    // Your WhatsApp number with country code (NO plus sign, NO spaces)
    // Example: 911234567890 for India (+91)
    MY_NUMBER: '911234567890',
    
    // The bot's WhatsApp number (same as MY_NUMBER for self-hosting)
    BOT_NUMBER: '911234567890',
    
    // Moderator numbers (comma-separated, same format as above)
    // Example: '911234567890,919876543210'
    MODERATORS: '911234567890',
    
    // MongoDB Atlas connection string
    // Get this from https://mongodb.com/atlas
    MONGODB_KEY: 'mongodb+srv://username:password@cluster.mongodb.net/database',
    
    // Password for the admin web dashboard (http://localhost:8000/admin)
    ADMIN_PASSWORD: 'admin123',
    
    // Secret key for session encryption (any random string)
    SESSION_SECRET: 'mySuperSecretKey123456789',
    
    // ----- SERVER SETTINGS -----
    
    // Port for the web server (default: 8000)
    PORT: 8000,
    
    // Environment (production or development)
    NODE_ENV: 'production',
    
    // ----- TERMUX-SPECIFIC PATHS -----
    
    // FFmpeg path in Termux (install with: pkg install ffmpeg)
    FFMPEG_PATH: '/data/data/com.termux/files/usr/bin/ffmpeg',
    
    // ----- OPTIONAL API KEYS (Add if you have them) -----
    
    // Google Gemini API for AI chat commands
    // GOOGLE_API_KEY: '',
    
    // Google Custom Search for -img command
    // GOOGLE_API_KEY_SEARCH: '',
    // SEARCH_ENGINE_KEY: '',
    
    // Genius API for lyrics command (-l)
    // GENIUS_ACCESS_SECRET: '',
    
    // Remove.bg API for background removal (-removebg)
    // REMOVE_BG_KEY: '',
    
    // Pinterest API key
    // PIN_KEY: '',
    
    // Truecaller API ID
    // TRUECALLER_ID: '',
    
    // Twitter API bearer token
    // TWITTER_BEARER_TOKEN: '',
    
    // ----- YOUTUBE DOWNLOAD SETTINGS -----
    
    // YOUTUBE_DELAY_BETWEEN_REQUESTS: 1000,
    // YOUTUBE_MAX_RETRIES: 3,
    // YOUTUBE_RETRY_DELAY: 2000,
    // MAX_AUDIO_SIZE_MB: 50,
    // MAX_VIDEO_SIZE_MB: 50,
    // DOWNLOAD_TIMEOUT_SECONDS: 600,
    // YOUTUBE_DEBUG: false,
    // ENABLE_USER_AGENT_ROTATION: true,
    // FORCE_DISABLE_YTDLP: false,
};

// ============================================
// INSTRUCTIONS:
// 1. Replace ALL values marked with YOUR_ 
// 2. Save this file as config.js
// 3. After cloning to Termux, edit this file with real values
// 4. For MongoDB, create free cluster at mongodb.com/atlas
// ============================================
