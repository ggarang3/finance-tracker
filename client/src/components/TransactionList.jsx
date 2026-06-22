import { useState } from "react";

function TransactionList({ transactions, setTransactions }) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");

  const addTransaction = () => {
    const newTransaction = {
      id: Date.now(),
      description,
      amount: Number(amount),
    };

    setTransactions([...transactions, newTransaction]);

    setDescription("");
    setAmount("");
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