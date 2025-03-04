require("dotenv");
const url = process.env.DATABASE_URL;

module.exports = {
  development: {
    url,
    dialect: "postgres",
    define: {
      timestamps: false,
    },
    pool: {
      max: 100,
    },
  },
  production: {
    url,
    dialect: "postgres",
    define: {
      timestamps: false,
    },
    pool: {
      max: 100,
    },
  },
};
