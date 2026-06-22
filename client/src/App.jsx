import { useState } from "react";
import Dashboard from "./components/Dashboard";
import TransactionList from "./components/TransactionList";

function App() {
  const [transactions, setTransactions] = useState([
    {
      id: 1,
      description: "Salary",
      amount: 1500,
    },
    {
      id: 2,
      description: "Rent",
      amount: -375,
    },
    {
      id: 3,
      description: "Gym",
      amount: -21,
    },
  ]);

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