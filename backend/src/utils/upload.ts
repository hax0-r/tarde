import { Request } from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { cloudinary } from "../config/cloudinary";

// Define allowed file types
const allowedFileTypes = ["image/jpeg", "image/png", "image/jpg"];

// Maximum file size in bytes (5MB)
const maxFileSize = 5 * 1024 * 1024;

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "wealthy-way-trade",
    allowed_formats: ["jpg", "jpeg", "png"],
    transformation: [{ width: 500, height: 500, crop: "limit" }],
  } as any,
});

// File filter to check file types
const fileFilter = (req: Request, file: any, cb: any) => {
  if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only .png, .jpg and .jpeg formats are allowed"), false);
  }
};

// Configure multer for profile image uploads
export const profileImageUpload = multer({
  storage: storage,
  limits: {
    fileSize: maxFileSize,
  },
  fileFilter: fileFilter,
});

// Configure multer for other types of uploads (can be expanded later)
export const generalUpload = multer({
  storage: storage,
  limits: {
    fileSize: maxFileSize,
  },
  fileFilter: fileFilter,
});
