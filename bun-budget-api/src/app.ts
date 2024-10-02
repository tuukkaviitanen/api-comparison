import Elysia from "elysia";
import credentialRouter from "./routers/credential-router";
import transactionRouter from "./routers/transaction-router";
import reportRouter from "./routers/report-router";

const app = new Elysia()
  .use(credentialRouter)
  .use(transactionRouter)
  .use(reportRouter)
  .get("openapi.yaml", () => Bun.file("openapi.yaml"));

export default app;
