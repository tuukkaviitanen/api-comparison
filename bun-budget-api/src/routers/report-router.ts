import Elysia, { t } from "elysia";
import authenticate from "../middlewares/authenticate";
import { categoryType } from "../utils/helpers";
import { generateReport } from "../services/report-service";

const reportRouter = new Elysia({ prefix: "/reports" })
  .resolve(authenticate)
  .get(
    "/",
    async ({ query, credentialId }) => {
      const { category, to, from } = query;

      const report = await generateReport(
        credentialId,
        category,
        from ? new Date(from) : undefined,
        to ? new Date(to) : undefined,
      );

      return report;
    },
    {
      query: t.Partial(
        t.Object({
          category: categoryType,
          from: t.String({
            format: "date-time",
            error: "Invalid from timestamp",
          }),
          to: t.String({ format: "date-time", error: "Invalid to timestamp" }),
        }),
      ),
      transform: ({ query }) => {
        if (typeof query?.category === "string") {
          query.category =
            query.category.toLowerCase() as typeof query.category;
        }
      },
    },
  );

export default reportRouter;
