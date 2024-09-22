require("dotenv");
const express = require("express");

const reportRouter = require("./routers/report-router");
const transactionRouter = require("./routers/transaction-router");

const app = express();
const port = Number(process.env.PORT) || 8080;

app.get("/openapi.yaml", (req, res) => res.sendStatus(200));

app.use("/reports", reportRouter);
app.use("/transactions", transactionRouter);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
