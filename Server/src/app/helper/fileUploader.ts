import multer from "multer";
import path from "path";
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import { ICloudinaryResponse, IFile } from "../type/cloudinaryType";
 // তোমার ইন্টারফেস ফোল্ডার অনুসারে adjust করো

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(process.cwd(), 'uploads'));
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({ 
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 1
    }
},











);

console.log('Multer storage initialized:', storage);

// Cloudinary uploader
const uploadToCloudinary = async (file: IFile): Promise<ICloudinaryResponse | undefined> => {
    console.log('Uploading file to Cloudinary:', file); // ফাইলের ডাটা চেক করুন
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload(file.path, (error: Error, result: ICloudinaryResponse) => {
            fs.unlinkSync(file.path);
            if (error) {
                reject(error);
            } else {
                console.log('Cloudinary Upload Result:', result); // Cloudinary থেকে পাওয়া রেসপন্স চেক করুন
                resolve(result);
            }
        });
    });
};





console.log('Cloudinary uploader initialized:', uploadToCloudinary);
export const fileUploader = {
    upload,
    uploadToCloudinary
};
