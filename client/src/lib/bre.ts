import { EmploymentMode, IBREResult } from '../types';

export const calculateAgeFromDob = (dobString: string): number => {
  if (!dobString) return NaN;
  let birth: Date;
  if (/^\d{4}-\d{2}-\d{2}/.test(dobString)) {
    const parts = dobString.substring(0, 10).split('-').map(Number);
    birth = new Date(parts[0], parts[1] - 1, parts[2]);
  } else {
    birth = new Date(dobString);
  }
  if (isNaN(birth.getTime())) return NaN;

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

export const validatePAN = (pan: string): boolean => {
  if (!pan) return false;
  return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan.trim().toUpperCase());
};

export const evaluateClientBRE = (
  dob: string,
  salary: number | string,
  pan: string,
  employmentMode: EmploymentMode
): IBREResult => {
  const failureReasons: string[] = [];
  const age = calculateAgeFromDob(dob);
  const numSalary = Number(salary);

  // Age rule: 23 <= age <= 50
  if (isNaN(age) || age < 23 || age > 50) {
    failureReasons.push(`Age must be between 23 and 50 years. Current: ${isNaN(age) ? 'Invalid Date' : `${age} years`}.`);
  }

  // Salary rule: >= 25,000
  if (isNaN(numSalary) || numSalary < 25000) {
    failureReasons.push(`Monthly salary must be at least ₹25,000. Provided: ₹${isNaN(numSalary) ? 0 : numSalary.toLocaleString('en-IN')}.`);
  }

  // PAN rule: Indian standard format
  if (!validatePAN(pan)) {
    failureReasons.push(`Invalid PAN format '${pan}'. Must be 10 characters (e.g. ABCDE1234F).`);
  }

  // Employment rule: Not unemployed
  if (employmentMode === 'UNEMPLOYED') {
    failureReasons.push('Applicants who are currently Unemployed do not qualify for this loan.');
  }

  return {
    passed: failureReasons.length === 0,
    failureReasons,
    evaluatedAge: age,
  };
};
