import mongoose, { Document, Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserRole, EmploymentMode } from '../types';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  phone?: string;
  pan?: string;
  dob?: Date;
  monthlySalary?: number;
  employmentMode?: EmploymentMode;
  applicationStep?: number; // 1: registered, 2: personal/bre done, 3: doc uploaded, 4: applied
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
    },
    role: {
      type: String,
      enum: ['BORROWER', 'SALES', 'SANCTION', 'DISBURSEMENT', 'COLLECTION', 'ADMIN'],
      default: 'BORROWER',
      index: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    pan: {
      type: String,
      uppercase: true,
      trim: true,
    },
    dob: {
      type: Date,
    },
    monthlySalary: {
      type: Number,
      min: 0,
    },
    employmentMode: {
      type: String,
      enum: ['SALARIED', 'SELF_EMPLOYED', 'UNEMPLOYED'],
    },
    applicationStep: {
      type: Number,
      default: 1, // 1: Registered, 2: Personal Details, 3: Slip Uploaded, 4: Loan Applied
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

export const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);
