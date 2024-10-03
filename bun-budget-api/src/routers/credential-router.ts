import Elysia, { t } from "elysia";
import authenticate from "../middlewares/authenticate";
import { createCredential } from "../services/credential-service";

const credentialRouter = new Elysia({ prefix: "/credentials" })
  .post(
    "/",
    async ({ set, body }) => {
      const { username, password } = body;
      await createCredential(username, password);
      set.status = 204;
    },
    {
      body: t.Object({
        username: t.String({ minLength: 4, maxLength: 50 }),
        password: t.String({ minLength: 8, maxLength: 50 }),
      }),
    },
  )
  .resolve(authenticate)
  .delete("/", ({ set }) => {
    set.status = 204;
  });

export default credentialRouter;
