// Unified API configuration (single source of truth)
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const ENV_FLASK = (process.env as any)?.EXPO_PUBLIC_FLASK_URL || (globalThis as any)?.EXPO_PUBLIC_FLASK_URL;
const ENV_BE = (process.env as any)?.EXPO_PUBLIC_BE_URL || (globalThis as any)?.EXPO_PUBLIC_BE_URL;

const execEnv = (Constants as any)?.executionEnvironment; // 'bare' | 'standalone' | 'storeClient'
const releaseChannel = (process.env as any)?.EXPO_PUBLIC_RELEASE_CHANNEL || '';
const isDevice = execEnv === 'standalone' || (!!releaseChannel && releaseChannel !== 'development');

const FALLBACK_LAN_IP = '192.168.1.4';
const localhostForPlatform = Platform.OS === 'android' ? FALLBACK_LAN_IP : 'localhost';

export const FLASK_URL = ENV_FLASK || `http://${localhostForPlatform}:5000`;
export const API_BASE = `${FLASK_URL}`;
export const UPLOAD_URL = `${FLASK_URL}/scan/p1`;
export const BE_URL = ENV_BE || `http://${localhostForPlatform}:5000`;

export const API_CONFIG = {
  API_BASE,
  BE_URL,
  FLASK_URL,
  isDevice,
  UPLOAD_URL,
};

export default API_CONFIG;
