import { Router, Request, Response, NextFunction } from 'express';
import { productZodSchema } from './product.validation';
import { productController } from './product.controller';
import { fileUploader } from '../../helper/fileUploader';
import auth from '../../middleware/auth';

const router = Router();

router.get('/', productController.getAllProducts)


router.post(
  '/create',
    auth ('admin'),
  fileUploader.uploadArray('images', 10),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = productZodSchema.parse(JSON.parse(req.body.data));
    return productController.addItem(req, res, next);
  } 
);

router.get('/:id', productController.getSingleProduct);

export const ProductRoutes = router;
