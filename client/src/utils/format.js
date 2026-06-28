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

// Short cadence label for display: "fortnight", "month", "year", etc.
export const FREQ_LABEL = {
  weekly:         "week",
  fortnightly:    "fortnight",
  every_4_weeks:  "4 weeks",
  monthly:        "month",
  every_2_months: "2 months",
  quarterly:      "quarter",
  every_4_months: "4 months",
  twice_yearly:   "6 months",
  yearly:         "year",
};

// Parse "YYYY-MM-DD" as a local date (avoids UTC midnight shift)
export const formatDate = (dateStr) => {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};