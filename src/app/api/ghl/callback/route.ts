import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    console.error('GHL OAuth Redirect Error:', error);
    return NextResponse.json({ error: `OAuth Error: ${error}` }, { status: 400 });
  }

  if (!code) {
    return NextResponse.json({ error: 'Missing authorization code.' }, { status: 400 });
  }

  const clientId = process.env.GHL_CLIENT_ID;
  const clientSecret = process.env.GHL_CLIENT_SECRET;
  const redirectUri = process.env.GHL_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.json(
      { error: 'GHL App Credentials are not configured in environment variables.' },
      { status: 500 }
    );
  }

  try {
    const params = new URLSearchParams();
    params.append('client_id', clientId);
    params.append('client_secret', clientSecret);
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('redirect_uri', redirectUri);

    const response = await fetch('https://services.leadconnectorhq.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Error exchanging token:', data);
      return NextResponse.json(
        { error: data.message || data.error_description || 'Failed to exchange authorization code.' },
        { status: response.status }
      );
    }

    const {
      access_token,
      refresh_token,
      expires_in,
      locationId,
      companyId,
    } = data;

    if (!locationId) {
      // If it's agency level authorization, we might not get a locationId directly.
      // But for our sub-account integration, locationId is crucial.
      return NextResponse.json(
        { error: 'Authorization succeeded, but no locationId (sub-account) was found. Please authorize for a specific location.' },
        { status: 400 }
      );
    }

    // Save tokens in database
    const expiresAt = Date.now() + expires_in * 1000;
    db.saveTokens(locationId, {
      accessToken: access_token,
      refreshToken: refresh_token,
      expiresAt,
      locationId,
      companyId,
    });

    // Redirect user to the dashboard UI, passing the locationId to personalize the session
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return NextResponse.redirect(`${appUrl}?locationId=${locationId}`);
  } catch (err: any) {
    console.error('OAuth Callback Exception:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
