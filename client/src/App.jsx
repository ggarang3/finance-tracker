import { useState, useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./components/Dashboard";
import TransactionList from "./components/TransactionList";
import RecurringList from "./components/RecurringList";
import { getTransactions, getRecurring } from "./services/api";

function App() {
  const { user, logout, loading } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [recurring, setRecurring] = useState([]);
  const [activeTab, setActiveTab] = useState("transactions");

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      try {
        const [txData, recData] = await Promise.all([
          getTransactions(),
          getRecurring(),
        ]);
        setTransactions(txData);
        setRecurring(recData);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    loadData();
  }, [user]);

  if (loading) return null;
  if (!user) return <AuthPage />;

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-brand">
          <div className="app-logo">₣</div>
          <span>Finance Tracker</span>
        </div>
        <div className="app-user">
          <span>{user.name}</span>
          <button className="logout-btn" onClick={logout}>Log out</button>
        </div>
      </header>

      <main className="app-main">
        <Dashboard transactions={transactions} />

        <div className="tab-bar">
          <button
            className={`tab-btn ${activeTab === "transactions" ? "active" : ""}`}
            onClick={() => setActiveTab("transactions")}
          >
            Transactions
          </button>
          <button
            className={`tab-btn ${activeTab === "recurring" ? "active" : ""}`}
            onClick={() => setActiveTab("recurring")}
          >
            Recurring
          </button>
        </div>

        {activeTab === "transactions" ? (
          <TransactionList
            transactions={transactions}
            setTransactions={setTransactions}
          />
        ) : (
          <RecurringList
            recurring={recurring}
            setRecurring={setRecurring}
          />
        )}
      </main>
    </div>
  );
}

export default App;
