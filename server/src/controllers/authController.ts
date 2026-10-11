import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { AuthenticatedRequest, UserRole } from '../types';

const generateToken = (userId: string, email: string, role: UserRole, name: string): string => {
  const secret = process.env.JWT_SECRET || 'fallback_secret_creditsea_2026';
  const expiresIn = (process.env.JWT_EXPIRES_IN || '7d') as any;
  return jwt.sign({ userId, email, role, name }, secret, { expiresIn });
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role, phone } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        message: 'Name, email, and password are required fields.',
      });
      return;
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'An account with this email address already exists. Please sign in.',
      });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const assignedRole = role && ['BORROWER', 'SALES', 'SANCTION', 'DISBURSEMENT', 'COLLECTION', 'ADMIN'].includes(role)
      ? role
      : 'BORROWER';

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role: assignedRole,
      phone: phone?.trim(),
      applicationStep: 1,
    });

    const token = generateToken(user._id.toString(), user.email, user.role, user.name);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        applicationStep: user.applicationStep,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error occurred during registration.',
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid email address or password.',
      });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Invalid email address or password.',
      });
      return;
    }

    const token = generateToken(user._id.toString(), user.email, user.role, user.name);

    res.status(200).json({
      success: true,
      message: 'Sign-in successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        pan: user.pan,
        dob: user.dob,
        monthlySalary: user.monthlySalary,
        employmentMode: user.employmentMode,
        applicationStep: user.applicationStep,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error occurred during sign-in.',
    });
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const user = await User.findById(req.user.userId).select('-passwordHash');
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        pan: user.pan,
        dob: user.dob,
        monthlySalary: user.monthlySalary,
        employmentMode: user.employmentMode,
        applicationStep: user.applicationStep,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
