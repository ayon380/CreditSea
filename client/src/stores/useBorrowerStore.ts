import { create } from 'zustand';
import { EmploymentMode, IBREResult, ISalarySlip } from '../types';

export interface PersonalDetailsForm {
  fullName: string;
  pan: string;
  dob: string;
  monthlySalary: number;
  employmentMode: EmploymentMode;
  phone?: string;
}

export interface LoanConfigForm {
  principalAmount: number;
  tenureDays: number;
}

interface BorrowerState {
  currentStep: 1 | 2 | 3 | 4;
  phone: string;
  personalDetails: PersonalDetailsForm;
  breResult: IBREResult | null;
  salarySlip: ISalarySlip | null;
  loanConfig: LoanConfigForm;
  isSubmitting: boolean;

  setStep: (step: 1 | 2 | 3 | 4) => void;
  nextStep: () => void;
  prevStep: () => void;
  setPhone: (phone: string) => void;
  setPersonalDetails: (details: Partial<PersonalDetailsForm>) => void;
  setBREResult: (bre: IBREResult | null) => void;
  setSalarySlip: (slip: ISalarySlip | null) => void;
  setLoanConfig: (config: Partial<LoanConfigForm>) => void;
  setIsSubmitting: (loading: boolean) => void;
  resetForm: () => void;
}

export const getDefaultDob = (): string => {
  const today = new Date();
  const y = today.getFullYear() - 23;
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const initialPersonalDetails: PersonalDetailsForm = {
  fullName: '',
  pan: '',
  dob: getDefaultDob(),
  monthlySalary: 35000,
  employmentMode: 'SALARIED',
  phone: '',
};

const initialLoanConfig: LoanConfigForm = {
  principalAmount: 100000,
  tenureDays: 90,
};

export const useBorrowerStore = create<BorrowerState>((set) => ({
  currentStep: 1,
  phone: '',
  personalDetails: initialPersonalDetails,
  breResult: null,
  salarySlip: null,
  loanConfig: initialLoanConfig,
  isSubmitting: false,

  setStep: (step) => set({ currentStep: step }),
  nextStep: () =>
    set((state) => ({
      currentStep: Math.min(4, state.currentStep + 1) as 1 | 2 | 3 | 4,
    })),
  prevStep: () =>
    set((state) => ({
      currentStep: Math.max(1, state.currentStep - 1) as 1 | 2 | 3 | 4,
    })),

  setPhone: (phone) =>
    set((state) => ({
      phone,
      personalDetails: { ...state.personalDetails, phone },
    })),

  setPersonalDetails: (details) =>
    set((state) => ({
      personalDetails: { ...state.personalDetails, ...details },
    })),

  setBREResult: (bre) => set({ breResult: bre }),
  setSalarySlip: (slip) => set({ salarySlip: slip }),
  setLoanConfig: (config) =>
    set((state) => ({
      loanConfig: { ...state.loanConfig, ...config },
    })),
  setIsSubmitting: (isSubmitting) => set({ isSubmitting }),

  resetForm: () =>
    set({
      currentStep: 1,
      phone: '',
      personalDetails: initialPersonalDetails,
      breResult: null,
      salarySlip: null,
      loanConfig: initialLoanConfig,
      isSubmitting: false,
    }),
}));
