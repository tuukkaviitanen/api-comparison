import Elysia from "elysia";
import authenticate from "../middlewares/authenticate";

const reportRouter = new Elysia({ prefix: "/reports" })
  .resolve(authenticate)
  .get("/", () => {
    return;
  });

export default reportRouter;
