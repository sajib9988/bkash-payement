


 export const  getAccessToken= async () => {
        const response = await fetch(`${process.env.paypal_Base_URL}/oauth2/token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${Buffer.from(`${process.env.client_Id}:${process.env.client_Secret}`).toString('base64')}`,
        },
        body: 'grant_type=client_credentials',
        });
    
        if (!response.ok) {
        throw new Error('Failed to fetch PayPal access token');
        }
    
        const data = await response.json();
        return data.access_token;
    }

