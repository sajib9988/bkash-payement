import express from 'express';
import authController from './auth.controller';



const router = express.Router();

router.post(
    '/login',
    authController.logInUser
);

router.post(
    '/refresh-token',
    authController.refreshToken
)



export const AuthRoutes = router;