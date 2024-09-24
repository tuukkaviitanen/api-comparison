const express = require("express");
const {
  getTransactions,
  createTransaction,
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

transactionRouter.get("/:transactionId", (req, res) => {
  res.sendStatus(200);
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

transactionRouter.put("/", (req, res) => {
  res.sendStatus(200);
});

transactionRouter.delete("/", (req, res) => {
  res.sendStatus(204);
});

module.exports = transactionRouter;
