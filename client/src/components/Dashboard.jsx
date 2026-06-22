function Dashboard({ transactions }) {
  const income = transactions
    .filter((transaction) => transaction.amount > 0)
    .reduce((total, transaction) => total + transaction.amount, 0);

  const expenses = transactions
    .filter((transaction) => transaction.amount < 0)
    .reduce((total, transaction) => total + Math.abs(transaction.amount), 0);

  const savings = income - expenses;

  return (
    <div>
      <h2>Dashboard</h2>

      <h3>Income: ${income.toFixed(2)}</h3>
      <h3>Expenses: ${expenses.toFixed(2)}</h3>
      <h3>Savings: ${savings.toFixed(2)}</h3>
    </div>
  );
}

export default Dashboard;