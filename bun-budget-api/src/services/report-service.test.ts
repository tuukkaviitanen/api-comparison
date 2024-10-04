import { generateReport } from "./report-service";
import prisma from "../utils/prisma";
import { expect, test, describe, mock, jest } from "bun:test";

mock.module("../utils/prisma", () => ({
  default: {
    transaction: { findMany: mock() },
  },
}));

describe("generateReport", () => {
  const dummy = "dummy";
  const dummyDate = new Date();
  const dummyCredentialId = dummy;
  const dummyCategory = dummy;
  const dummyFrom = dummyDate;
  const dummyTo = dummyDate;

  test.each([
    [
      [50, -25, 150, -150],
      {
        transactions_sum: 25,
        expenses_sum: -175,
        incomes_sum: 200,
        transactions_count: 4,
        expenses_count: 2,
        incomes_count: 2,
      },
    ],
    [
      [0, 0, 0, 50, -50],
      {
        transactions_sum: 0,
        expenses_sum: -50,
        incomes_sum: 50,
        transactions_count: 5,
        expenses_count: 1,
        incomes_count: 1,
      },
    ],
    [
      [0.5, -5.5, 100.25],
      {
        transactions_sum: 95.25,
        expenses_sum: -5.5,
        incomes_sum: 100.75,
        transactions_count: 3,
        expenses_count: 1,
        incomes_count: 2,
      },
    ],
    [
      [],
      {
        transactions_sum: 0,
        expenses_sum: 0,
        incomes_sum: 0,
        transactions_count: 0,
        expenses_count: 0,
        incomes_count: 0,
      },
    ],
  ])(
    "should create report correctly with values: %p",
    async (transactionValues, expectedReport) => {
      const fakeTransactions = transactionValues.map((value) => ({ value }));
      (prisma.transaction.findMany as jest.Mock).mockResolvedValueOnce(
        fakeTransactions,
      );

      const response = await generateReport(
        dummyCredentialId,
        dummyCategory,
        dummyFrom,
        dummyTo,
      );

      expect(response).toEqual(expectedReport);
    },
  );

  test("should throw error on error", async () => {
    const mockError = new Error("This is an error");
    (prisma.transaction.findMany as jest.Mock).mockRejectedValueOnce(mockError);

    // This is a workaround because expect().rejects.toThrow() doesn't currently work in bun:test
    try {
      await generateReport(
        dummyCredentialId,
        dummyCategory,
        dummyFrom,
        dummyTo,
      );
      expect(true).toBe(false); // Fails if doesn't throw error
    } catch (error) {
      expect(error).toEqual(mockError);
    }
  });
});
