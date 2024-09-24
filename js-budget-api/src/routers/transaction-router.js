const express = require("express");
const {
  getTransactions,
  createTransaction,
  getTransaction,
  updateTransaction,
  deleteTransaction,
} = require("../services/transaction-service");
const { param, body, query } = require("express-validator");
const checkValidationResult = require("../middlewares/checkValidationResult");
const { transactionCategories } = require("../utils/helpers");

const transactionRouter = express.Router();

transactionRouter.get(
  "/",
  query("category")
    .optional()
    .isString()
    .toLowerCase()
    .isIn(transactionCategories),
  query(["from", "to"]).optional().isDate(),
  query("sort")
    .default("timestamp")
    .isString()
    .toLowerCase()
    .isIn(["timestamp", "category"]),
  query("order").default("ASC").isString().toUpperCase().isIn(["ASC", "DESC"]),
  query("limit").default(10).isInt({ min: 0 }).toInt(),
  query("skip").default(0).isInt({ min: 0 }).toInt(),
  checkValidationResult,
  async (req, res, next) => {
    try {
      const { credentialId } = req;
      const { category, from, to, sort, order, limit, skip } = req.query;

      const transactions = await getTransactions(
        credentialId,
        category,
        from,
        to,
        sort,
        order,
        limit,
        skip,
      );

      res.status(200).json(transactions);
    } catch (error) {
      next(error);
    }
  },
);

transactionRouter.get(
  "/:transactionId",
  param("transactionId").isUUID(),
  checkValidationResult,
  async (req, res, next) => {
    try {
      const { transactionId } = req.params;

      const transaction = await getTransaction(transactionId);

      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }

      res.status(200).json(transaction);
    } catch (error) {
      next(error);
    }
  },
);

transactionRouter.post(
  "/",
  body("category")
    .isString()
    .toLowerCase()
    .isIn(transactionCategories)
    .withMessage("Invalid category"),
  body("description").isString().isLength({ min: 4, max: 200 }),
  body("value")
    .isFloat({ min: -1_000_000_000, max: 1_000_000_000 })
    .isDecimal({ decimal_digits: "0,2" }),
  body("timestamp").isString().isISO8601(),
  checkValidationResult,
  async (req, res, next) => {
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
  },
);

transactionRouter.put(
  "/:transactionId",
  param("transactionId").isUUID(),
  body("category").isString().toLowerCase().isIn(transactionCategories),
  body("description").isString().isLength({ min: 4, max: 200 }),
  body("value")
    .isString()
    .isFloat({ min: -1_000_000_000, max: 1_000_000_000 })
    .isDecimal({ decimal_digits: "0,2" }),
  body("timestamp").isString().isDate(),
  checkValidationResult,
  async (req, res, next) => {
    try {
      const { transactionId } = req.params;
      const { category, description, value, timestamp } = req.body;

      const updatedTransaction = await updateTransaction(transactionId, {
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
  },
);

transactionRouter.delete(
  "/:transactionId",
  param("transactionId").isUUID(),
  checkValidationResult,
  async (req, res, next) => {
    try {
      const { transactionId } = req.params;

      const deleteSuccessful = await deleteTransaction(transactionId);

      if (!deleteSuccessful) {
        return res.status(404).json({ error: "Transaction not found" });
      }

      return res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  },
);

module.exports = transactionRouter;
