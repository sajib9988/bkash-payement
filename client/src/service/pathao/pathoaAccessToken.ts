'use server';



let tokenStore: {
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
} = {
  accessToken: null,
  refreshToken: null,
  expiresAt: null,
};

const getStoredToken = () => {
  return tokenStore;
};

const saveToken = (token: typeof tokenStore) => {
  tokenStore = token;
};

export const getAccessToken = async () => {
  const stored = getStoredToken();
  const now = Date.now();

  // ✅ accessToken এবং expiresAt দুটোই চেক করুন
  if (stored.accessToken && stored.expiresAt !== null && stored.expiresAt > now) {
    return stored.accessToken;
  }

  // Refresh Token দিয়ে নতুন টোকেন নিন
  if (stored.refreshToken) {
    try {
      const res = await fetch(`${process.env.PATHAO_API_BASE}/aladdin/api/v1/issue-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: process.env.PATHAO_CLIENT_ID,
          client_secret: process.env.PATHAO_CLIENT_SECRET,
          grant_type: 'refresh_token',
          refresh_token: stored.refreshToken,
        }),
      });

      if (!res.ok) throw new Error('Refresh failed');

      const data = await res.json();

      const newToken = {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: now + data.expires_in * 1000, // expires_in in seconds
      };

      saveToken(newToken);
      return data.access_token;
    } catch (error) {
      console.warn('Refresh token failed', error);
    }
  }

  // Password grant: নতুন টোকেন নিন
  try {
    const res = await fetch(`${process.env.PATHAO_API_BASE}/aladdin/api/v1/issue-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.PATHAO_CLIENT_ID,
        client_secret: process.env.PATHAO_CLIENT_SECRET,
        grant_type: 'password',
        username: process.env.PATHAO_USERNAME,
        password: process.env.PATHAO_PASSWORD,
      }),
    });

    if (!res.ok) throw new Error('Token issuance failed');

    const data = await res.json();

    const newToken = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: now + data.expires_in * 1000,
    };

    saveToken(newToken);
    return data.access_token;
  } catch (error) {
    console.error('Failed to get access token', error);
    throw new Error('Unable to authenticate with Pathao API');
  }
};