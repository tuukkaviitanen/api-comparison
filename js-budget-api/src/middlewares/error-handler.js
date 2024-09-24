const { Result } = require("express-validator");

const errorHandler = (error, req, res, next) => {
  console.error("Error occurred,", error.message || error);

  if (error?.name === "SequelizeUniqueConstraintError") {
    const errorDetails = error?.errors?.[0];
    const message = `${errorDetails?.path} '${errorDetails?.value}' is already taken`;

    return res.status(400).json({
      error: message,
    });
  }

  if (error instanceof Result) {
    const errorMessages = error.array().reduce((errorMessages, error) => {
      return [
        ...errorMessages,
        `${error.msg} '${error.value}' in ${error.location} parameter ${error.path}`,
      ];
    }, []);

    const fullMessage = errorMessages.join(", ");
    return res.status(400).json({
      error: `Validation error: ${fullMessage}`,
    });
  }

  res.status(500).json({
    error: "Unexpected error occurred",
  });

  next();
};

module.exports = errorHandler;
