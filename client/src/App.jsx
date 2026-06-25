import { useState, useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./components/Dashboard";
import TransactionList from "./components/TransactionList";
import { getTransactions } from "./services/api";

function App() {
  const { user, logout, loading } = useAuth();
  const [transactions, setTransactions] = useState([]);

  // Fetch transactions only when logged in
  useEffect(() => {
    if (!user) return;

    const loadTransactions = async () => {
      try {
        const data = await getTransactions();
        setTransactions(data);
      } catch (error) {
        console.error("Error loading transactions:", error);
      }
    };

    loadTransactions();
  }, [user]);

  // While checking for a saved session, show nothing (prevents flicker)
  if (loading) return null;

  // Not logged in → show the auth screen
  if (!user) return <AuthPage />;

  // Logged in → show the app
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
        <TransactionList
          transactions={transactions}
          setTransactions={setTransactions}
        />
      </main>
    </div>
  );
}

export default App;