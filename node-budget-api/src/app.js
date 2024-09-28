const express = require("express");
const path = require("path");
const cors = require("cors");

const reportRouter = require("./routers/report-router");
const transactionRouter = require("./routers/transaction-router");
const errorHandler = require("./middlewares/error-handler");
const authenticate = require("./middlewares/authenticate");
const credentialRouter = require("./routers/credential-router");

const app = express();

app.use(cors());
app.use(express.json());

const projectRootPath = process.cwd();
const openapiFileName = "openapi.yaml";

app.get("/openapi.yaml", (req, res) =>
  res.sendFile(path.resolve(projectRootPath, openapiFileName)),
);

app.use("/reports", authenticate, reportRouter);
app.use("/transactions", authenticate, transactionRouter);
app.use("/credentials", credentialRouter);

app.use(errorHandler);

module.exports = app;
