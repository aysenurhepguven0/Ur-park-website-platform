import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { uploadSingle, uploadMultiple } from '../middleware/upload';
import {
  uploadSingleImage,
  uploadMultipleImages,
  deleteImage
} from '../controllers/upload.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Upload single image
router.post('/single', uploadSingle, uploadSingleImage);

// Upload multiple images
router.post('/multiple', uploadMultiple, uploadMultipleImages);

// Delete image
router.delete('/delete', deleteImage);

export default router;
