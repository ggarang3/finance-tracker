import { useState, useEffect } from "react";
import Dashboard from "./components/Dashboard";
import TransactionList from "./components/TransactionList";
import { getTransactions } from "./services/api";

function App() {
  const [transactions, setTransactions] = useState([]);

  // Fetch transactions from the API when the app loads
  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const data = await getTransactions();
        setTransactions(data);
      } catch (error) {
        console.error("Error loading transactions:", error);
      }
    };

    loadTransactions();
  }, []);

  return (
    <div>
      <h1>Finance Tracker</h1>

      <Dashboard transactions={transactions} />

      <TransactionList
        transactions={transactions}
        setTransactions={setTransactions}
      />
    </div>
  );
}

export default App;