import multer from 'multer';
import { Request } from 'express';

// Configure multer to use memory storage
const storage = multer.memoryStorage();

// File filter to accept only images
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accept images only
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

// Configure upload with size limit (5MB per file)
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// Multer middleware for single image upload
export const uploadSingle = upload.single('image');

// Multer middleware for multiple image uploads (max 10 images)
export const uploadMultiple = upload.array('images', 10);
