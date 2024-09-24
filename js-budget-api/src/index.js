require("dotenv");
const db = require("./models");
const app = require("./app");

const main = async () => {
  try {
    await db.sequelize.authenticate();
  } catch (error) {
    console.error("Database connection couldn't be created", error);
    process.exit(1); // Failure code
  }

  const PORT = Number(process.env.PORT) || 8080;

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
};

main();
