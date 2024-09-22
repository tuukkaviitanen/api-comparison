require("dotenv");
const express = require("express");

const reportRouter = require("./routers/report-router");
const transactionRouter = require("./routers/transaction-router");
const errorHandler = require("./middlewares/error-handler");
const authenticate = require("./middlewares/authenticate");
const credentialRouter = require("./routers/credential-router");

const app = express();
const port = Number(process.env.PORT) || 8080;

app.get("/openapi.yaml", (_req, res) => res.sendStatus(200));

app.use("/reports", authenticate, reportRouter);
app.use("/transactions", authenticate, transactionRouter);
app.use("/credentials", credentialRouter);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
