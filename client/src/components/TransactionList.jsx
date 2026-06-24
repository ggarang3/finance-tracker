import { useState } from "react";
import { createTransaction, deleteTransaction } from "../services/api";

function TransactionList({ transactions, setTransactions }) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");

  const addTransaction = async () => {
    // Basic guard: don't submit empty fields
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

      // Remove it from the UI by filtering it out
      setTransactions(transactions.filter((transaction) => transaction.id !== id));
    } catch (error) {
      console.error("Error deleting transaction:", error);
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
            <button onClick={() => removeTransaction(transaction.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TransactionList;