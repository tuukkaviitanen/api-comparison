import app from "./app";

const PORT = Number(Bun.env.PORT) || 8080;

app.listen(PORT, () => {
  console.log(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
  );
});
