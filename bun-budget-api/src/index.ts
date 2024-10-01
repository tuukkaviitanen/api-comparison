import { Elysia } from "elysia";

const PORT = Number(process.env.PORT) || 8080;

const app = new Elysia().get("/", () => "Hello Elysia").listen(PORT);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
