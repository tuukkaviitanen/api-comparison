require("dotenv");
const { Sequelize } = require("sequelize");
const app = require("./app");

const main = async () => {
  const DATABASE_URL = process.env.DATABASE_URL;

  try {
    const sequelize = new Sequelize(DATABASE_URL);
    await sequelize.authenticate();
  } catch (error) {
    console.error("Database connection couldn't be created", error);
  }

  const PORT = Number(process.env.PORT) || 8080;

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
};

main();
