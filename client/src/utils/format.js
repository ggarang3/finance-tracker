// Format a number as currency: 1500 → $1,500.00
export const formatCurrency = (value) => {
  const number = Number(value);
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 2,
  }).format(number);
};