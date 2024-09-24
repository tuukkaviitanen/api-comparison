const crypto = require("node:crypto");
const { Op } = require("sequelize");

const generateHash = (string) => {
  const hash = crypto.createHash("sha256");
  hash.update(string);
  const result = hash.digest("hex");
  return result;
};

const roundToTwoDecimals = (num) => Math.round(num * 100) / 100;

const getTimestampFilter = (from, to) => {
  if (from && to) {
    return { [Op.between]: [from, to] };
  } else if (from) {
    return { [Op.gte]: from };
  } else if (to) {
    return { [Op.lte]: to };
  } else {
    return undefined;
  }
};

const getTransactionsWhereClause = (credentialId, category, from, to) => ({
  credentialId,
  ...(category && { category: category.toLowerCase() }),
  ...((from || to) && { timestamp: getTimestampFilter(from, to) }),
});

const transactionCategories = [
  "household & services",
  "food & drinks",
  "transport",
  "recreation",
  "health",
  "other",
];

module.exports = {
  generateHash,
  roundToTwoDecimals,
  getTransactionsWhereClause,
  transactionCategories,
};
