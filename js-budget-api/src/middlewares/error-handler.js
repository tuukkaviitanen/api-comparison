const errorHandler = (error, req, res) => {
  console.error("Error occurred", error);
  res.status(500).json({
    error: "Unexpected error occurred",
  });
};

module.exports = errorHandler;
