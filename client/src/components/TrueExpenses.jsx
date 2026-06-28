import { formatCurrency, monthlyEquivalent, FREQ_LABEL, formatDate } from "../utils/format";

const TRUE_EXPENSE_FREQS = new Set(["quarterly", "every_4_months", "twice_yearly", "yearly"]);

const PERIOD_DAYS = {
  quarterly:      91.25,
  every_4_months: 121.75,
  twice_yearly:   182.5,
  yearly:         365,
};

function computeAccrual(item) {
  const [y, m, d] = item.next_due_date.split("-").map(Number);
  const due = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysUntilDue = Math.max(0, (due - today) / 86400000);
  const fraction = Math.min(1, Math.max(0, 1 - daysUntilDue / PERIOD_DAYS[item.frequency]));
  return { fraction, accruedAmount: Number(item.amount) * fraction };
}

function TrueExpenses({ recurring }) {
  const items = recurring.filter(
    (r) => !!r.is_active && r.type === "expense" && TRUE_EXPENSE_FREQS.has(r.frequency)
  );

  if (items.length === 0) return null;

  const totalMonthly = items.reduce(
    (sum, r) => sum + monthlyEquivalent(r.amount, r.frequency), 0
  );

  return (
    <div className="set-asides">
      <div className="set-asides-header">
        <span className="set-asides-title">Set-asides</span>
        <span className="set-asides-meta">
          {formatCurrency(totalMonthly)}/mo reserved · already in Safe-to-Spend
        </span>
      </div>

      <ul className="set-asides-list">
        {items.map((item) => {
          const monthly = monthlyEquivalent(item.amount, item.frequency);
          const { fraction, accruedAmount } = computeAccrual(item);
          const pct = Math.round(fraction * 100);

          return (
            <li key={item.id} className="set-aside-item">
              <div className="sa-row">
                <div className="sa-left">
                  <span className="sa-name">{item.name}</span>
                  <span className="sa-cadence">
                    {formatCurrency(item.amount)} / {FREQ_LABEL[item.frequency]}
                    {item.next_due_date && ` · due ${formatDate(item.next_due_date)}`}
                  </span>
                </div>
                <div className="sa-right">
                  <span className="sa-monthly">{formatCurrency(monthly)}/mo</span>
                  <span className="sa-accrued">
                    {formatCurrency(accruedAmount)} of {formatCurrency(item.amount)} accrued
                  </span>
                </div>
              </div>
              <div className="sa-track">
                <div className="sa-bar" style={{ width: `${pct}%` }} />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default TrueExpenses;
