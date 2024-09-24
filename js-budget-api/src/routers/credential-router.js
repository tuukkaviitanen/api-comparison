const express = require("express");
const authenticate = require("../middlewares/authenticate");
const {
  createCredential,
  deleteCredential,
} = require("../services/credential-service");

const credentialRouter = express.Router();

credentialRouter.post("/", async (req, res, next) => {
  try {
    const { username, password } = req.body;

    await createCredential(username, password);

    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
});

credentialRouter.delete("/", authenticate, async (req, res, next) => {
  try {
    const { credentialId } = req;
    await deleteCredential(credentialId);
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
});

module.exports = credentialRouter;
