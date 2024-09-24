const errorHandler = (error, req, res, next) => {
  console.error("Error occurred", error.message);

  res.status(500).json({
    error: "Unexpected error occurred",
  });

  next();
};

module.exports = errorHandler;
