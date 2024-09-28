const { Transaction } = require("../models");
const { generateReport } = require("./report-service");

jest.mock("../models", () => ({
  Transaction: { findAll: jest.fn() },
}));

describe("generateReport", () => {
  // Using 'let' just to initialize multiple variables at the same time. 'const' doesn't allow that
  let dummyCredentialId,
    dummyCategory,
    dummyFrom,
    dummyTo = "dummy";

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
      Transaction.findAll.mockResolvedValueOnce(fakeTransactions);

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
    const error = new Error("This is an error");
    Transaction.findAll.mockRejectedValueOnce(error);

    const operation = async () =>
      await generateReport(
        dummyCredentialId,
        dummyCategory,
        dummyFrom,
        dummyTo,
      );

    expect(operation).rejects.toThrow(error);
  });
});
