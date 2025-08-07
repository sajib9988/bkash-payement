
import { prisma } from '../../middleware/prisma';
import { fileUploader } from '../../helper/fileUploader';

interface IProductInput {
  title: string;
  description?: string;
  price: number | string;
  weight?: number; // Optional field for product weight
}
export const addProduct= async (data: IProductInput, files: Express.Multer.File[])=>{


    if(!files || files.length === 0){
        throw new Error ('at least one image upload plz..')
    }
   
     const uploadImage = await Promise.all(
          files.map(async (file)=>{
            const result = await fileUploader.uploadToCloudinary(file)
            return {
          url: result.secure_url,
          public_id: result.public_id,
        };
          })
     )

    // Prisma দিয়ে ডেটা insert
    const product = await prisma.product.create({
      data: {
        title: data.title,
        description: data.description,
        price: typeof data.price === 'string' ? parseFloat(data.price) : data.price,
        weight: data.weight,
        image: uploadImage, 
      },
    });

    return product;


}


export const getAllProductsFromDB = async () => {
  const products = await prisma.product.findMany();
  // console.log('ppdd', products)
  return products;
};

export const getSingleProductFromDB = async (id: string) => {
  const product = await prisma.product.findUnique({
    where: {
      id,
    },
  });
  return product;
};

export const productService ={
    addProduct,
    getAllProductsFromDB,
    getSingleProductFromDB
}