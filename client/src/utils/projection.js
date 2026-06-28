export const WINDOW_DAYS = 30;

// Advance a date by N calendar months, capping the day to avoid overflow.
// Jan 31 + 1 month → Feb 28 (not Mar 3).
function advanceByMonths(date, months) {
  const y = date.getFullYear();
  const m = date.getMonth() + months;     // JS rolls year automatically
  const d = date.getDate();
  const lastDay = new Date(y, m + 1, 0).getDate(); // day-0 of next month = last day of m
  return new Date(y, m, Math.min(d, lastDay));
}

function advanceByFrequency(date, frequency) {
  const FIXED_DAYS  = { weekly: 7, fortnightly: 14, every_4_weeks: 28 };
  const MONTH_STEPS = {
    monthly: 1, every_2_months: 2, quarterly: 3,
    every_4_months: 4, twice_yearly: 6, yearly: 12,
  };
  if (FIXED_DAYS[frequency]  !== undefined)
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + FIXED_DAYS[frequency]);
  if (MONTH_STEPS[frequency] !== undefined)
    return advanceByMonths(date, MONTH_STEPS[frequency]);
  return date;
}

function toDateStr(d) {
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-');
}

// Generate all occurrences of active recurring items within a forward window.
// Returns occurrences sorted ascending by date; income sorts before expense on ties.
export function projectOccurrences(items, windowDays = WINDOW_DAYS) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const windowEnd = new Date(
    today.getFullYear(), today.getMonth(), today.getDate() + windowDays
  );

  const occurrences = [];

  for (const item of items) {
    if (!item.is_active) continue;

    const [y, m, d] = item.next_due_date.split('-').map(Number);
    let current = new Date(y, m - 1, d);

    // Advance past any occurrences that have already passed
    while (current < today) {
      current = advanceByFrequency(current, item.frequency);
    }

    // Emit every occurrence that falls within the window
    while (current <= windowEnd) {
      occurrences.push({
        date: toDateStr(current),
        name: item.name,
        type: item.type,
        signedAmount: item.type === 'income' ? Number(item.amount) : -Number(item.amount),
        categoryName: item.category_name,
        categoryType: item.category_type,
        recurringId: item.id,
      });
      current = advanceByFrequency(current, item.frequency);
    }
  }

  // Sort by date ascending; income before expense on the same day
  occurrences.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    if (a.type === 'income' && b.type !== 'income') return -1;
    if (a.type !== 'income' && b.type === 'income') return  1;
    return 0;
  });

  return occurrences;
}
