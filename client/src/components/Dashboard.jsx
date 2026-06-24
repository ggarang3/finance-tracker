function Dashboard({ transactions }) {
  const income = transactions
    .filter((transaction) => Number(transaction.amount) > 0)
    .reduce((total, transaction) => total + Number(transaction.amount), 0);

  const expenses = transactions
    .filter((transaction) => Number(transaction.amount) < 0)
    .reduce((total, transaction) => total + Math.abs(Number(transaction.amount)), 0);

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