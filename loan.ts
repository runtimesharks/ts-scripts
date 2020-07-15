type T = {
  /**
   * The number of years.
   */
  period: number,
  /**
   * The sum to be loaned.
   */
  loan: number,
  /**
   * One-time additional costs.
   */
  additionalCosts: number,
  /**
   * The yearly interest rate.
   */
  annualInterestRate: number,
  /**
   * Any sum you wish to pay extra each month.
   */
  additionalMonthlyPayment: number,
  /**
   * Any extra payments you wish to pay.
   */
  extraPayments: {
    /**
     * The sum you want to pay extra each month.
     */
    value: number
    /**
     * The maximum number of months in which you want to pay extra, e.g `2` = a maximum of 2 extra payments, in total.
     * Pass `0` for no limit, meaning every month for the whole period.
     */
    limit: number
    /**
     * The frequency of the extra payments, e.g `2` = one extra payment every other month.
     */
    frequency: number
  },
}

/*
 * type - when the payments are due:
 *        0: end of the period, e.g. end of month (default)
 *        1: beginning of period
 */
const PMT = ({
  monthlyInterestRate: interestRate,
  period,
  loan,
  residualValue = 0,
  type = 0,
}) => {
  if (interestRate === 0) {
    return (loan + residualValue) / period
  }

  const loanIf = Math.pow(1 + interestRate, period)
  let pmt = (interestRate * loan * (loanIf + residualValue)) / (loanIf - 1)

  if (type === 1) {
    pmt /= 1 + interestRate
  }

  return pmt
}

const computeLoan = ({
  period,
  loan,
  additionalCosts,
  annualInterestRate,
  additionalMonthlyPayment,
  extraPayments,
}: T) => {
  const monthlyInterestRate = (annualInterestRate * 0.01) / 12
  const baseMonthlyPayment = PMT({
    monthlyInterestRate,
    period,
    loan,
  })
  const actualMonthlyPayment = baseMonthlyPayment + additionalMonthlyPayment

  let remainingLoan = loan
  let total = loan + additionalCosts
  let totalInterest = 0
  let numberOfPaidExtraPayments = 0
  let valueOfPaidExtraPayments = 0
  let durationOfRepay = 0

  while (durationOfRepay < period && remainingLoan > 0) {
    const monthlyInterest = remainingLoan * monthlyInterestRate
    let principal = actualMonthlyPayment - monthlyInterest
    // Do an extra payment if:
    // - the value is greater than 0
    const hasExtraPayments = extraPayments.value > 0
    // - the limit is 0; or
    // - we haven't reached the limit.
    const hasExtraPaymentsRemaining =
      extraPayments.limit < 1 || numberOfPaidExtraPayments < extraPayments.limit
    // - the current month divides exactly with the frequency; this includes a frequency of 1.
    const isExtraPaymentMonth = durationOfRepay % extraPayments.frequency == 0

    if (hasExtraPayments && hasExtraPaymentsRemaining && isExtraPaymentMonth) {
      numberOfPaidExtraPayments += 1
      valueOfPaidExtraPayments += extraPayments.value
      principal += extraPayments.value
    }

    remainingLoan -= principal
    totalInterest += monthlyInterest

    durationOfRepay += 1
  }

  total += totalInterest

  // If there are no extra payments, ignore any value passed in.
  const actualMonthlyPaymentWithExtra =
    extraPayments.value > 0
      ? actualMonthlyPayment + extraPayments.value
      : actualMonthlyPayment
  const percentageOfOverpay = (totalInterest / Math.max(0.01, loan)) * 100
  const repayDurationDifference = period - durationOfRepay

  return {
    baseMonthlyPayment,
    actualMonthlyPayment,
    actualMonthlyPaymentWithExtra,
    total,
    totalInterest,
    percentageOfOverpay,
    durationOfRepay,
    numberOfPaidExtraPayments,
    valueOfPaidExtraPayments,
    repayDurationDifference,
  }
}

const v = computeLoan({
  loan: 550_000,
  additionalCosts: 500,
  additionalMonthlyPayment: 0,
  annualInterestRate: 5.36,
  period: 76,
  extraPayments: {
    limit: 0,
    frequency: 1,
    value: 4_000,
  },
})

console.log(v)

export default computeLoan
