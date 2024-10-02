import Elysia from "elysia";

const reportRouter = new Elysia({ prefix: "/reports" }).get("/", () => {
  return;
});

export default reportRouter;
