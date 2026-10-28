/**
 * Resilient Firebase Configuration
 * Reads from process.env / secrets with hardcoded fallback to prevent dev server crashes
 * if firebase-applet-config.json is modified or deleted.
 */

import rawAppletConfig from '../../firebase-applet-config.json';

export interface FirebaseAppConfig {
  projectId: string;
  appId: string;
  apiKey: string;
  authDomain: string;
  firestoreDatabaseId: string;
  storageBucket: string;
  messagingSenderId: string;
  measurementId: string;
  oAuthClientId: string;
  recaptchaSiteKey: string;
}

const resolveStorageBucket = (): string => {
  const bucket = typeof process !== 'undefined' ? process.env?.FIREBASE_STORAGEBUCKET : undefined;
  if (!bucket) return 'gen-lang-client-0573899362.firebasestorage.app';
  if (bucket.endsWith('.ap')) return bucket + 'p';
  return bucket;
};

const appletConfig = (rawAppletConfig || {}) as Record<string, string>;

export const resolvedFirebaseConfig: FirebaseAppConfig = {
  projectId:
    (typeof process !== 'undefined' && process.env?.FIREBASE_PROJECT_ID) ||
    appletConfig.projectId ||
    'gen-lang-client-0573899362',
  appId:
    (typeof process !== 'undefined' && process.env?.FIREBASE_APPID) ||
    appletConfig.appId ||
    '1:273839089094:web:29e91b77d5f931fae3bec7',
  apiKey:
    (typeof process !== 'undefined' && process.env?.FIREBASE_API_KEY) ||
    appletConfig.apiKey ||
    'AIzaSyByI9tGaGi3MX-7IhMaYsQXqVoG5yYhbss',
  authDomain:
    (typeof process !== 'undefined' && process.env?.FIREBASE_AUTHDOMAIN) ||
    appletConfig.authDomain ||
    'gen-lang-client-0573899362.firebaseapp.com',
  firestoreDatabaseId:
    appletConfig.firestoreDatabaseId ||
    'ai-studio-cf7d8c68-3d56-4be3-9582-2d8d0481bcfc',
  storageBucket:
    appletConfig.storageBucket ||
    resolveStorageBucket(),
  messagingSenderId:
    (typeof process !== 'undefined' && process.env?.FIREBASE_MESSAGINGSENDER) ||
    appletConfig.messagingSenderId ||
    '273839089094',
  measurementId: appletConfig.measurementId || '',
  oAuthClientId:
    appletConfig.oAuthClientId ||
    '273839089094-bhngsnq05plpj0jpqj6bnm9dbg7mm65g.apps.googleusercontent.com',
  recaptchaSiteKey:
    (typeof process !== 'undefined' && process.env?.RECAPTCHA_SITE_KEY) ||
    appletConfig.recaptchaSiteKey ||
    '6LeNrt4tAAAAANvI5Tjm3K-p3yzSDGlCvWiVGqRR',
};

export default resolvedFirebaseConfig;
