import { useState, useEffect } from "react";
import { createRecurring, deleteRecurring, getCategories } from "../services/api";
import { formatCurrency, monthlyEquivalent } from "../utils/format";
import { RefreshCw } from "lucide-react";

const FREQ_OPTIONS = [
  { value: "weekly",         label: "Weekly" },
  { value: "fortnightly",    label: "Fortnightly" },
  { value: "every_4_weeks",  label: "Every 4 weeks" },
  { value: "monthly",        label: "Monthly" },
  { value: "every_2_months", label: "Every 2 months" },
  { value: "quarterly",      label: "Quarterly" },
  { value: "every_4_months", label: "Every 4 months" },
  { value: "twice_yearly",   label: "Twice a year" },
  { value: "yearly",         label: "Yearly" },
];

const FREQ_LABEL = {
  weekly:         "week",
  fortnightly:    "fortnight",
  every_4_weeks:  "4 weeks",
  monthly:        "month",
  every_2_months: "2 months",
  quarterly:      "quarter",
  every_4_months: "4 months",
  twice_yearly:   "6 months",
  yearly:         "year",
};

// Parse "YYYY-MM-DD" using local constructor to avoid UTC midnight shift
const formatDate = (dateStr) => {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

function RecurringList({ recurring, setRecurring }) {
  const [type, setType] = useState("expense");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState("monthly");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [categoryId, setCategoryId] = useState("");
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

  const addItem = async () => {
    if (!name.trim()) { setError("Please enter a name"); return; }
    if (amount === "" || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }
    setError("");
    try {
      const saved = await createRecurring({
        type,
        name: name.trim(),
        amount: Number(amount),
        frequency,
        next_due_date: date,
        category_id: categoryId ? Number(categoryId) : null,
      });

      const category = categories.find((c) => c.id === Number(categoryId));
      const enriched = {
        ...saved,
        category_name: category ? category.name : null,
        category_type: category ? category.type : null,
      };

      setRecurring(
        [...recurring, enriched].sort((a, b) =>
          a.next_due_date.localeCompare(b.next_due_date)
        )
      );
      setName("");
      setAmount("");
      setCategoryId("");
      setDate(new Date().toISOString().split("T")[0]);
    } catch (err) {
      console.error("Error adding recurring item:", err);
      setError("Failed to add recurring item");
    }
  };

  const removeItem = async (id) => {
    try {
      await deleteRecurring(id);
      setRecurring(recurring.filter((r) => r.id !== id));
    } catch (err) {
      console.error("Error deleting recurring item:", err);
    }
  };

  const grouped = {
    essential: categories.filter((c) => c.type === "essential"),
    lifestyle:  categories.filter((c) => c.type === "lifestyle"),
    savings:    categories.filter((c) => c.type === "savings"),
  };

  const active = recurring.filter((r) => !!r.is_active);

  return (
    <div className="recurring">
      <h2 className="transactions-header">
        <RefreshCw size={18} />
        Recurring
        <span className="transactions-count">{active.length}</span>
      </h2>

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
          placeholder="Name (e.g. Rent, Salary)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addItem()}
        />
        <input
          className="input-amount"
          type="number"
          placeholder="Amount"
          min="0"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addItem()}
        />
        <button className="add-btn" onClick={addItem}>Add</button>
      </div>

      <div className="transaction-form-row2">
        <select
          className="input-category"
          value={frequency}
          onChange={(e) => setFrequency(e.target.value)}
        >
          {FREQ_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <input
          className="input-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        {type === "expense" && (
          <select
            className="input-category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">Category</option>
            <optgroup label="Essential">
              {grouped.essential.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </optgroup>
            <optgroup label="Lifestyle">
              {grouped.lifestyle.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </optgroup>
            <optgroup label="Savings">
              {grouped.savings.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </optgroup>
          </select>
        )}
      </div>

      {error && <p className="form-error">{error}</p>}

      {active.length === 0 ? (
        <div className="transactions-empty">
          <div className="empty-icon">
            <RefreshCw size={28} />
          </div>
          <p className="empty-title">No recurring items yet</p>
          <p className="empty-subtitle">Add your income and bills above to start planning.</p>
        </div>
      ) : (
        <ul className="transaction-items">
          {active.map((item) => {
            const monthlyAmt = monthlyEquivalent(item.amount, item.frequency);
            const isIncome = item.type === "income";
            return (
              <li key={item.id} className="transaction-item">
                <div className="transaction-info">
                  <div className="recurring-name-row">
                    <span className={`type-pill pill-${item.type}`}>{item.type}</span>
                    <span className="transaction-description">{item.name}</span>
                  </div>
                  {item.category_name && (
                    <span className={`category-tag tag-${item.category_type}`}>
                      {item.category_name}
                    </span>
                  )}
                </div>

                <div className="transaction-right">
                  <div className="recurring-amounts">
                    <span className={`recurring-native ${isIncome ? "amount-income" : "amount-expense"}`}>
                      {isIncome ? "+" : "−"}{formatCurrency(item.amount)}
                      <span className="recurring-freq"> / {FREQ_LABEL[item.frequency]}</span>
                    </span>
                    <span className="recurring-monthly">{formatCurrency(monthlyAmt)}/mo</span>
                  </div>
                  <span className="recurring-due">due {formatDate(item.next_due_date)}</span>
                  <button className="delete-btn" onClick={() => removeItem(item.id)}>×</button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default RecurringList;
