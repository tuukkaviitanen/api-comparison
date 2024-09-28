const { validationResult } = require("express-validator");

const checkValidationResult = (req, res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) {
    next();
  } else {
    next(result);
  }
};

module.exports = checkValidationResult;
