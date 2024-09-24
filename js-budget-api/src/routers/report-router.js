const express = require("express");
const { generateReport } = require("../services/report-service");
const { query } = require("express-validator");
const { transactionCategories } = require("../utils/helpers");
const checkValidationResult = require("../middlewares/checkValidationResult");

const reportRouter = express.Router();

reportRouter.get(
  "/",
  query("category")
    .optional()
    .isString()
    .toLowerCase()
    .isIn(transactionCategories)
    .withMessage("invalid category"),
  query(["from", "to"]).optional().isISO8601(),
  checkValidationResult,
  async (req, res, next) => {
    try {
      const { credentialId } = req;
      const { category, from, to } = req.query;

      const report = await generateReport(credentialId, category, from, to);

      return res.status(200).json(report);
    } catch (error) {
      next(error);
    }
  },
);

module.exports = reportRouter;
