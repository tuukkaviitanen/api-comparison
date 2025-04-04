const { Transaction } = require("../models");
const {
  roundToTwoDecimals,
  getTransactionsWhereClause,
} = require("../utils/helpers");

const initialReport = {
  transactions_sum: 0,
  expenses_sum: 0,
  incomes_sum: 0,
  transactions_count: 0,
  expenses_count: 0,
  incomes_count: 0,
};

const mapReport = (values) =>
  values.reduce((report, value) => {
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
  const where = getTransactionsWhereClause(credentialId, category, from, to);
  const transactions = await Transaction.findAll({
    where,
    attributes: ["value"],
  });

  const values = transactions.map((transaction) => Number(transaction.value));

  return mapReport(values);
};

module.exports = { generateReport };
