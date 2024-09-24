const { Transaction } = require("../models");
const { Op } = require("sequelize");
const { roundToTwoDecimals } = require("../utils/helpers");

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

const initialReport = {
  transactions_sum: 0,
  expenses_sum: 0,
  incomes_sum: 0,
  transactions_count: 0,
  expenses_count: 0,
  incomes_count: 0,
};

const mapReport = (transactions) =>
  transactions.reduce((report, transaction) => {
    const value = Number(transaction.value);
    const isExpense = value < 0;
    const isIncome = value > 0;

    return {
      transactions_sum: roundToTwoDecimals(report.transactions_sum + value),
      expenses_sum: isExpense
        ? roundToTwoDecimals(report.expenses_sum + value)
        : report.expenses_sum,
      incomes_sum: isIncome
        ? roundToTwoDecimals(report.incomes_sum + value)
        : report.incomes_sum,
      transactions_count: report.transactions_count + 1,
      expenses_count: isExpense
        ? report.expenses_count + 1
        : report.expenses_count,
      incomes_count: isIncome ? report.incomes_count + 1 : report.incomes_count,
    };
  }, initialReport);

const generateReport = async (credentialId, category, from, to) => {
  const where = {
    credentialId,
    ...(category && { category: category.toLowerCase() }),
    ...((from || to) && { timestamp: getTimestampFilter(from, to) }),
  };
  const transactions = await Transaction.findAll({
    where,
  });

  return mapReport(transactions);
};

module.exports = { generateReport };
