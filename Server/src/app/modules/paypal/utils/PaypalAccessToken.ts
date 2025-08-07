export const getAccessToken = async () => {
  const baseURL = process.env.PAYPAL_BASE_URL;
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  console.log('credentials', { baseURL, clientId, clientSecret });

  if (!baseURL || !clientId || !clientSecret) {
    throw new Error("❌ PayPal credentials are missing in environment variables.");
  }

  const response = await fetch(`${baseURL}/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(
        `${clientId}:${clientSecret}`
      ).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
  });
console.log('responsr form access token', response);
  if (!response.ok) {
    const error = await response.json();
    console.error("❌ PayPal token fetch error:", error);
    throw new Error("Failed to fetch PayPal access token");
  }

  const data = await response.json();
  console.log("Access token from paypal fetched successfully:", data);
  return data.access_token;
};
