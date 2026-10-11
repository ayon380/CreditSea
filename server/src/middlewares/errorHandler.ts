import { Request, Response, NextFunction } from 'express';
import multer from 'multer';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('[API Error]:', err);

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({
        success: false,
        message: 'File size limit exceeded. Salary slip must be 5 MB or smaller.',
      });
      return;
    }
    res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`,
    });
    return;
  }

  if (err.name === 'ValidationError') {
    res.status(400).json({
      success: false,
      message: err.message,
    });
    return;
  }

  if (err.code === 11000) {
    const duplicateKey = Object.keys(err.keyValue || {})[0];
    res.status(409).json({
      success: false,
      message: `A record with this ${duplicateKey || 'value'} already exists.`,
    });
    return;
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error occurred.',
  });
};
