import Elysia, { t } from "elysia";
import authenticate from "../middlewares/authenticate";
import { generateReport } from "../services/report-service";
import {
  categoryDefinition,
  fromDefinition,
  toDefinition,
} from "../utils/parameter-definitions";

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
          category: categoryDefinition,
          from: fromDefinition,
          to: toDefinition,
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
