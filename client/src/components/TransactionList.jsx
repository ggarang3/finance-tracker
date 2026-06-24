import { useState } from "react";
import { createTransaction } from "../services/api";

function TransactionList({ transactions, setTransactions }) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");

  const addTransaction = async () => {
    // Basic guard: don't submit empty fields
    if (!description || amount === "") return;

    try {
      // Save to the database via the API, get back the real transaction
      const saved = await createTransaction({
        description,
        amount: Number(amount),
      });

      // Add the saved transaction (with its real DB id) to the list
      setTransactions([...transactions, saved]);

      setDescription("");
      setAmount("");
    } catch (error) {
      console.error("Error adding transaction:", error);
    }
  };

  return (
    <div>
      <h2>Transactions</h2>

      <input
        type="text"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <br />
      <br />

      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <br />
      <br />

      <button onClick={addTransaction}>
        Add Transaction
      </button>

      <ul>
        {transactions.map((transaction) => (
          <li key={transaction.id}>
            {transaction.description} ${transaction.amount}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TransactionList;