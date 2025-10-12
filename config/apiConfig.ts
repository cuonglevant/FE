// Unified API configuration (single source of truth)
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const ENV_FLASK = (process.env as any)?.EXPO_PUBLIC_FLASK_URL || (globalThis as any)?.EXPO_PUBLIC_FLASK_URL;
const ENV_BE = (process.env as any)?.EXPO_PUBLIC_BE_URL || (globalThis as any)?.EXPO_PUBLIC_BE_URL;

const execEnv = (Constants as any)?.executionEnvironment; // 'bare' | 'standalone' | 'storeClient'
const releaseChannel = (process.env as any)?.EXPO_PUBLIC_RELEASE_CHANNEL || '';
const isDevice = execEnv === 'standalone' || (!!releaseChannel && releaseChannel !== 'development');

// Production backend URL
const PRODUCTION_URL = 'https://be-service-od7h.onrender.com';

// Development fallback
const FALLBACK_LAN_IP = '192.168.1.4';
const localhostForPlatform = Platform.OS === 'android' ? FALLBACK_LAN_IP : 'localhost';
const DEV_URL = `http://${localhostForPlatform}:5000`;

// Use production URL by default, can be overridden by env var
export const API_BASE = ENV_FLASK || ENV_BE || PRODUCTION_URL;
export const FLASK_URL = API_BASE;
export const BE_URL = API_BASE;

// Specific endpoints
export const UPLOAD_URL = `${API_BASE}/scan/answers`;

export const API_CONFIG = {
  API_BASE,
  BE_URL,
  FLASK_URL,
  isDevice,
  UPLOAD_URL,
  PRODUCTION_URL,
  DEV_URL,
};

export default API_CONFIG;
