import { Request } from 'express';
import { Types } from 'mongoose';

export type UserRole = 'BORROWER' | 'SALES' | 'SANCTION' | 'DISBURSEMENT' | 'COLLECTION' | 'ADMIN';

export type EmploymentMode = 'SALARIED' | 'SELF_EMPLOYED' | 'UNEMPLOYED';

export type LoanStatus = 'DRAFT' | 'APPLIED' | 'SANCTIONED' | 'REJECTED' | 'DISBURSED' | 'CLOSED';

export interface IUserPayload {
  userId: string;
  email: string;
  role: UserRole;
  name: string;
}

export interface AuthenticatedRequest extends Request {
  user?: IUserPayload;
  file?: Express.Multer.File;
}

export interface BREResult {
  passed: boolean;
  failureReasons: string[];
  evaluatedAge?: number;
}
