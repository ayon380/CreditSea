export interface LiveCalculation {
  principalAmount: number;
  tenureDays: number;
  annualInterestRate: number;
  interestAmount: number;
  totalRepaymentAmount: number;
  dailyInterest: number;
}

export const calculateSimpleInterest = (
  principal: number,
  tenureDays: number,
  ratePercent: number = 12.0
): LiveCalculation => {
  // Simple Interest: SI = (P * R * T) / (365 * 100)
  const interestRaw = (principal * ratePercent * tenureDays) / (365 * 100);
  const interestAmount = Math.round((interestRaw + Number.EPSILON) * 100) / 100;
  const totalRepaymentAmount = Math.round((principal + interestAmount + Number.EPSILON) * 100) / 100;
  const dailyInterest = tenureDays > 0 ? Math.round((interestAmount / tenureDays) * 100) / 100 : 0;

  return {
    principalAmount: principal,
    tenureDays,
    annualInterestRate: ratePercent,
    interestAmount,
    totalRepaymentAmount,
    dailyInterest,
  };
};
