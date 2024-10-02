import Elysia from "elysia";

const credentialRouter = new Elysia({ prefix: "/credentials" })
  .post("/", ({ set }) => {
    set.status = 204;
    return;
  })
  .delete("/", ({ set }) => {
    set.status = 204;
    return;
  });

export default credentialRouter;
