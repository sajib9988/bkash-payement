import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export const config = {
  env: process.env.NODE_ENV,
  port: process.env.PORT || 3000,
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    refresh_token_secret: process.env.REFRESH_TOKEN_SECRET,
    refresh_token_expires_in: process.env.REFRESH_TOKEN_EXPIRES_IN,
  },
  cloudinary: {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  },
  bkashConfig: {
    baseURL: process.env.BKASH_BASE_URL!,
    appKey: process.env.BKASH_APP_KEY!,
    appSecret: process.env.BKASH_APP_SECRET!,
    username: process.env.BKASH_USERNAME!,
    password: process.env.BKASH_PASSWORD!,
    grantTokenURL: process.env.BKASH_GRANT_TOKEN_URL!,
    createPaymentURL: process.env.BKASH_CREATE_PAYMENT_URL!,
    executePaymentURL: process.env.BKASH_EXECUTE_PAYMENT_URL!,
    refundURL: process.env.BKASH_REFUND_TRANSACTION_URL!,
    callbackURL: process.env.BKASH_CALLBACK_URL!,
  },
};

export default config;
