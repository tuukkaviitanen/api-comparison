const express = require("express");
const { generateReport } = require("../services/report-service");

const reportRouter = express.Router();

reportRouter.get("/", async (req, res, next) => {
  try {
    const { credentialId } = req;
    const { category, from, to } = req.query;

    const report = await generateReport(credentialId, category, from, to);

    return res.status(200).json(report);
  } catch (error) {
    next(error);
  }
});

module.exports = reportRouter;
