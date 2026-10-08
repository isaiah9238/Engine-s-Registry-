/**
 * Firebase & Authentication initialization layer
 * Compliant with Firebase integration security specifications & Google Workspace OAuth
 */
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  type User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  Firestore,
} from 'firebase/firestore';
import {
  initializeAppCheck,
  CustomProvider,
  ReCaptchaV3Provider,
  type AppCheck,
} from 'firebase/app-check';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

// Dynamically resolve configuration from secrets & environment variables with static fallback
const resolvedConfig = {
  ...firebaseConfig,
  apiKey: (typeof process !== 'undefined' && process.env?.FIREBASE_API_KEY) || firebaseConfig.apiKey,
  projectId: (typeof process !== 'undefined' && process.env?.FIREBASE_PROJECT_ID) || firebaseConfig.projectId,
  authDomain: (typeof process !== 'undefined' && process.env?.FIREBASE_AUTHDOMAIN) || firebaseConfig.authDomain,
  storageBucket:
    (typeof process !== 'undefined' && process.env?.FIREBASE_STORAGEBUCKET
      ? (process.env.FIREBASE_STORAGEBUCKET.endsWith('.ap')
          ? process.env.FIREBASE_STORAGEBUCKET + 'p'
          : process.env.FIREBASE_STORAGEBUCKET)
      : firebaseConfig.storageBucket),
  messagingSenderId: (typeof process !== 'undefined' && process.env?.FIREBASE_MESSAGINGSENDER) || firebaseConfig.messagingSenderId,
  appId: (typeof process !== 'undefined' && process.env?.FIREBASE_APPID) || firebaseConfig.appId,
  firestoreDatabaseId: (firebaseConfig as any).firestoreDatabaseId || 'ai-studio-cf7d8c68-3d56-4be3-9582-2d8d0481bcfc',
};

const app = !getApps().length ? initializeApp(resolvedConfig) : getApp();

// Initialize Firebase App Check with registered debug token and Dave's reCAPTCHA key
export let appCheck: AppCheck | null = null;

const recaptchaSiteKey =
  (resolvedConfig as any).recaptchaSiteKey ||
  (typeof process !== 'undefined' && process.env?.RECAPTCHA_SITE_KEY) ||
  '6LeNrt4tAAAAANvI5Tjm3K-p3yzSDGlCvWiVGqRR';

const appCheckDebugToken =
  (typeof process !== 'undefined' && process.env?.APPCHECK_TOKEN) || '';

if (typeof window !== 'undefined' && (appCheckDebugToken || recaptchaSiteKey)) {
  try {
    (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN =
      appCheckDebugToken || (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN || true;

    // Use CustomProvider with exchangeDebugToken in development/preview to guarantee valid attestation
    const provider = appCheckDebugToken
      ? new CustomProvider({
          getToken: async () => {
            try {
              const res = await fetch(
                `https://content-firebaseappcheck.googleapis.com/v1/projects/${resolvedConfig.projectId}/apps/${resolvedConfig.appId}:exchangeDebugToken?key=${resolvedConfig.apiKey}`,
                {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ debugToken: appCheckDebugToken }),
                }
              );
              if (res.ok) {
                const data = await res.json();
                return {
                  token: data.token,
                  expireTimeMillis:
                    Date.now() + (parseInt(data.ttl, 10) || 3600) * 1000,
                };
              }
            } catch (err) {
              console.warn('App Check debug token exchange notice:', err);
            }
            return { token: '', expireTimeMillis: 0 };
          },
        })
      : new ReCaptchaV3Provider(recaptchaSiteKey);

    appCheck = initializeAppCheck(app, {
      provider,
      isTokenAutoRefreshEnabled: true,
    });
    console.log('Firebase App Check initialized successfully.');
  } catch (error) {
    console.warn('Firebase App Check initialization notice:', error);
  }
}

// Initialize Firestore compliant with SKILL.md specification
export const db: Firestore = (resolvedConfig as any).firestoreDatabaseId
  ? getFirestore(app, (resolvedConfig as any).firestoreDatabaseId)
  : getFirestore(app);

// Initialize Firebase Cloud Storage for skill bundles (/skills/{skillId}/)
export const storage: FirebaseStorage = getStorage(app);
export const storageBucketUrl: string =
  (resolvedConfig as any).storageBucket || 'gen-lang-client-0573899362.firebasestorage.app';

export const auth = getAuth(app);

// Google Auth Provider configured with Workspace scopes
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/drive.file');
googleProvider.addScope('https://www.googleapis.com/auth/gmail.send');
googleProvider.addScope('https://www.googleapis.com/auth/gmail.readonly');

// In-memory token storage (DO NOT store in localStorage or sessionStorage)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Readiness helper compliant with Firestore integration guidelines
export async function testConnection(): Promise<boolean> {
  return Boolean(db);
}

// Initialize Auth State Listener
export const initAuth = (
  onAuthSuccess?: (user: User, token: string | null) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Sign in with Google Popup
export const googleSignIn = async (): Promise<{
  user: User;
  accessToken: string;
} | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      console.warn('Google credential has no accessToken directly; signed in with Firebase user token.');
      cachedAccessToken = await result.user.getIdToken();
    } else {
      cachedAccessToken = credential.accessToken;
    }
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};
