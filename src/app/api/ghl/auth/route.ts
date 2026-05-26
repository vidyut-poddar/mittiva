import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const locationId = searchParams.get('locationId') || '';

  const clientId = process.env.GHL_CLIENT_ID;
  const redirectUri = process.env.GHL_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: 'GHL App Credentials are not configured in environment variables.' },
      { status: 500 }
    );
  }

  // Scopes required for custom field read/write and contact details
  const scopes = [
    'contacts.readonly',
    'contacts.write',
    'locations.readonly',
    'custom-menu-link.readonly',
    'custom-menu-link.write',
  ].join(' ');

  // GHL OAuth URL for v2 API
  const authUrl = new URL('https://marketplace.gohighlevel.com/oauth/chooselocation');
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('client_id', clientId);
  authUrl.searchParams.append('redirect_uri', redirectUri);
  authUrl.searchParams.append('scope', scopes);
  
  if (locationId) {
    authUrl.searchParams.append('state', locationId); // pass locationId as state to tie it back
  }

  return NextResponse.redirect(authUrl.toString());
}
