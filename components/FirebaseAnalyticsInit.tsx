import { Suspense } from 'react';
import { FirebaseAnalyticsWatcher } from './FirebaseAnalyticsWatcher';

export default function FirebaseAnalyticsInit() {
  return (
    <Suspense fallback={null}>
      {/*
        The watcher is wrapped in Suspense, so it doesn't block
        the initial server render. It will run on the client side.
      */}
      <FirebaseAnalyticsWatcher />
    </Suspense>
  );
}
