import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';

// Use memory storage so we can stream to Cloudinary or save to local disk buffer
const storage = multer.memoryStorage();

const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];

const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback): void => {
  if (allowedMimeTypes.includes(file.mimetype.toLowerCase())) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format. Only PDF, JPG, and PNG documents are accepted.'));
  }
};

export const uploadSalarySlipMiddleware = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 Megabytes
  },
  fileFilter,
});
