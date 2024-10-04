import Elysia, { t } from "elysia";
import authenticate from "../middlewares/authenticate";
import {
  createCredential,
  deleteCredential,
} from "../services/credential-service";
import {
  passwordDefinition,
  usernameDefinition,
} from "../utils/parameter-definitions";

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
        username: usernameDefinition,
        password: passwordDefinition,
      }),
    },
  )
  .resolve(authenticate)
  .delete("/", async ({ set, credentialId }) => {
    await deleteCredential(credentialId);
    set.status = 204;
  });

export default credentialRouter;
