import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

// Configure Cloudinary (optional for demo)
const isCloudinaryConfigured = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  console.log('Cloudinary image upload service initialized');
} else {
  console.warn('Cloudinary credentials not found. Using mock image URLs for demo.');
}

interface UploadResult {
  url: string;
  publicId: string;
}

class CloudinaryService {
  /**
   * Upload image buffer to Cloudinary (or return mock URL in demo mode)
   */
  async uploadImage(buffer: Buffer, folder: string = 'parking-spaces'): Promise<UploadResult> {
    // Demo mode: return mock image URL
    if (!isCloudinaryConfigured) {
      const mockId = `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      return {
        url: `https://via.placeholder.com/1200x800.png?text=Parking+Space+Image`,
        publicId: mockId
      };
    }
    
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          transformation: [
            { width: 1200, height: 800, crop: 'limit' },
            { quality: 'auto' },
            { fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) {
            reject(new Error('Failed to upload image'));
          } else if (result) {
            resolve({
              url: result.secure_url,
              publicId: result.public_id
            });
          } else {
            reject(new Error('Upload failed without error'));
          }
        }
      );

      const readable = Readable.from(buffer);
      readable.pipe(uploadStream);
    });
  }

  /**
   * Upload multiple images
   */
  async uploadMultipleImages(
    buffers: Buffer[],
    folder: string = 'parking-spaces'
  ): Promise<UploadResult[]> {
    const uploadPromises = buffers.map(buffer => this.uploadImage(buffer, folder));
    return Promise.all(uploadPromises);
  }

  /**
   * Delete image from Cloudinary (no-op in demo mode)
   */
  async deleteImage(publicId: string): Promise<void> {
    if (!isCloudinaryConfigured) {
      // Demo mode: just return success
      return;
    }
    
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      throw new Error('Failed to delete image');
    }
  }

  /**
   * Delete multiple images
   */
  async deleteMultipleImages(publicIds: string[]): Promise<void> {
    const deletePromises = publicIds.map(publicId => this.deleteImage(publicId));
    await Promise.all(deletePromises);
  }

  /**
   * Extract public ID from Cloudinary URL
   */
  extractPublicId(url: string): string | null {
    try {
      const matches = url.match(/\/v\d+\/(.+)\.\w+$/);
      return matches ? matches[1] : null;
    } catch (error) {
      return null;
    }
  }
}

export const cloudinaryService = new CloudinaryService();
