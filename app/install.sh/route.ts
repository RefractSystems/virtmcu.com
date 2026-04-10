import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/server/firebase-admin';

export async function GET(request: NextRequest) {
  const GITHUB_SCRIPT_URL =
    'https://raw.githubusercontent.com/RefractSystems/virtmcu/main/scripts/install.sh';

  try {
    // 1. Extract Metadata from the incoming CURL request
    const ip =
      request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    // The user-agent usually tells us if they used 'curl' or a browser
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // 2. "Fire and Forget" Logging
    // We log the download hit to Firestore using the secure Admin SDK.
    // Notice there is NO 'await' here! We don't pause the server to wait for
    // the database write to finish. This ensures the user's terminal download
    // is lightning fast and completely unaffected by database latency.
    adminDb
      .collection('install_script_hits')
      .add({
        timestamp: new Date(),
        ip,
        userAgent,
      })
      .catch(console.error);

    // 3. Fetch the actual installation script from GitHub
    const response = await fetch(GITHUB_SCRIPT_URL, { cache: 'no-store' });
    if (!response.ok) {
      return new NextResponse('Error fetching install script', { status: 500 });
    }

    // 4. Return the script to be piped into bash
    const content = await response.text();

    return new NextResponse(content, {
      headers: {
        'Content-Type': 'text/x-shellscript',
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    console.error('Failed to fetch install script:', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
