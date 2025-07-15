
import jwt, { SignOptions } from 'jsonwebtoken';
import { IJwtPayload } from '../modules/auth/auth.interface';




export const createToken = (
  jwtPayload: IJwtPayload,
  secret: string,
  expiresIn: string | number,
) => {
  return jwt.sign(jwtPayload, secret, { expiresIn } as SignOptions);
};

const verifyToken = (token: string, secret: string) => {

    return jwt.verify(token, secret) as IJwtPayload;
}



export const jwtHelpers = {
  createToken,
  verifyToken,
};
































// import jwt, { JwtPayload, Secret, SignOptions } from 'jsonwebtoken';


// type JwtExpiresIn = string | number;

// const generateToken = (payload: any, secret: Secret, expiresIn: JwtExpiresIn) => {
//     const options: SignOptions = { 
//         expiresIn: expiresIn as any // Use type assertion to bypass the strict type checking
//     };
    
//     const token = jwt.sign(
//         payload,
//         secret,
//         options
//     );

//     return token;
// };

// const verifyToken = (token: string, secret: Secret) => {
//     return jwt.verify(token, secret) as JwtPayload;
// }

// export const jwtHelpers = {
//     generateToken,
//     verifyToken
// }

// import jwt, { JwtPayload, Secret } from 'jsonwebtoken';

// const generateToken = (payload: any, secret: Secret, expiresIn: string) => {
//     const token = jwt.sign(
//         payload,
//         secret,
//         {
//             algorithm: 'HS256',
//             expiresIn
//         }
//     );

//     return token;
// };
