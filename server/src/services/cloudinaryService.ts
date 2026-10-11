import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

// Configure Cloudinary if credentials are present
const isCloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log('Cloudinary SDK configured successfully.');
} else {
  console.log('Cloudinary credentials not detected; using secure local disk fallback.');
}

export interface UploadResult {
  publicId: string;
  secureUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

export const uploadSalarySlip = async (
  file: Express.Multer.File,
  clientHostUrl: string
): Promise<UploadResult> => {
  // If Cloudinary credentials are set up, upload directly to Cloudinary
  if (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  ) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'creditsea/salary_slips',
          resource_type: 'auto',
        },
        (error, result) => {
          if (error || !result) {
            return reject(error || new Error('Cloudinary upload returned empty result'));
          }
          resolve({
            publicId: result.public_id,
            secureUrl: result.secure_url,
            fileName: file.originalname,
            fileSize: file.size,
            mimeType: file.mimetype,
          });
        }
      );

      uploadStream.end(file.buffer);
    });
  }

  // Fallback: Local storage in /uploads directory
  const uploadsDir = path.join(__dirname, '../../uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  const ext = path.extname(file.originalname);
  const safeFilename = `salary-slip-${uniqueSuffix}${ext}`;
  const filePath = path.join(uploadsDir, safeFilename);

  fs.writeFileSync(filePath, file.buffer);

  const localUrl = `${clientHostUrl}/uploads/${safeFilename}`;

  return {
    publicId: `local_${safeFilename}`,
    secureUrl: localUrl,
    fileName: file.originalname,
    fileSize: file.size,
    mimeType: file.mimetype,
  };
};
