import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { formatCurrency } from "../utils/format";

function Dashboard({ transactions }) {
  const income = transactions
    .filter((transaction) => Number(transaction.amount) > 0)
    .reduce((total, transaction) => total + Number(transaction.amount), 0);

  const expenses = transactions
    .filter((transaction) => Number(transaction.amount) < 0)
    .reduce((total, transaction) => total + Math.abs(Number(transaction.amount)), 0);

  const savings = income - expenses;
  const savingsRate = income > 0 ? Math.round((savings / income) * 100) : 0;
  const spentRate = income > 0 ? Math.round((expenses / income) * 100) : 0;

  return (
    <div className="dashboard">
      <div className="stat-card stat-income">
        <div className="stat-top">
          <span className="stat-label">Income</span>
          <div className="stat-icon">
            <TrendingUp size={18} />
          </div>
        </div>
        <span className="stat-value">{formatCurrency(income)}</span>
      </div>

      <div className="stat-card stat-expenses">
        <div className="stat-top">
          <span className="stat-label">Expenses</span>
          <div className="stat-icon">
            <TrendingDown size={18} />
          </div>
        </div>
        <span className="stat-value">{formatCurrency(expenses)}</span>
        <span className="stat-meta">{spentRate}% of income spent</span>
      </div>

      <div className="stat-card stat-savings">
        <div className="stat-top">
          <span className="stat-label">Savings</span>
          <div className="stat-icon">
            <Wallet size={18} />
          </div>
        </div>
        <span className="stat-value">{formatCurrency(savings)}</span>
        <span className="stat-meta">{savingsRate}% of income kept</span>
      </div>
    </div>
  );
}

export default Dashboard;