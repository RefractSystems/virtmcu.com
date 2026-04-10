import { NextResponse } from 'next/server';

export async function GET() {
  const GITHUB_SCRIPT_URL =
    'https://raw.githubusercontent.com/RefractSystems/virtmcu/main/scripts/uninstall.sh';

  try {
    const response = await fetch(GITHUB_SCRIPT_URL, { cache: 'no-store' });
    if (!response.ok) {
      return new NextResponse('Error fetching uninstall script', { status: 500 });
    }

    const content = await response.text();

    return new NextResponse(content, {
      headers: {
        'Content-Type': 'text/x-shellscript',
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    console.error('Failed to fetch uninstall script:', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
