import { useState } from "react";
import { createTransaction, deleteTransaction } from "../services/api";
import { formatCurrency } from "../utils/format";
import { Receipt } from "lucide-react";

function TransactionList({ transactions, setTransactions }) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  const addTransaction = async () => {
    if (!description.trim()) {
      setError("Please enter a description");
      return;
    }
    if (amount === "" || isNaN(Number(amount))) {
      setError("Please enter a valid amount");
      return;
    }

    setError("");

    try {
      const saved = await createTransaction({
        description: description.trim(),
        amount: Number(amount),
      });

      setTransactions([...transactions, saved]);
      setDescription("");
      setAmount("");
    } catch (error) {
      console.error("Error adding transaction:", error);
      setError("Failed to add transaction");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") addTransaction();
  };

  const removeTransaction = async (id) => {
    try {
      await deleteTransaction(id);
      setTransactions(transactions.filter((transaction) => transaction.id !== id));
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  };

  return (
    <div className="transactions">
      <h2 className="transactions-header">
        Transactions
        <span className="transactions-count">{transactions.length}</span>
      </h2>

      <div className="transaction-form">
        <input
          className="input-description"
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <input
          className="input-amount"
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className="add-btn" onClick={addTransaction}>
          Add
        </button>
      </div>

      {error && <p className="form-error">{error}</p>}

      {transactions.length === 0 ? (
        <div className="transactions-empty">
          <div className="empty-icon">
            <Receipt size={28} />
          </div>
          <p className="empty-title">No transactions yet</p>
          <p className="empty-subtitle">Add your first transaction above to start tracking.</p>
        </div>
      ) : (
        <ul className="transaction-items">
          {transactions.map((transaction) => {
            const amountValue = Number(transaction.amount);
            const isPositive = amountValue >= 0;

            return (
              <li key={transaction.id} className="transaction-item">
                <div className="transaction-info">
                  <span className="transaction-description">
                    {transaction.description}
                  </span>
                </div>

                <div className="transaction-right">
                  <span className={`transaction-amount ${isPositive ? "positive" : "negative"}`}>
                    {isPositive ? "+" : "−"}{formatCurrency(Math.abs(amountValue))}
                  </span>
                  <button
                    className="delete-btn"
                    onClick={() => removeTransaction(transaction.id)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default TransactionList;