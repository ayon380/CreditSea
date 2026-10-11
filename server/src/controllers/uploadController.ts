import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { uploadSalarySlip } from '../services/cloudinaryService';
import { User } from '../models/User';

export const uploadSalarySlipController = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'No file uploaded. Please attach a PDF, JPG, or PNG salary slip (max 5 MB).',
      });
      return;
    }

    const hostUrl = `${req.protocol}://${req.get('host')}`;
    const result = await uploadSalarySlip(req.file, hostUrl);

    if (req.user && req.user.userId) {
      await User.findByIdAndUpdate(req.user.userId, {
        applicationStep: 3,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Salary slip uploaded successfully.',
      file: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload salary slip.',
    });
  }
};
