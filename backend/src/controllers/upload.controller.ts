import { Request, Response, NextFunction } from 'express';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { cloudinaryService } from '../services/cloudinary.service';

/**
 * Upload single image
 */
export const uploadSingleImage = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.file) {
      throw new AppError('No image file provided', 400);
    }

    const result = await cloudinaryService.uploadImage(req.file.buffer);

    res.json({
      status: 'success',
      data: {
        url: result.url,
        publicId: result.publicId
      }
    });
  }
);

/**
 * Upload multiple images
 */
export const uploadMultipleImages = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      throw new AppError('No image files provided', 400);
    }

    const buffers = files.map(file => file.buffer);
    const results = await cloudinaryService.uploadMultipleImages(buffers);

    res.json({
      status: 'success',
      data: {
        images: results.map(result => ({
          url: result.url,
          publicId: result.publicId
        }))
      }
    });
  }
);

/**
 * Delete image
 */
export const deleteImage = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { publicId } = req.body;

    if (!publicId) {
      throw new AppError('Public ID is required', 400);
    }

    await cloudinaryService.deleteImage(publicId);

    res.json({
      status: 'success',
      message: 'Image deleted successfully'
    });
  }
);
