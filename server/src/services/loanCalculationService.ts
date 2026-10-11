export interface LoanCalculationResult {
  principalAmount: number;
  tenureDays: number;
  annualInterestRate: number;
  interestAmount: number;
  totalRepaymentAmount: number;
}

export const roundToTwoDecimals = (num: number): number => {
  return Math.round((num + Number.EPSILON) * 100) / 100;
};

export const calculateLoanMath = (
  principal: number,
  tenureDays: number,
  annualInterestRate: number = 12.0
): LoanCalculationResult => {
  if (principal < 50000 || principal > 500000) {
    throw new Error('Principal amount must be between ₹50,000 and ₹5,00,000');
  }

  if (tenureDays < 30 || tenureDays > 365) {
    throw new Error('Tenure must be between 30 and 365 days');
  }

  // SI = (P * R * T) / (365 * 100)
  const interestRaw = (principal * annualInterestRate * tenureDays) / (365 * 100);
  const interestAmount = roundToTwoDecimals(interestRaw);
  const totalRepaymentAmount = roundToTwoDecimals(principal + interestAmount);

  return {
    principalAmount: principal,
    tenureDays,
    annualInterestRate,
    interestAmount,
    totalRepaymentAmount,
  };
};
