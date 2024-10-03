import app from "./app";
import prisma from "./utils/prisma";

const PORT = Number(Bun.env.PORT) || 8080;

console.log("Initializing database connection...");
await prisma.$connect();
console.log("Database connection successfully created");

app.listen(PORT, () => {
  console.log(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
  );
});
