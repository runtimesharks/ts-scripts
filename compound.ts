type T = {
  /**
   * The value to invest per month.
   */
  value: number
  /**
   * The interest per year.
   */
  interest: number
  /**
   * The number of years.
   */
  years: number
  /**
   * Calculate the interest each month, or once per year.
   */
	monthly: boolean
}

const compound = ({ value, interest, years, monthly }: T) => {
	let total = 0
	let invested = 0

	Array(years * (monthly ? 12 : 1))
		.fill(0)
		.forEach(() => {
			const v = value * (monthly ? 1 : 12)

			total += v
			total *= 1 + interest / (monthly ? 12 : 1)

			invested += v
		})

	return {
		total,
		invested,
	}
}

const monthly = compound({
	value: 500,
	interest: 0.073,
	years: 30,
	monthly: false,
})

console.log(monthly)

const yearly = compound({
	value: 500,
	interest: 0.073,
	years: 30,
	monthly: true,
})

console.log(yearly)

export default compound
