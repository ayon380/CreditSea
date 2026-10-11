import mongoose, { Document, Schema, Model, Types } from 'mongoose';
import { LoanStatus, EmploymentMode } from '../types';

export interface ILoan extends Document {
  loanId: string;
  borrowerId: Types.ObjectId;
  applicantSnapshot: {
    fullName: string;
    pan: string;
    dob: Date;
    ageAtApplication: number;
    monthlySalary: number;
    employmentMode: EmploymentMode;
  };
  breResult: {
    status: 'PASSED' | 'REJECTED';
    failureReasons: string[];
    evaluatedAt: Date;
  };
  salarySlip: {
    publicId: string;
    secureUrl: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    uploadedAt: Date;
  };
  financials: {
    principalAmount: number;
    tenureDays: number;
    annualInterestRate: number;
    interestAmount: number;
    totalRepaymentAmount: number;
    totalAmountPaid: number;
    outstandingBalance: number;
  };
  status: LoanStatus;
  sanctionDetails?: {
    reviewedBy: Types.ObjectId;
    reviewedAt: Date;
    decision: 'APPROVED' | 'REJECTED';
    rejectionReason?: string;
    remarks?: string;
  };
  disbursementDetails?: {
    disbursedBy: Types.ObjectId;
    disbursedAt: Date;
    referenceNumber: string;
    paymentMode: string;
    disbursedAmount: number;
  };
  closedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const loanSchema = new Schema<ILoan>(
  {
    loanId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    borrowerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    applicantSnapshot: {
      fullName: { type: String, required: true },
      pan: { type: String, required: true },
      dob: { type: Date, required: true },
      ageAtApplication: { type: Number, required: true },
      monthlySalary: { type: Number, required: true },
      employmentMode: { type: String, required: true },
    },
    breResult: {
      status: { type: String, enum: ['PASSED', 'REJECTED'], required: true },
      failureReasons: [{ type: String }],
      evaluatedAt: { type: Date, default: Date.now },
    },
    salarySlip: {
      publicId: { type: String, required: true },
      secureUrl: { type: String, required: true },
      fileName: { type: String, required: true },
      fileSize: { type: Number, required: true },
      mimeType: { type: String, required: true },
      uploadedAt: { type: Date, default: Date.now },
    },
    financials: {
      principalAmount: { type: Number, required: true, min: 50000, max: 500000 },
      tenureDays: { type: Number, required: true, min: 30, max: 365 },
      annualInterestRate: { type: Number, required: true, default: 12.0 },
      interestAmount: { type: Number, required: true },
      totalRepaymentAmount: { type: Number, required: true },
      totalAmountPaid: { type: Number, default: 0, min: 0 },
      outstandingBalance: { type: Number, required: true },
    },
    status: {
      type: String,
      enum: ['APPLIED', 'SANCTIONED', 'REJECTED', 'DISBURSED', 'CLOSED'],
      default: 'APPLIED',
      index: true,
    },
    sanctionDetails: {
      reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      reviewedAt: { type: Date },
      decision: { type: String, enum: ['APPROVED', 'REJECTED'] },
      rejectionReason: { type: String },
      remarks: { type: String },
    },
    disbursementDetails: {
      disbursedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      disbursedAt: { type: Date },
      referenceNumber: { type: String },
      paymentMode: { type: String, default: 'NEFT/RTGS' },
      disbursedAmount: { type: Number },
    },
    closedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const Loan: Model<ILoan> = mongoose.model<ILoan>('Loan', loanSchema);
