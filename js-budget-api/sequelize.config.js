require("dotenv");
const url = process.env.DATABASE_URL;

module.exports = {
  development: {
    url,
    dialect: "postgres",
  },
  production: {
    url,
    dialect: "postgres",
  },
};
