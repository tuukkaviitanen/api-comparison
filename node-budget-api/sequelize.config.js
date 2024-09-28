require("dotenv");
const url = process.env.DATABASE_URL;

module.exports = {
  development: {
    url,
    dialect: "postgres",
    define: {
      timestamps: false,
    },
  },
  production: {
    url,
    dialect: "postgres",
    define: {
      timestamps: false,
    },
  },
};