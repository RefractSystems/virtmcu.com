// This module uses Node.js specific APIs and runs with Admin privileges.
// The 'server-only' package ensures this file can NEVER accidentally be imported
// into a Next.js Client Component, which would leak server code to the browser.
import 'server-only';

import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

if (!getApps().length) {
  try {
    // In Firebase App Hosting, the GOOGLE_APPLICATION_CREDENTIALS
    // environment variable is automatically set, so initializeApp()
    // without arguments works perfectly.
    initializeApp();
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
}

export const adminDb = getFirestore();
