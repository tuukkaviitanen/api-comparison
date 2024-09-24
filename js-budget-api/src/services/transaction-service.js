const { Transaction } = require("../models");

const mapTransaction = (transaction) => {
  return {
    category: transaction.category,
    description: transaction.description,
    value: transaction.value,
    timestamp: transaction.timestamp,
  };
};

const getTransactions = async (credentialId) => {
  const transactions = await Transaction.findAll({
    where: {
      credentialId,
    },
  });
  return transactions.map(mapTransaction);
};

module.exports = { getTransactions };
