import express from 'express';
import { userRoutes } from '../modules/user/user.route';
import { AuthRoutes } from '../modules/auth/auth.route';
import { mediaRoutes } from '../modules/Media/media.route';
import { PaymentRoutes } from '../modules/payment/payment.route';
import { watchRoutes } from '../modules/watch/watch.route';
import { reviewRoutes } from '../modules/review/review.route';
import { ratingRoutes } from '../modules/rating/rating.route';





const router = express.Router();

const moduleRoutes = [
    {
        path: '/user',
        route: userRoutes
    },
    {
        path: '/auth',
        route: AuthRoutes
    },
    {
        path: '/media',
        route: mediaRoutes
    },
    {
        path: '/payment',
        route: PaymentRoutes
    },
  
    {
        path: '/watch',
        route: watchRoutes
    },
    {
        path: '/review',
        route: reviewRoutes
    },
  
    {
        path: '/rating',
        route: ratingRoutes
    },
  

    
];

moduleRoutes.forEach(route => router.use(route.path, route.route))
export default router;