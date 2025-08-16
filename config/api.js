// Central API config with sensible defaults for simulator/emulator and support for Expo runtime env overrides
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Allow overriding via Expo env (set EXPO_PUBLIC_FLASK_URL / EXPO_PUBLIC_BE_URL)
// For production (Google Play build) configure these in app config (app.json / eas.json env)
const ENV_FLASK = process.env.EXPO_PUBLIC_FLASK_URL;
const ENV_BE = process.env.EXPO_PUBLIC_BE_URL;

// Detect if running in a published (store) environment vs development.
// executionEnvironment === 'standalone' for production builds; fallback to presence of release channel.
const execEnv = Constants.executionEnvironment; // 'bare', 'standalone', 'storeClient'
const releaseChannel = process.env.EXPO_PUBLIC_RELEASE_CHANNEL || '';
const isDevice = execEnv === 'standalone' || (!!releaseChannel && releaseChannel !== 'development');

// On Android emulator, localhost of the host machine is 10.0.2.2; on iOS simulator it's localhost
// IMPORTANT: Replace FALLBACK_LAN_IP with your development machine LAN IP for on‑device debugging.
// Keep a single source so only one edit is needed.
const FALLBACK_LAN_IP = '192.168.1.4';
const localhostForPlatform = Platform.OS === 'android' ? FALLBACK_LAN_IP : 'localhost';

// Flask/OpenCV server (image upload & grading)
export const FLASK_URL = ENV_FLASK || `http://${localhostForPlatform}:5000`;
// JSON API endpoint for processing exam images
export const UPLOAD_URL = `${FLASK_URL}/api/process`;

// Node/Express backend
// In production (installed APK), we must NOT rely on LAN IPs; BE URL must be a publicly reachable domain / HTTPS.
// Provide EXPO_PUBLIC_BE_URL at build time. We deliberately do not fallback to LAN IP when running standalone device
// because that would be unreachable; instead we still fallback only if dev (not standalone).
export const BE_URL = ENV_BE || (isDevice ? 'https://YOUR_PUBLIC_BACKEND_DOMAIN' : `http://${localhostForPlatform}:8080`);
export const API_BASE = `${BE_URL}/api`;

// Helper for logging current resolved endpoints (dev only)
if (__DEV__) {
	// eslint-disable-next-line no-console
	console.log('[API CONFIG]', { BE_URL, FLASK_URL, API_BASE, isDevice });
}
