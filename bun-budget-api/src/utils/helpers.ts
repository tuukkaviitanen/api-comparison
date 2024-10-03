import { t } from "elysia";

export const categoryType = t.Union(
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

export const hasAtMostTwoDecimals = (number: number) =>
  (number * 100) % 1 === 0;
