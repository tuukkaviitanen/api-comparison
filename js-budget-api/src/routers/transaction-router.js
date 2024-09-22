const express = require("express");

const transactionRouter = express.Router();

transactionRouter.get("/", (req, res) => {
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
