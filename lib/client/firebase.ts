// This file initializes the Firebase Client SDK.
// The 'client-only' package ensures this file is never accidentally imported
// into a Server Component, which would cause SSR hydration issues or bundle bloat.
import 'client-only';

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import { getFirestore, Firestore } from 'firebase/firestore';

// Initialize or get the Firebase app
let app: FirebaseApp | undefined;
let db: Firestore | undefined;

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

if (getApps().length === 0) {
  // Try automatic initialization first (Firebase App Hosting)
  try {
    app = initializeApp();
    console.log('🔥 Initialized Firebase with App Hosting automatic configuration.');
  } catch {
    // If automatic fails, try manual config from environment variables
    if (firebaseConfig.apiKey && firebaseConfig.projectId) {
      try {
        app = initializeApp(firebaseConfig);
        console.log('🔥 Initialized Firebase with manual environment configuration.');
      } catch (manualErr) {
        console.error('❌ Failed to initialize Firebase with manual config:', manualErr);
      }
    } else {
      console.warn(
        '⚠️ Firebase automatic initialization failed and no environment variables found.',
      );
    }
  }
} else {
  // Reuse existing app instance (for hot-reloading)
  app = getApps()[0];
}

// Initialize Firestore if app is available
if (app) {
  db = getFirestore(app);
}

if (typeof window !== 'undefined' && app) {
  // Initialize Firebase App Check
  // Uses the environment variable in production, falls back to the hardcoded public key locally.
  const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  if (!RECAPTCHA_SITE_KEY) {
    console.warn(
      '⚠️ NEXT_PUBLIC_RECAPTCHA_SITE_KEY is not defined. Firebase App Check will not be initialized.',
    );
  } else {
    if (process.env.NODE_ENV !== 'production' && typeof self !== 'undefined') {
      // Enable the App Check debug token in local development
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
    }
    try {
      initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(RECAPTCHA_SITE_KEY),
        isTokenAutoRefreshEnabled: true,
      });
      console.log('🛡️ Firebase App Check initialized.');
    } catch (err) {
      console.error('❌ Failed to initialize Firebase App Check:', err);
    }
  }
}

// Analytics instance cache
let analyticsInstance: Analytics | null = null;

/**
 * Gets the Firebase Analytics instance.
 * Initializes it if it doesn't exist and the browser supports it.
 * This function should only be called on the client side.
 */
export const getAnalyticsInstance = async () => {
  if (analyticsInstance) {
    return analyticsInstance;
  }

  if (typeof window !== 'undefined' && app) {
    try {
      const isSupportedResult = await isSupported();
      if (isSupportedResult) {
        console.log('✅ Firebase Analytics is supported and has been initialized.');
        analyticsInstance = getAnalytics(app);
        return analyticsInstance;
      }
    } catch (err) {
      console.error('❌ Failed to initialize Firebase Analytics:', err);
    }
  }

  return null;
};

export { app, db };
