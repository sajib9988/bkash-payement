import { Router, Request, Response, NextFunction } from 'express';
import { productZodSchema } from './product.validation';
import { productController } from './product.controller';
import { fileUploader } from '../../helper/fileUploader';

const router = Router();

router.get('/', productController.getAllProducts)


router.post(
  '/create',
  fileUploader.uploadArray('images', 10),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = productZodSchema.parse(JSON.parse(req.body.data));
    return productController.addItem(req, res, next);
  } 
);

router.get('/:id', productController.getSingleProduct);

export const ProductRoutes = router;
