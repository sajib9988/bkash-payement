// import { config } from './../../config/index';
// import axios from 'axios';


// let tokenCache = '';
// // it is 
// export async function getBkashToken() {
//   const url = `${config.bkashConfig.baseURL}/checkout/token/grant`;

//   const response = await axios.post(url, {
//     app_key: config.bkashConfig.appKey,
//     app_secret: config.bkashConfig.appSecret,
//   }, {
//     headers: {
//       username: config.bkashConfig.username,
//       password: config.bkashConfig.password,
//       'Content-Type': 'application/json',
//     },
//   });

//   tokenCache = response.data.id_token;
//   return tokenCache;
// }

// export async function createBkashPaymentRequest(amount: string, invoice: string) {
//   const token = await getBkashToken();
//   const response = await axios.post(`${config.bkashConfig.baseURL}/checkout/payment/create`, {
//     amount,
//     currency: 'BDT',
//     intent: 'sale',
//     merchantInvoiceNumber: invoice,
//     callbackURL: config.bkashConfig.callbackURL,
//   }, {
//     headers: {
//       authorization: token,
//       'X-APP-Key': config.bkashConfig.appKey,
//     },
//   });

//   return response.data;
// }
