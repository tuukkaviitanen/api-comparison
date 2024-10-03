import Elysia, { t } from "elysia";
import authenticate from "../middlewares/authenticate";
import {
  createTransaction,
  deleteTransaction,
  getTransaction,
  getTransactions,
  updateTransaction,
} from "../services/transaction-service";
import ValidationError from "../errors/validation-error";
import { categoryType, hasAtMostTwoDecimals } from "../utils/helpers";

const transactionRouter = new Elysia({ prefix: "/transactions" })
  .resolve(authenticate)
  .post(
    "/",
    async ({ set, body, credentialId }) => {
      const { category, description, timestamp, value } = body;
      const createdTransaction = await createTransaction({
        category,
        description,
        timestamp,
        value,
        credentialId,
      });

      set.status = 201;
      return createdTransaction;
    },
    {
      body: t.Object({
        category: categoryType,
        description: t.String({ error: "Invalid description" }),
        value: t.Number({
          minimum: -1_000_000_000,
          maximum: 1_000_000_000,
          error: "Invalid value",
        }),
        timestamp: t.Date({ error: "Invalid timestamp" }),
      }),
      transform: ({ body }) => {
        if (typeof body?.category === "string") {
          body.category = body.category.toLowerCase() as typeof body.category;
        }
      },
      beforeHandle: ({ body }) => {
        if (!hasAtMostTwoDecimals(body.value)) {
          throw new ValidationError("Invalid value");
        }
      },
    },
  )
  .get("/", async ({ credentialId }) => {
    const transactions = await getTransactions(credentialId);
    return transactions;
  })
  .get("/:transactionId", async ({ params, credentialId }) => {
    const { transactionId } = params;
    const transactions = await getTransaction(transactionId, credentialId);
    return transactions;
  })
  .put(
    "/:transactionId",
    async ({ params, credentialId, body }) => {
      const { transactionId } = params;
      const { category, description, timestamp, value } = body;
      const updatedTransaction = await updateTransaction(transactionId, {
        category,
        credentialId,
        description,
        timestamp: new Date(timestamp),
        value,
      });
      return updatedTransaction;
    },
    {
      body: t.Object({
        category: categoryType,
        description: t.String({ error: "Invalid description" }),
        value: t.Number({
          minimum: -1_000_000_000,
          maximum: 1_000_000_000,
          error: "Invalid value",
        }),
        timestamp: t.String({
          format: "date-time",
          error: "Invalid timestamp",
        }),
      }),
      transform: ({ body }) => {
        if (typeof body?.category === "string") {
          body.category = body.category.toLowerCase() as typeof body.category;
        }
      },
      beforeHandle: ({ body }) => {
        if (!hasAtMostTwoDecimals(body.value)) {
          throw new ValidationError("Invalid value");
        }
      },
    },
  )
  .delete("/:transactionId", async ({ set, params, credentialId }) => {
    const { transactionId } = params;
    await deleteTransaction(transactionId, credentialId);
    set.status = 204;
  });

export default transactionRouter;
