const compound = ({ value, addition, interest, times }) => {
  let total = value
  let added = 0

  new Array(times).fill(0).forEach(() => {
    total += addition
    total *= 1 + interest

    added += addition
  })

  return {
    total,
    added,
  }
}

const v = compound({
  value: 1_000,
  addition: 500,
  interest: 0.015,
  times: 20 * 12,
})

v

export {}
