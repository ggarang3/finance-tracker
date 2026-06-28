// Format a number as currency: 1500 → $1,500.00
export const formatCurrency = (value) => {
  const number = Number(value);
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 2,
  }).format(number);
};

// Monthly-equivalent per CLAUDE.md: amount × (occurrences/year ÷ 12)
const FREQ_MULTIPLIER = {
  weekly:         52 / 12,
  fortnightly:    26 / 12,
  every_4_weeks:  13 / 12,
  monthly:        1,
  every_2_months:  6 / 12,
  quarterly:       4 / 12,
  every_4_months:  3 / 12,
  twice_yearly:    2 / 12,
  yearly:          1 / 12,
};

export const monthlyEquivalent = (amount, frequency) =>
  Number(amount) * (FREQ_MULTIPLIER[frequency] ?? 1);