import Elysia from "elysia";
import authenticate from "../middlewares/authenticate";

const credentialRouter = new Elysia({ prefix: "/credentials" })
  .post("/", ({ set }) => {
    set.status = 204;
    return;
  })
  .resolve(authenticate)
  .delete("/", ({ set }) => {
    set.status = 204;
    return;
  });

export default credentialRouter;
