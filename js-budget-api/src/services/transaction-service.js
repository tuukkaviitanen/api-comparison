const { Transaction } = require("../models");

const mapTransaction = (transaction) => {
  if (!transaction) {
    return null;
  }

  return {
    category: transaction.category,
    description: transaction.description,
    value: Number(transaction.value), // Sequelize returns decimal type as string
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

const createTransaction = async (transactionDetails) => {
  const createdTransaction = await Transaction.create(transactionDetails);

  return mapTransaction(createdTransaction);
};

module.exports = { getTransactions, createTransaction };
