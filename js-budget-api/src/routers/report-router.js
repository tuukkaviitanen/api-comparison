const express = require("express");

const reportRouter = express.Router();

reportRouter.get("/", (req, res) => {
  res.sendStatus(200);
});

module.exports = reportRouter;
