const express = require("express");
const authenticate = require("../middlewares/authenticate");

const credentialRouter = express.Router();

credentialRouter.post("/", (req, res) => {
  res.sendStatus(204);
});

credentialRouter.delete("/", authenticate, (req, res) => {
  res.sendStatus(204);
});

module.exports = credentialRouter;
