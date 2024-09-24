const express = require("express");
const {
  getTransactions,
  createTransaction,
  getTransaction,
  upsertTransaction,
} = require("../services/transaction-service");

const transactionRouter = express.Router();

transactionRouter.get("/", async (req, res, next) => {
  try {
    const { credentialId } = req;

    const transactions = await getTransactions(credentialId);

    res.status(200).json(transactions);
  } catch (error) {
    next(error);
  }
});

transactionRouter.get("/:transactionId", async (req, res, next) => {
  try {
    const { transactionId } = req.params;

    const transaction = await getTransaction(transactionId);

    res.status(200).json(transaction);
  } catch (error) {
    next(error);
  }
});

transactionRouter.post("/", async (req, res, next) => {
  try {
    const { category, description, value, timestamp } = req.body;
    const { credentialId } = req;

    const createdCredential = await createTransaction({
      category,
      description,
      value,
      timestamp,
      credentialId,
    });

    return res.status(201).json(createdCredential);
  } catch (error) {
    next(error);
  }
});

transactionRouter.put("/:transactionId", async (req, res, next) => {
  try {
    const { transactionId } = req.params;
    const { category, description, value, timestamp } = req.body;

    const updatedTransaction = await upsertTransaction(transactionId, {
      category,
      description,
      value,
      timestamp,
    });

    if (!updatedTransaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    return res.status(200).json(updatedTransaction);
  } catch (error) {
    next(error);
  }
});

transactionRouter.delete("/", (req, res) => {
  res.sendStatus(204);
});

module.exports = transactionRouter;
