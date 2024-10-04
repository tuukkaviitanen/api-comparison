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
  .get(
    "/",
    async ({ credentialId, query }) => {
      const { category, from, to, sort, order, limit, skip } = query;
      const transactions = await getTransactions(
        credentialId,
        category,
        from ? new Date(from) : undefined,
        to ? new Date(to) : undefined,
        sort,
        order,
        limit,
        skip,
      );
      return transactions;
    },
    {
      query: t.Partial(
        t.Object({
          category: categoryType,
          from: t.String({ format: "date-time", error: "Invalid from value" }),
          to: t.String({ format: "date-time", error: "Invalid to value" }),
          sort: t.Union([t.Literal("timestamp"), t.Literal("category")], {
            error: "Invalid sort value",
          }),
          order: t.Union([t.Literal("asc"), t.Literal("desc")], {
            error: "Invalid order",
          }),
          limit: t.Number({
            minimum: 0,
            multipleOf: 1,
            error: "Invalid limit value",
          }),
          skip: t.Number({
            minimum: 0,
            multipleOf: 1,
            error: "Invalid skip value",
          }),
        }),
      ),
      transform: ({ query }) => {
        if (typeof query?.category === "string") {
          query.category =
            query.category.toLowerCase() as typeof query.category;
        }
        if (typeof query?.sort === "string") {
          query.sort = query.sort.toLowerCase() as typeof query.sort;
        }
        if (typeof query?.order === "string") {
          query.order = query.order.toLowerCase() as typeof query.order;
        }
      },
    },
  )
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
