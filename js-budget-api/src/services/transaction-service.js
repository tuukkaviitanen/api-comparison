const { Transaction } = require("../models");

const mapTransaction = (transaction) => {
  if (!transaction) {
    return null;
  }

  return {
    id: transaction.id,
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

const getTransaction = async (transactionId) => {
  const transaction = await Transaction.findOne({
    where: {
      id: transactionId,
    },
  });

  return mapTransaction(transaction);
};

const createTransaction = async ({
  category,
  description,
  value,
  timestamp,
  credentialId,
}) => {
  const createdTransaction = await Transaction.create({
    category: category.toLowerCase(),
    description: description.toLowerCase(),
    value,
    timestamp,
    credentialId,
  });

  return mapTransaction(createdTransaction);
};

const updateTransaction = async (
  transactionId,
  { category, description, value, timestamp },
) => {
  const foundTransaction = await Transaction.findOne({
    where: { id: transactionId },
  });

  if (!foundTransaction) {
    return null;
  }

  await foundTransaction.update({
    category: category.toLowerCase(),
    description: description.toLowerCase(),
    value,
    timestamp,
  });

  return mapTransaction(foundTransaction);
};

const deleteTransaction = async (transactionId) => {
  const deleteCount = await Transaction.destroy({
    where: { id: transactionId },
  });

  const isDeleteSuccessful = deleteCount > 0;

  return isDeleteSuccessful;
};

module.exports = {
  getTransactions,
  createTransaction,
  getTransaction,
  updateTransaction,
  deleteTransaction,
};
