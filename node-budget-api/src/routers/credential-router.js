const express = require("express");
const authenticate = require("../middlewares/authenticate");
const {
  createCredential,
  deleteCredential,
} = require("../services/credential-service");
const checkValidationResult = require("../middlewares/checkValidationResult");
const { body } = require("express-validator");

const credentialRouter = express.Router();

credentialRouter.post(
  "/",
  body("username").isString().isLength({ min: 4, max: 50 }),
  body("password").isString().isLength({ min: 8, max: 50 }),
  checkValidationResult,
  async (req, res, next) => {
    try {
      const { username, password } = req.body;

      await createCredential(username, password);

      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  },
);

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
