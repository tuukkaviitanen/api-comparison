import Elysia, { t } from "elysia";
import authenticate from "../middlewares/authenticate";
import { createTransaction } from "../services/transaction-service";

const categoryType = t.Union(
  [
    t.Literal("household & services"),
    t.Literal("food & drinks"),
    t.Literal("transport"),
    t.Literal("recreation"),
    t.Literal("health"),
    t.Literal("other"),
  ],
  {
    error: "Invalid category",
  },
);

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
        value: t.Number({ error: "Invalid value" }),
        timestamp: t.Date({ error: "Invalid timestamp" }),
      }),
      transform: ({ body }) => {
        if (typeof body?.category === "string") {
          body.category = body.category.toLowerCase() as typeof body.category;
        }
      },
    },
  )
  .get("/", () => {
    return;
  })
  .get("/:transactionId", () => {
    return;
  })
  .put("/:transactionId", () => {
    return;
  })
  .delete("/:transactionId", ({ set }) => {
    set.status = 204;
    return;
  });

export default transactionRouter;
