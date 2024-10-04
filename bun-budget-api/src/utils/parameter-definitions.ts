import { t } from "elysia";

export const categoryDefinition = t.Union(
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

export const valueDefinition = t.Number({
  minimum: -1_000_000_000,
  maximum: 1_000_000_000,
  error: "Invalid value",
});

export const timestampDefinition = t.String({
  format: "date-time",
  error: "Invalid timestamp",
});

export const descriptionDefinition = t.String({
  minLength: 4,
  maxLength: 200,
  error: "Invalid description",
});

export const fromDefinition = t.String({
  format: "date-time",
  error: "Invalid from value",
});

export const toDefinition = t.String({
  format: "date-time",
  error: "Invalid to value",
});

export const transactionIdDefinition = t.Object({
  transactionId: t.String({ format: "uuid", error: "Invalid transaction id" }),
});

export const sortDefinition = t.Union(
  [t.Literal("timestamp"), t.Literal("category")],
  {
    error: "Invalid sort value",
    default: "timestamp",
  },
);

export const orderDefinition = t.Union([t.Literal("asc"), t.Literal("desc")], {
  error: "Invalid order",
  default: "desc",
});

export const limitDefinition = t.Number({
  minimum: 0,
  multipleOf: 1,
  error: "Invalid limit value",
  default: 10,
});

export const skipDefinition = t.Number({
  minimum: 0,
  multipleOf: 1,
  error: "Invalid skip value",
  default: 0,
});
