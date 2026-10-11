import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { evaluateBRE } from '../services/breService';
import { User } from '../models/User';

export const evaluateBREEndpoint = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { fullName, pan, dob, monthlySalary, employmentMode, phone } = req.body;

    if (!dob || monthlySalary === undefined || !pan || !employmentMode) {
      res.status(400).json({
        success: false,
        message: 'All fields (fullName, pan, dob, monthlySalary, employmentMode) are required for eligibility check.',
      });
      return;
    }

    const breResult = evaluateBRE({
      dob,
      monthlySalary: Number(monthlySalary),
      pan,
      employmentMode,
    });

    // If authenticated borrower, update their profile with details and step
    if (req.user && req.user.userId) {
      const updateData: any = {
        name: fullName || req.user.name,
        pan: pan.toUpperCase().trim(),
        dob: new Date(dob),
        monthlySalary: Number(monthlySalary),
        employmentMode,
        applicationStep: breResult.passed ? 2 : 1,
      };
      if (phone && phone.trim()) {
        updateData.phone = phone.trim();
      }
      await User.findByIdAndUpdate(req.user.userId, updateData);
    }

    if (!breResult.passed) {
      res.status(422).json({
        success: false,
        message: "Unfortunately, we couldn't offer you a loan at this time based on our automated credit underwriting criteria.",
        breResult,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'BRE eligibility evaluation successful. Applicant meets all lending criteria.',
      breResult,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error occurred while evaluating BRE rules.',
    });
  }
};
