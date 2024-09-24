const errorHandler = (error, req, res, next) => {
  console.error("Error occurred,", error.message);

  if (error?.name === "SequelizeUniqueConstraintError") {
    const errorDetails = error?.errors?.[0];
    const message = `${errorDetails?.path} '${errorDetails?.value}' is already taken`;

    return res.status(400).json({
      error: message,
    });
  }

  res.status(500).json({
    error: "Unexpected error occurred",
  });

  next();
};

module.exports = errorHandler;
