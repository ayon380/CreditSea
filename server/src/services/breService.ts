import { BREResult, EmploymentMode } from '../types';

export interface BREInput {
  dob: string | Date;
  monthlySalary: number;
  pan: string;
  employmentMode: EmploymentMode;
}

export const calculateAge = (dobInput: string | Date): number => {
  let birthDate: Date;
  if (typeof dobInput === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dobInput)) {
    const parts = dobInput.substring(0, 10).split('-').map(Number);
    birthDate = new Date(parts[0], parts[1] - 1, parts[2]);
  } else {
    birthDate = new Date(dobInput);
  }
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
};

export const isValidPAN = (pan: string): boolean => {
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return panRegex.test(pan.trim().toUpperCase());
};

export const evaluateBRE = (input: BREInput): BREResult => {
  const failureReasons: string[] = [];
  const age = calculateAge(input.dob);

  // Rule 1: Age must be between 23 and 50 inclusive
  if (isNaN(age) || age < 23 || age > 50) {
    failureReasons.push(`Applicant age must be between 23 and 50 years. Evaluated age: ${isNaN(age) ? 'Invalid DOB' : age} years.`);
  }

  // Rule 2: Monthly Salary below ₹25,000
  if (typeof input.monthlySalary !== 'number' || input.monthlySalary < 25000) {
    const formatted = typeof input.monthlySalary === 'number' ? `₹${input.monthlySalary.toLocaleString('en-IN')}` : 'Invalid';
    failureReasons.push(`Monthly salary must be at least ₹25,000. Provided: ${formatted}.`);
  }

  // Rule 3: Valid PAN format
  if (!input.pan || !isValidPAN(input.pan)) {
    failureReasons.push(`Invalid PAN format '${input.pan || ''}'. PAN must be 10 characters (e.g., ABCDE1234F).`);
  }

  // Rule 4: Employment Mode check
  if (input.employmentMode === 'UNEMPLOYED') {
    failureReasons.push('Applicants with employment status "Unemployed" are not eligible for this loan.');
  }

  return {
    passed: failureReasons.length === 0,
    failureReasons,
    evaluatedAge: age,
  };
};
