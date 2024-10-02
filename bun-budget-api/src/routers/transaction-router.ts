import Elysia from "elysia";

const transactionRouter = new Elysia({ prefix: "/transactions" })
  .post("/", ({ set }) => {
    set.status = 201;
    return;
  })
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
