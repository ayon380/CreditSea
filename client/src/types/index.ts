export type UserRole = 'BORROWER' | 'SALES' | 'SANCTION' | 'DISBURSEMENT' | 'COLLECTION' | 'ADMIN';

export type EmploymentMode = 'SALARIED' | 'SELF_EMPLOYED' | 'UNEMPLOYED';

export type LoanStatus = 'DRAFT' | 'APPLIED' | 'SANCTIONED' | 'REJECTED' | 'DISBURSED' | 'CLOSED';

export interface IUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  pan?: string;
  dob?: string;
  monthlySalary?: number;
  employmentMode?: EmploymentMode;
  applicationStep?: number;
}

export interface IBREResult {
  passed: boolean;
  failureReasons: string[];
  evaluatedAge?: number;
}

export interface ISalarySlip {
  publicId: string;
  secureUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

export interface IFinancials {
  principalAmount: number;
  tenureDays: number;
  annualInterestRate: number;
  interestAmount: number;
  totalRepaymentAmount: number;
  totalAmountPaid: number;
  outstandingBalance: number;
}

export interface ILoan {
  _id: string;
  loanId: string;
  borrowerId: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  applicantSnapshot: {
    fullName: string;
    pan: string;
    dob: string;
    ageAtApplication: number;
    monthlySalary: number;
    employmentMode: EmploymentMode;
  };
  breResult: {
    status: 'PASSED' | 'REJECTED';
    failureReasons: string[];
    evaluatedAt: string;
  };
  salarySlip: ISalarySlip;
  financials: IFinancials;
  status: LoanStatus;
  sanctionDetails?: {
    reviewedBy?: string;
    reviewedAt?: string;
    decision: 'APPROVED' | 'REJECTED';
    rejectionReason?: string;
    remarks?: string;
  };
  disbursementDetails?: {
    disbursedBy?: string;
    disbursedAt?: string;
    referenceNumber: string;
    paymentMode: string;
    disbursedAmount: number;
  };
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IPayment {
  _id: string;
  loanId: string;
  borrowerId: string;
  recordedBy: {
    _id: string;
    name: string;
    email: string;
  };
  utrNumber: string;
  amount: number;
  paymentDate: string;
  notes?: string;
  createdAt: string;
}

export interface ISalesLead {
  id: string;
  name: string;
  email: string;
  phone: string;
  applicationStep: number;
  registeredAt: string;
  monthlySalary?: number;
  employmentMode?: string;
}

export interface IAuditLog {
  _id: string;
  loanId: string;
  actorId?: {
    _id: string;
    name: string;
    email: string;
    role: UserRole;
  };
  action: string;
  fromStatus?: string;
  toStatus?: string;
  metadata?: Record<string, any>;
  timestamp: string;
}
