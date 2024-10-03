import Elysia from "elysia";
import credentialRouter from "./routers/credential-router";
import transactionRouter from "./routers/transaction-router";
import reportRouter from "./routers/report-router";
import AuthenticationError from "./errors/AuthenticationError";

const app = new Elysia()
  .onError(({ error, set }) => {
    console.error(error.message);

    if (error instanceof AuthenticationError) {
      set.headers["www-authenticate"] = "Basic";
      set.status = 401;
      return { error: `Authentication error: ${error.message}` };
    }

    set.status = 500;
    return { error: "Unexpected error occurred" };
  })
  .use(credentialRouter)
  .use(transactionRouter)
  .use(reportRouter)
  .get("openapi.yaml", () => Bun.file("openapi.yaml"));
export default app;
