function Dashboard({ transactions }) {
  const income = transactions
    .filter((transaction) => Number(transaction.amount) > 0)
    .reduce((total, transaction) => total + Number(transaction.amount), 0);

  const expenses = transactions
    .filter((transaction) => Number(transaction.amount) < 0)
    .reduce((total, transaction) => total + Math.abs(Number(transaction.amount)), 0);

  const savings = income - expenses;

  // Savings rate: what % of income you keep
  const savingsRate = income > 0 ? Math.round((savings / income) * 100) : 0;

  return (
    <div className="dashboard">
      <div className="stat-card stat-income">
        <span className="stat-label">Income</span>
        <span className="stat-value">${income.toFixed(2)}</span>
      </div>

      <div className="stat-card stat-expenses">
        <span className="stat-label">Expenses</span>
        <span className="stat-value">${expenses.toFixed(2)}</span>
      </div>

      <div className="stat-card stat-savings">
        <span className="stat-label">Savings</span>
        <span className="stat-value">${savings.toFixed(2)}</span>
        <span className="stat-meta">
          {savingsRate}% of income kept
        </span>
      </div>
    </div>
  );
}

export default Dashboard;