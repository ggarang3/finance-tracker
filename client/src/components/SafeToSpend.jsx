import { formatCurrency, monthlyEquivalent } from "../utils/format";

function SafeToSpend({ recurring }) {
  const active = recurring.filter((r) => !!r.is_active);

  const monthlyIncome = active
    .filter((r) => r.type === "income")
    .reduce((sum, r) => sum + monthlyEquivalent(r.amount, r.frequency), 0);

  const monthlyExpenses = active
    .filter((r) => r.type === "expense")
    .reduce((sum, r) => sum + monthlyEquivalent(r.amount, r.frequency), 0);

  const safeToSpend = monthlyIncome - monthlyExpenses;

  const buckets = { essential: 0, lifestyle: 0, savings: 0 };
  active
    .filter((r) => r.type === "expense" && buckets[r.category_type] !== undefined)
    .forEach((r) => { buckets[r.category_type] += monthlyEquivalent(r.amount, r.frequency); });

  const isEmpty = active.length === 0;

  return (
    <div className="sts-panel">
      <div className="sts-hero">
        <div className="sts-hero-top">
          <span className="sts-label">Safe to Spend</span>
          <span className="sts-period">per month</span>
        </div>

        {isEmpty ? (
          <p className="sts-empty">
            Add your income and bills in the Recurring tab to see your Safe-to-Spend.
          </p>
        ) : (
          <>
            <span className={`sts-amount ${safeToSpend >= 0 ? "sts-positive" : "sts-negative"}`}>
              {formatCurrency(safeToSpend)}
            </span>
            <div className="sts-supporting">
              <span className="sts-income-line">↑ {formatCurrency(monthlyIncome)} income</span>
              <span className="sts-dot">·</span>
              <span className="sts-expense-line">↓ {formatCurrency(monthlyExpenses)} expenses</span>
            </div>
          </>
        )}
      </div>

      {!isEmpty && (
        <div className="sts-buckets">
          <div className="sts-bucket sts-bucket-essential">
            <span className="sts-bucket-label">Essential</span>
            <span className="sts-bucket-amount">{formatCurrency(buckets.essential)}</span>
            <span className="sts-bucket-period">/mo</span>
          </div>
          <div className="sts-bucket sts-bucket-lifestyle">
            <span className="sts-bucket-label">Lifestyle</span>
            <span className="sts-bucket-amount">{formatCurrency(buckets.lifestyle)}</span>
            <span className="sts-bucket-period">/mo</span>
          </div>
          <div className="sts-bucket sts-bucket-savings">
            <span className="sts-bucket-label">Savings</span>
            <span className="sts-bucket-amount">{formatCurrency(buckets.savings)}</span>
            <span className="sts-bucket-period">/mo</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default SafeToSpend;
