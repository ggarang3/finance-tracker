import { useState, useMemo } from "react";
import { projectOccurrences, WINDOW_DAYS } from "../utils/projection";
import { formatCurrency } from "../utils/format";

const shortDate = (dateStr) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-AU', {
    day: 'numeric', month: 'short',
  });
};

function ForwardView({ recurring }) {
  const [balanceInput, setBalanceInput] = useState('');

  const startingBalance = balanceInput === '' ? 0 : Number(balanceInput);
  const hasBalance = balanceInput !== '';

  const occurrences = useMemo(
    () => projectOccurrences(recurring.filter((r) => !!r.is_active), WINDOW_DAYS),
    [recurring]
  );

  const timeline = useMemo(() => {
    let balance = startingBalance;
    return occurrences.map((occ) => {
      balance += occ.signedAmount;
      return { ...occ, balanceAfter: balance };
    });
  }, [occurrences, startingBalance]);

  if (recurring.filter((r) => !!r.is_active).length === 0) {
    return (
      <div className="forward-view">
        <div className="transactions-empty">
          <p className="empty-title">Nothing to project yet</p>
          <p className="empty-subtitle">
            Add your income and bills in the Recurring tab to see what's coming up.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="forward-view">
      <div className="fv-header">
        <div>
          <span className="fv-title">Next {WINDOW_DAYS} days</span>
          <p className="fv-subtitle">Every payment and payday in the next {WINDOW_DAYS} days, and your balance after each.</p>
        </div>
        <div className="fv-balance-row">
          <label className="fv-balance-label">Current balance</label>
          <div className="fv-balance-wrap">
            <span className="fv-balance-prefix">$</span>
            <input
              className="fv-balance-field"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={balanceInput}
              onChange={(e) => setBalanceInput(e.target.value)}
            />
          </div>
        </div>
      </div>

      {!hasBalance && (
        <p className="fv-nudge">
          Enter your current balance above for an accurate projection.
        </p>
      )}

      {timeline.length === 0 ? (
        <p className="fv-empty-window">Nothing scheduled in the next {WINDOW_DAYS} days.</p>
      ) : (
        <>
          <div className="fv-col-headers">
            <span>Date</span>
            <span>Item</span>
            <span>Amount</span>
            <span>Balance after</span>
          </div>
          <ul className="fv-timeline">
          {timeline.map((row, i) => {
            const isIncome = row.type === 'income';
            const isTight  = row.balanceAfter < 0;
            return (
              <li
                key={`${row.recurringId}-${row.date}-${i}`}
                className={`fv-row${isTight ? ' fv-row-tight' : ''}`}
              >
                <span className="fv-date">{shortDate(row.date)}</span>
                <span className="fv-name">{row.name}</span>
                <span className={`fv-amount ${isIncome ? 'fv-income' : 'fv-expense'}`}>
                  {isIncome ? '+' : '−'}{formatCurrency(Math.abs(row.signedAmount))}
                </span>
                <span className={`fv-balance-col${isTight ? ' fv-balance-tight' : ''}`}>
                  {formatCurrency(row.balanceAfter)}
                </span>
              </li>
            );
          })}
        </ul>
        </>
      )}
    </div>
  );
}

export default ForwardView;
