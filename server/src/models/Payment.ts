import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export interface IPayment extends Document {
  loanId: Types.ObjectId;
  borrowerId: Types.ObjectId;
  recordedBy: Types.ObjectId;
  utrNumber: string;
  amount: number;
  paymentDate: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    loanId: {
      type: Schema.Types.ObjectId,
      ref: 'Loan',
      required: true,
      index: true,
    },
    borrowerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    recordedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    utrNumber: {
      type: String,
      required: [true, 'UTR Number is mandatory'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [1, 'Payment amount must be greater than zero'],
    },
    paymentDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Payment: Model<IPayment> = mongoose.model<IPayment>('Payment', paymentSchema);
