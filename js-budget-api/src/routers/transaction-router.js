const express = require("express");
const { getTransactions } = require("../services/transaction-service");

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

transactionRouter.post("/", (req, res) => {
  res.sendStatus(201);
});

transactionRouter.put("/", (req, res) => {
  res.sendStatus(200);
});

transactionRouter.delete("/", (req, res) => {
  res.sendStatus(204);
});

module.exports = transactionRouter;
