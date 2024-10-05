import { Transaction as ProcessedTransaction } from "../../prisma/client";
import prisma from "../utils/prisma";

const roundToTwoDecimals = (num: number) => Math.round(num * 100) / 100;

const initialReport = {
  transactions_sum: 0,
  expenses_sum: 0,
  incomes_sum: 0,
  transactions_count: 0,
  expenses_count: 0,
  incomes_count: 0,
};

const mapReport = (transactions: ProcessedTransaction[]) =>
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

export const generateReport = async (
  credentialId: string,
  category?: string,
  from?: Date,
  to?: Date,
) => {
  const transactions = await prisma.transaction.findMany({
    where: { credentialId, category, timestamp: { gte: from, lte: to } },
  });

  const report = mapReport(transactions);

  return report;
};
