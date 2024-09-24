const { Transaction } = require("../models");
const { getTransactionsWhereClause } = require("../utils/helpers");

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

const getTransactions = async (
  credentialId,
  category,
  from,
  to,
  sort,
  order,
  limit,
  skip,
) => {
  const where = getTransactionsWhereClause(credentialId, category, from, to);

  const transactions = await Transaction.findAll({
    where,
    order: [[sort, order]],
    limit,
    offset: skip,
  });

  return transactions.map(mapTransaction);
};

const getTransaction = async (transactionId, credentialId) => {
  const transaction = await Transaction.findOne({
    where: {
      id: transactionId,
      credentialId,
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
    category,
    description,
    value,
    timestamp,
    credentialId,
  });

  return mapTransaction(createdTransaction);
};

const updateTransaction = async (
  transactionId,
  credentialId,
  { category, description, value, timestamp },
) => {
  const foundTransaction = await Transaction.findOne({
    where: { id: transactionId, credentialId },
  });

  if (!foundTransaction) {
    return null;
  }

  await foundTransaction.update({
    category: category,
    description: description,
    value,
    timestamp,
  });

  return mapTransaction(foundTransaction);
};

const deleteTransaction = async (transactionId, credentialId) => {
  const deleteCount = await Transaction.destroy({
    where: { id: transactionId, credentialId },
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
