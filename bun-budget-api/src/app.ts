import Elysia from "elysia";
import credentialRouter from "./routers/credential-router";
import transactionRouter from "./routers/transaction-router";
import reportRouter from "./routers/report-router";
import AuthenticationError from "./errors/authentication-error";
import CustomValidationError from "./errors/validation-error";
import UniqueError from "./errors/unique-error";
import NotFoundError from "./errors/not-found-error";

const app = new Elysia()
  .onError(({ error, set, code }) => {
    console.error("Error occurred", error.message);
    console.dir(error);

    if (error instanceof AuthenticationError) {
      set.headers["www-authenticate"] = "Basic";
      set.status = 401;
      return { error: `Authentication error: ${error.message}` };
    }

    if (code === "VALIDATION" || error instanceof CustomValidationError) {
      set.status = 400;
      return { error: `Validation error: ${error.message}` };
    }

    if (error instanceof UniqueError) {
      set.status = 400;
      return {
        error: `Unique error: ${error.message}`,
      };
    }

    if (error instanceof NotFoundError) {
      set.status = 404;
      return {
        error: `Not found: ${error.message}`,
      };
    }

    set.status = 500;
    return { error: "Unexpected error occurred" };
  })
  .use(credentialRouter)
  .use(transactionRouter)
  .use(reportRouter)
  .get("openapi.yaml", () => Bun.file("openapi.yaml"));
export default app;
