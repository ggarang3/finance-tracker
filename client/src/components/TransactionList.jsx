import { useState, useEffect } from "react";
import { createTransaction, deleteTransaction, getCategories } from "../services/api";
import { formatCurrency } from "../utils/format";
import { Receipt } from "lucide-react";

function TransactionList({ transactions, setTransactions }) {
  const [type, setType] = useState("expense");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        console.error("Error loading categories:", err);
      }
    };
    loadCategories();
  }, []);

  const addTransaction = async () => {
    if (!description.trim()) {
      setError("Please enter a description");
      return;
    }
    if (amount === "" || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    setError("");

    try {
      const saved = await createTransaction({
        description: description.trim(),
        amount: Number(amount),
        type,
        category_id: categoryId ? Number(categoryId) : null,
        transaction_date: date,
      });

      const category = categories.find((c) => c.id === Number(categoryId));
      const enriched = {
        ...saved,
        category_name: category ? category.name : null,
        category_type: category ? category.type : null,
      };

      setTransactions([enriched, ...transactions]);
      setDescription("");
      setAmount("");
      setCategoryId("");
      setDate(new Date().toISOString().split("T")[0]);
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
      setTransactions(transactions.filter((t) => t.id !== id));
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  };

  const grouped = {
    essential: categories.filter((c) => c.type === "essential"),
    lifestyle: categories.filter((c) => c.type === "lifestyle"),
    savings: categories.filter((c) => c.type === "savings"),
  };

  return (
    <div className="transactions">
      <h2 className="transactions-header">
        Transactions
        <span className="transactions-count">{transactions.length}</span>
      </h2>

      {/* Expense / Income toggle */}
      <div className="type-toggle">
        <button
          className={`toggle-btn ${type === "expense" ? "active expense" : ""}`}
          onClick={() => setType("expense")}
        >
          Expense
        </button>
        <button
          className={`toggle-btn ${type === "income" ? "active income" : ""}`}
          onClick={() => { setType("income"); setCategoryId(""); }}
        >
          Income
        </button>
      </div>

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

      <div className="transaction-form-row2">
        {type === "expense" && (
          <select
            className="input-category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">Category</option>
            <optgroup label="Essential">
              {grouped.essential.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </optgroup>
            <optgroup label="Lifestyle">
              {grouped.lifestyle.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </optgroup>
            <optgroup label="Savings">
              {grouped.savings.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </optgroup>
          </select>
        )}
        <input
          className="input-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
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
                  {transaction.category_name && (
                    <span className={`category-tag tag-${transaction.category_type}`}>
                      {transaction.category_name}
                    </span>
                  )}
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