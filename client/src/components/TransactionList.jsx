import { useState } from "react";
import { createTransaction, deleteTransaction } from "../services/api";
import { formatCurrency } from "../utils/format";

function TransactionList({ transactions, setTransactions }) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");

  const addTransaction = async () => {
    if (!description || amount === "") return;

    try {
      const saved = await createTransaction({
        description,
        amount: Number(amount),
      });

      setTransactions([...transactions, saved]);

      setDescription("");
      setAmount("");
    } catch (error) {
      console.error("Error adding transaction:", error);
    }
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
      <h2 className="transactions-header">Transactions</h2>

      <div className="transaction-form">
        <input
          className="input-description"
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          className="input-amount"
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <button className="add-btn" onClick={addTransaction}>
          Add
        </button>
      </div>

      {transactions.length === 0 ? (
        <p className="transactions-empty">No transactions yet. Add your first one above.</p>
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