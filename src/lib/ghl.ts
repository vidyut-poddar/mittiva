import { db } from './db';

const CLIENT_ID = process.env.GHL_CLIENT_ID || '';
const CLIENT_SECRET = process.env.GHL_CLIENT_SECRET || '';

/**
 * Returns a valid access token for a location, automatically refreshing it if expired or expiring soon.
 */
export async function getValidAccessToken(locationId: string): Promise<string> {
  const tokens = db.getTokens(locationId);
  if (!tokens) {
    throw new Error(`No GHL authorization found for location: ${locationId}. Please authenticate first.`);
  }

  // Refresh if token has expired or is expiring in the next 5 minutes
  if (Date.now() + 5 * 60 * 1000 >= tokens.expiresAt) {
    console.log(`Refreshing GHL access token for location: ${locationId}`);
    try {
      const params = new URLSearchParams();
      params.append('client_id', CLIENT_ID);
      params.append('client_secret', CLIENT_SECRET);
      params.append('grant_type', 'refresh_token');
      params.append('refresh_token', tokens.refreshToken);
      params.append('user_type', 'Location');

      const response = await fetch('https://services.leadconnectorhq.com/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params,
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Error refreshing token from GHL:', data);
        throw new Error(data.message || data.error_description || 'Failed to refresh token.');
      }

      const expiresAt = Date.now() + data.expires_in * 1000;
      const newTokens = {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt,
        locationId: data.locationId || locationId,
        companyId: data.companyId,
      };

      db.saveTokens(locationId, newTokens);
      return data.access_token;
    } catch (err) {
      console.error('Token refresh exception:', err);
      throw err;
    }
  }

  return tokens.accessToken;
}

/**
 * Retrieves a contact from GoHighLevel by ID.
 */
export async function getContact(locationId: string, contactId: string) {
  try {
    const token = await getValidAccessToken(locationId);
    const response = await fetch(`https://services.leadconnectorhq.com/contacts/${contactId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Version: '2021-04-15',
      },
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'Failed to fetch contact details from GHL.');
    }

    const data = await response.json();
    return data.contact;
  } catch (err) {
    console.error('GHL getContact error:', err);
    throw err;
  }
}

/**
 * Updates a contact's custom fields in GoHighLevel.
 */
export async function updateContactCustomFields(
  locationId: string,
  contactId: string,
  customFields: { id: string; value: any }[]
) {
  try {
    const token = await getValidAccessToken(locationId);
    const response = await fetch(`https://services.leadconnectorhq.com/contacts/${contactId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        Version: '2021-04-15',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ customFields }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Error updating GHL contact custom fields:', data);
      throw new Error(data.message || 'Failed to update contact custom fields.');
    }

    return data.contact;
  } catch (err) {
    console.error('GHL updateContactCustomFields error:', err);
    throw err;
  }
}

/**
 * Gets custom fields defined inside a GHL Location (sub-account).
 * Helpful to dynamically map field IDs by custom field names/keys.
 */
export async function getCustomFields(locationId: string) {
  try {
    const token = await getValidAccessToken(locationId);
    const response = await fetch(`https://services.leadconnectorhq.com/locations/${locationId}/customFields`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Version: '2021-04-15',
      },
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'Failed to fetch location custom fields.');
    }

    const data = await response.json();
    return data.customFields || [];
  } catch (err) {
    console.error('GHL getCustomFields error:', err);
    throw err;
  }
}

/**
 * Gets a custom field by name, or creates it if it doesn't exist.
 * Returns the field's ID.
 */
export async function getOrCreateCustomField(locationId: string, fieldName: string): Promise<string> {
  try {
    const fields = await getCustomFields(locationId);
    const existing = fields.find((f: any) => f.name.toLowerCase() === fieldName.toLowerCase());

    if (existing) {
      return existing.id;
    }

    console.log(`Creating GHL Custom Field: "${fieldName}" for location: ${locationId}`);
    const token = await getValidAccessToken(locationId);
    const response = await fetch(`https://services.leadconnectorhq.com/locations/${locationId}/customFields`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Version: '2021-04-15',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: fieldName,
        dataType: 'TEXT',
        placeholder: 'URL of the generated AI try-on image',
        model: 'contact',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Error creating GHL custom field:', data);
      throw new Error(data.message || 'Failed to create GHL custom field.');
    }

    return data.customField.id;
  } catch (err) {
    console.error('GHL getOrCreateCustomField error:', err);
    throw err;
  }
}
