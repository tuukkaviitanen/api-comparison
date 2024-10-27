import http from "k6/http";
import {
  describe,
  expect,
} from "https://jslib.k6.io/k6chaijs/4.3.4.3/index.js";
import {
  randomString,
  uuidv4,
} from "https://jslib.k6.io/k6-utils/1.4.0/index.js";

import {
  deleteCredentials,
  deleteTransaction,
  getReport,
  getSingleTransaction,
  getTransactionParams,
  getTransactions,
  postCredentials,
  postTransaction,
  putTransaction,
  getOpenAPI,
} from "./helpers.js";

export const options = {
  vus: 5,
  iterations: 5,
  thresholds: {
    checks: ["rate==1"], // Ensure all checks pass
  },
};

export const assertValidErrorBody = (response) => {
  expect(response).to.have.validJsonBody();
  const jsonBody = response.json();
  expect(jsonBody, "response body").to.have.property("error");
  expect(jsonBody.error, "error property").to.be.a("string");
};

/**
 * Runs authentication tests for the given request
 * @param {(requestParams: ReturnType<typeof getTransactionParams>) => http.RefinedResponse<http.ResponseType | undefined>} requestFactory A function that runs the request when called. Takes the request params object as params
 */
const runAuthenticationTests = (requestFactory) => {
  describe("should throw authentication error on", () => {
    describe("invalid credentials", () => {
      const newUsername = randomString(10);
      const newPassword = randomString(10);
      const newRequestParams = getTransactionParams(newUsername, newPassword);

      const response = requestFactory(newRequestParams);

      expect(response.status, "response status").to.equal(401);
      assertValidErrorBody(response);
    });

    describe("invalid authentication header", () => {
      const newRequestParams = {
        headers: {
          "Content-Type": "application/json",
          Authorization: "invalid",
        },
      };

      const response = requestFactory(newRequestParams);

      expect(response.status, "response status").to.equal(401);
      assertValidErrorBody(response);
    });

    describe("missing authentication header", () => {
      const newRequestParams = {
        headers: {
          "Content-Type": "application/json",
        },
      };

      const response = requestFactory(newRequestParams);

      expect(response.status, "response status").to.equal(401);
      assertValidErrorBody(response);
    });
  });
};

export default () => {
  describe("Budget API", () => {
    describe("Credentials endpoint", () => {
      const username = randomString(10);
      const password = randomString(10);

      describe("POST", () => {
        describe("should create credentials successfully", () => {
          const response = postCredentials(username, password);
          expect(response.status, "response status").to.equal(204);
          expect(response.body, "response status").to.be.null;
        });

        describe("should not create duplicate usernames", () => {
          const newPassword = randomString(10);
          const response = postCredentials(username, newPassword);
          expect(response.status, "response status").to.equal(400);
          assertValidErrorBody(response);
        });

        describe("should throw validation error on", () => {
          const validationErrorTestCases = [
            ["too short username", { username: randomString(3), password }],
            ["too long username", { username: randomString(51), password }],
            ["null username", { username: null, password }],
            ["too short password", { username, password: randomString(7) }],
            ["too long password", { username, password: randomString(51) }],
            ["null password", { username: null, password }],
          ];
          for (const errorTestCase of validationErrorTestCases) {
            const [name, parameters] = errorTestCase;

            describe(name, () => {
              const response = postCredentials(
                parameters.username,
                parameters.password
              );

              expect(response.status, "response status").to.equal(400);
              assertValidErrorBody(response);
            });
          }
        });
      });

      describe("DELETE", () => {
        describe("should remove credentials successfully", () => {
          const response = deleteCredentials(username, password);
          expect(response.status, "response status").to.equal(204);
          expect(response.body, "response status").to.be.null;
        });

        runAuthenticationTests((requestParams) =>
          deleteCredentials(username, password, requestParams)
        );
      });
    });

    describe("Transactions endpoint", () => {
      const username = randomString(10);
      const password = randomString(10);

      postCredentials(username, password);

      const requestParams = getTransactionParams(username, password);

      const category = "health";
      const description = "Doctor's appointment";
      const value = -99.99;
      const timestamp = "2024-01-01T00:00:00.000Z";

      const minLengthDescription = randomString(4);
      const maxLengthDescription = randomString(200);

      const transactionTestCases = [
        [
          "default transaction",
          { category, description, value, timestamp },
          { category, description, value, timestamp },
        ],

        [
          "transaction with category: Household & Services",
          { category: "Household & Services", description, value, timestamp },
          { category: "household & services", description, value, timestamp },
        ],
        [
          "transaction with category: Food & Drinks",
          { category: "Food & Drinks", description, value, timestamp },
          { category: "food & drinks", description, value, timestamp },
        ],
        [
          "transaction with category: Transport",
          { category: "Transport", description, value, timestamp },
          { category: "transport", description, value, timestamp },
        ],
        [
          "transaction with category: Recreation",
          { category: "Recreation", description, value, timestamp },
          { category: "recreation", description, value, timestamp },
        ],
        [
          "transaction with category: Health",
          { category: "Health", description, value, timestamp },
          { category: "health", description, value, timestamp },
        ],
        [
          "transaction with category: Other",
          { category: "Other", description, value, timestamp },
          { category: "other", description, value, timestamp },
        ],

        [
          "transaction with minimum length description",
          { category, description: minLengthDescription, value, timestamp },
          { category, description: minLengthDescription, value, timestamp },
        ],
        [
          "transaction with maximum length description",
          { category, description: maxLengthDescription, value, timestamp },
          { category, description: maxLengthDescription, value, timestamp },
        ],

        [
          "transaction with minimum value",
          { category, description, value: -1000000000, timestamp },
          { category, description, value: -1000000000, timestamp },
        ],
        [
          "transaction with maximum value",
          { category, description, value: 1000000000, timestamp },
          { category, description, value: 1000000000, timestamp },
        ],
        [
          "transaction with zero decimals",
          { category, description, value: 10, timestamp },
          { category, description, value: 10, timestamp },
        ],
        [
          "transaction with one decimals",
          { category, description, value: 10.0, timestamp },
          { category, description, value: 10.0, timestamp },
        ],
        [
          "transaction with two decimals",
          { category, description, value: 10.0, timestamp },
          { category, description, value: 10.0, timestamp },
        ],
        [
          "transaction with timestamp without sub-seconds",
          { category, description, value, timestamp: "2024-01-01T00:00:00Z" },
          {
            category,
            description,
            value,
            timestamp: "2024-01-01T00:00:00.000Z",
          },
        ],
        [
          "transaction with timestamp with different timezone",
          {
            category,
            description,
            value,
            timestamp: "2024-01-01T00:00:00.000+05:00",
          },
          {
            category,
            description,
            value,
            timestamp: "2023-12-31T19:00:00.000Z",
          },
        ],
      ];

      const validationErrorTestCases = [
        [
          "invalid category",
          { category: "invalid category", description, value, timestamp },
        ],
        ["null category", { category: null, description, value, timestamp }],

        [
          "too short description",
          { category, description: randomString(3), value, timestamp },
        ],
        [
          "too long description",
          { category, description: randomString(201), value, timestamp },
        ],
        ["null description", { category, description: null, value, timestamp }],

        [
          "too small value",
          { category, description, value: -1000000001, timestamp },
        ],
        [
          "too big value",
          { category, description, value: 1000000001, timestamp },
        ],
        [
          "too many decimals in value",
          { category, description, value: 0.001, timestamp },
        ],
        ["null value", { category, description, value: null, timestamp }],

        [
          "invalid timestamp",
          { category, description, value, timestamp: "invalid timestamp" },
        ],
        ["null timestamp", { category, description, value, timestamp: null }],
      ];

      describe("POST", () => {
        describe("should create transaction successfully when", () => {
          for (const testCase of transactionTestCases) {
            const [name, parameters, expectedBody] = testCase;

            describe(name, () => {
              const response = postTransaction(
                parameters.category,
                parameters.description,
                parameters.value,
                parameters.timestamp,
                requestParams
              );

              expect(response.status, "response status").to.equal(201);
              expect(response).to.have.validJsonBody();

              const jsonBody = response.json();
              expect(jsonBody.id, "id").to.be.a("string");
              expect(jsonBody.category, "category").to.equal(
                expectedBody.category
              );
              expect(jsonBody.description, "description").to.equal(
                expectedBody.description
              );
              expect(jsonBody.value, "value").to.equal(expectedBody.value);
              expect(jsonBody.timestamp, "timestamp").to.equal(
                expectedBody.timestamp
              );
            });
          }
        });

        describe("should throw validation error on", () => {
          for (const errorTestCase of validationErrorTestCases) {
            const [name, parameters] = errorTestCase;

            describe(name, () => {
              const response = postTransaction(
                parameters.category,
                parameters.description,
                parameters.value,
                parameters.timestamp,
                requestParams
              );

              expect(response.status, "response status").to.equal(400);
              assertValidErrorBody(response);
            });
          }
        });

        runAuthenticationTests((requestParams) =>
          postTransaction(
            category,
            description,
            value,
            timestamp,
            requestParams
          )
        );
      });

      describe("GET", () => {
        describe("single", () => {
          const postResponse = postTransaction(
            category,
            description,
            value,
            timestamp,
            requestParams
          );
          const transactionId = postResponse.json().id;

          describe("should return transaction successfully", () => {
            const response = getSingleTransaction(transactionId, requestParams);

            expect(response.status, "response status").to.equal(200);
            expect(response).to.have.validJsonBody();

            const jsonBody = response.json();
            expect(jsonBody.id, "id").to.be.a("string");
            expect(jsonBody.category, "category").to.equal(category);
            expect(jsonBody.description, "description").to.equal(description);
            expect(jsonBody.value, "value").to.equal(value);
            expect(jsonBody.timestamp, "timestamp").to.equal(
              "2024-01-01T00:00:00.000Z"
            );
          });

          describe("should return authentication error when invalid uuid", () => {
            const invalidTransactionId = randomString(10);
            const response = getSingleTransaction(
              invalidTransactionId,
              requestParams
            );

            expect(response.status, "response status").to.equal(400);
            assertValidErrorBody(response);
          });

          describe("should return 404 error when transaction does not exist", () => {
            const nonExistentTransactionId = uuidv4();
            const response = getSingleTransaction(
              nonExistentTransactionId,
              requestParams
            );

            expect(response.status, "response status").to.equal(404);
            assertValidErrorBody(response);
          });

          runAuthenticationTests((requestParams) =>
            getSingleTransaction(transactionId, requestParams)
          );
        });

        describe("many", () => {
          const transactions = [
            {
              category: "health",
              description: "Doctor's appointment",
              value: -50,
              timestamp: "2024-01-01T00:00:00.000Z",
            },
            {
              category: "recreation",
              description: "Hotel for one night",
              value: -120,
              timestamp: "2023-01-01T00:00:00.000Z",
            },
            {
              category: "food & drinks",
              description: "Restaurant",
              value: -50,
              timestamp: "2022-01-01T00:00:00.000Z",
            },
            {
              category: "transport",
              description: "Taxi",
              value: -50,
              timestamp: "2021-01-01T00:00:00.000Z",
            },
            {
              category: "household & services",
              description: "work income",
              value: 2000,
              timestamp: "2020-01-01T00:00:00.000Z",
            },
          ];

          const username = randomString(10);
          const password = randomString(10);
          postCredentials(username, password);

          const requestParams = getTransactionParams(username, password);

          for (const transaction of transactions) {
            const response = postTransaction(
              transaction.category,
              transaction.description,
              transaction.value,
              transaction.timestamp,
              requestParams
            );
            expect(response.status, "response status").to.equal(201);

            transaction.id = response.json().id;
          }

          describe("should fetch correct transactions when", () => {
            const testCases = [
              [
                "fetching all",
                {
                  category: undefined,
                  from: undefined,
                  to: undefined,
                  sort: undefined,
                  order: undefined,
                  limit: undefined,
                  skip: undefined,
                },
                transactions,
              ],
              [
                "filtering by category: Household & Services",
                {
                  category: "Household & Services",
                  from: undefined,
                  to: undefined,
                  sort: undefined,
                  order: undefined,
                  limit: undefined,
                  skip: undefined,
                },
                [transactions[4]],
              ],
              [
                "filtering by category: Food & Drinks",
                {
                  category: "Food & Drinks",
                  from: undefined,
                  to: undefined,
                  sort: undefined,
                  order: undefined,
                  limit: undefined,
                  skip: undefined,
                },
                [transactions[2]],
              ],
              [
                "filtering by category: Transport",
                {
                  category: "Transport",
                  from: undefined,
                  to: undefined,
                  sort: undefined,
                  order: undefined,
                  limit: undefined,
                  skip: undefined,
                },
                [transactions[3]],
              ],
              [
                "filtering by category: Recreation",
                {
                  category: "Recreation",
                  from: undefined,
                  to: undefined,
                  sort: undefined,
                  order: undefined,
                  limit: undefined,
                  skip: undefined,
                },
                [transactions[1]],
              ],
              [
                "filtering by category: Health",
                {
                  category: "Health",
                  from: undefined,
                  to: undefined,
                  sort: undefined,
                  order: undefined,
                  limit: undefined,
                  skip: undefined,
                },
                [transactions[0]],
              ],
              [
                "filtering by category: Other",
                {
                  category: "Other",
                  from: undefined,
                  to: undefined,
                  sort: undefined,
                  order: undefined,
                  limit: undefined,
                  skip: undefined,
                },
                [],
              ],
              [
                "filtering starting from specific timestamp",
                {
                  category: undefined,
                  from: "2022-02-01T00:00:00Z",
                  to: undefined,
                  sort: undefined,
                  order: undefined,
                  limit: undefined,
                  skip: undefined,
                },
                [transactions[0], transactions[1]],
              ],
              [
                "filtering until specific timestamp",
                {
                  category: undefined,
                  from: undefined,
                  to: "2022-02-01T00:00:00Z",
                  sort: undefined,
                  order: undefined,
                  limit: undefined,
                  skip: undefined,
                },
                [transactions[2], transactions[3], transactions[4]],
              ],
              [
                "sorting by category in ascending order",
                {
                  category: undefined,
                  from: undefined,
                  to: undefined,
                  sort: "category",
                  order: "ASC",
                  limit: undefined,
                  skip: undefined,
                },
                [
                  transactions[2],
                  transactions[0],
                  transactions[4],
                  transactions[1],
                  transactions[3],
                ],
              ],
              [
                "limiting to 2",
                {
                  category: undefined,
                  from: undefined,
                  to: undefined,
                  sort: undefined,
                  order: undefined,
                  limit: 2,
                  skip: undefined,
                },
                [transactions[0], transactions[1]],
              ],
              [
                "skipping by 1",
                {
                  category: undefined,
                  from: undefined,
                  to: undefined,
                  sort: undefined,
                  order: undefined,
                  limit: undefined,
                  skip: 1,
                },
                [
                  transactions[1],
                  transactions[2],
                  transactions[3],
                  transactions[4],
                ],
              ],
              [
                "combining params",
                {
                  category: undefined,
                  from: "2021-01-01T00:00:00Z",
                  to: "2023-01-01T00:00:00Z",
                  sort: "category",
                  order: "ASC",
                  limit: 1,
                  skip: 1,
                },
                [transactions[1]],
              ],
            ];

            for (const testCase of testCases) {
              const [name, parameters, expectedBody] = testCase;

              describe(name, () => {
                const response = getTransactions(
                  parameters.category,
                  parameters.from,
                  parameters.to,
                  parameters.sort,
                  parameters.order,
                  parameters.limit,
                  parameters.skip,
                  requestParams
                );
                expect(response.status, "response status").to.equal(200);
                expect(response).to.have.validJsonBody();

                const jsonBody = response.json();

                expect(jsonBody, "response body").to.have.lengthOf(
                  expectedBody.length
                );
                expect(jsonBody, "response body is as expected").to.deep.equal(
                  expectedBody
                );
              });
            }
          });

          describe("should return validation error when", () => {
            const testCases = [
              [
                "filtering by invalid category",
                {
                  category: "recreational",
                  from: undefined,
                  to: undefined,
                  sort: undefined,
                  order: undefined,
                  limit: undefined,
                  skip: undefined,
                },
              ],
              [
                "filtering by invalid from timestamp",
                {
                  category: undefined,
                  from: "invalid",
                  to: undefined,
                  sort: undefined,
                  order: undefined,
                  limit: undefined,
                  skip: undefined,
                },
              ],
              [
                "filtering by invalid to timestamp",
                {
                  category: undefined,
                  from: undefined,
                  to: "invalid",
                  sort: undefined,
                  order: undefined,
                  limit: undefined,
                  skip: undefined,
                },
              ],
              [
                "sorting by invalid field",
                {
                  category: undefined,
                  from: undefined,
                  to: undefined,
                  sort: "invalid",
                  order: undefined,
                  limit: undefined,
                  skip: undefined,
                },
              ],
              [
                "sorting by invalid order",
                {
                  category: undefined,
                  from: undefined,
                  to: undefined,
                  sort: undefined,
                  order: "invalid",
                  limit: undefined,
                  skip: undefined,
                },
              ],
              [
                "limiting by invalid number",
                {
                  category: undefined,
                  from: undefined,
                  to: undefined,
                  sort: undefined,
                  order: undefined,
                  limit: -2,
                  skip: undefined,
                },
              ],
              [
                "skipping by invalid number",
                {
                  category: undefined,
                  from: undefined,
                  to: undefined,
                  sort: undefined,
                  order: undefined,
                  limit: undefined,
                  skip: -1,
                },
              ],
            ];

            for (const testCase of testCases) {
              const [name, parameters] = testCase;

              describe(name, () => {
                const response = getTransactions(
                  parameters.category,
                  parameters.from,
                  parameters.to,
                  parameters.sort,
                  parameters.order,
                  parameters.limit,
                  parameters.skip,
                  requestParams
                );
                expect(response.status, "response status").to.equal(400);
                assertValidErrorBody(response);
              });
            }
          });

          runAuthenticationTests((requestParams) =>
            getTransactions(
              undefined,
              undefined,
              undefined,
              undefined,
              undefined,
              undefined,
              undefined,
              requestParams
            )
          );
        });
      });

      describe("PUT", () => {
        const postResponse = postTransaction(
          category,
          description,
          value,
          timestamp,
          requestParams
        );
        const transactionId = postResponse.json().id;

        describe("should update transaction successfully when", () => {
          for (const testCase of transactionTestCases) {
            const [name, parameters, expectedBody] = testCase;

            describe(name, () => {
              const response = putTransaction(
                transactionId,
                parameters.category,
                parameters.description,
                parameters.value,
                parameters.timestamp,
                requestParams
              );

              expect(response.status, "response status").to.equal(200);
              expect(response).to.have.validJsonBody();

              const jsonBody = response.json();
              expect(jsonBody.id, "id").to.equal(transactionId);
              expect(jsonBody.category, "category").to.equal(
                expectedBody.category
              );
              expect(jsonBody.description, "description").to.equal(
                expectedBody.description
              );
              expect(jsonBody.value, "value").to.equal(expectedBody.value);
              expect(jsonBody.timestamp, "timestamp").to.equal(
                expectedBody.timestamp
              );
            });
          }
        });

        describe("should return 400 when invlid uuid", () => {
          const invalidTransactionId = randomString(10);
          const response = putTransaction(
            invalidTransactionId,
            category,
            description,
            value,
            timestamp,
            requestParams
          );

          expect(response.status, "response status").to.equal(400);
          assertValidErrorBody(response);
        });

        describe("should return 404 when non-existent transaction id", () => {
          const nonExistentTransactionId = uuidv4();
          const response = putTransaction(
            nonExistentTransactionId,
            category,
            description,
            value,
            timestamp,
            requestParams
          );

          expect(response.status, "response status").to.equal(404);
          assertValidErrorBody(response);
        });

        describe("should throw validation error on", () => {
          for (const errorTestCase of validationErrorTestCases) {
            const [name, parameters] = errorTestCase;

            describe(name, () => {
              const response = putTransaction(
                transactionId,
                parameters.category,
                parameters.description,
                parameters.value,
                parameters.timestamp,
                requestParams
              );

              expect(response.status, "response status").to.equal(400);
              assertValidErrorBody(response);
            });
          }
        });

        runAuthenticationTests((requestParams) =>
          putTransaction(
            transactionId,
            category,
            description,
            value,
            timestamp,
            requestParams
          )
        );
      });

      describe("DELETE", () => {
        const postResponse = postTransaction(
          category,
          description,
          value,
          timestamp,
          requestParams
        );
        const transactionId = postResponse.json().id;

        describe("should successfully delete transaction", () => {
          const response = deleteTransaction(transactionId, requestParams);

          expect(response.status, "response status").to.equal(204);
          expect(response.body, "response status").to.be.null;
        });

        describe("should return 400 when invlid uuid", () => {
          const invalidTransactionId = randomString(10);
          const response = deleteTransaction(
            invalidTransactionId,
            requestParams
          );

          expect(response.status, "response status").to.equal(400);
          assertValidErrorBody(response);
        });

        describe("should return 404 when transaction does not exist", () => {
          const nonExistentTransactionId = uuidv4();
          const response = deleteTransaction(
            nonExistentTransactionId,
            requestParams
          );

          expect(response.status, "response status").to.equal(404);
          assertValidErrorBody(response);
        });
      });
    });

    describe("Reports endpoint", () => {
      describe("GET", () => {
        const transactions = [
          {
            category: "health",
            description: "Doctor's appointment",
            value: -50,
            timestamp: "2024-01-01T00:00:00.000Z",
          },
          {
            category: "health",
            description: "Doctor's appointment",
            value: -50,
            timestamp: "2024-06-01T00:00:00.000Z",
          },
          {
            category: "health",
            description: "Doctor's appointment",
            value: -50,
            timestamp: "2023-01-01T00:00:00.000Z",
          },
          {
            category: "recreation",
            description: "Hotel for one night",
            value: -120,
            timestamp: "2023-01-01T00:00:00.000Z",
          },
          {
            category: "food & drinks",
            description: "Restaurant",
            value: -50,
            timestamp: "2022-01-01T00:00:00.000Z",
          },
          {
            category: "transport",
            description: "Taxi",
            value: -50,
            timestamp: "2021-01-01T00:00:00.000Z",
          },
          {
            category: "household & services",
            description: "Work income",
            value: 1000,
            timestamp: "2022-01-01T00:00:00.000Z",
          },
          {
            category: "household & services",
            description: "Work income",
            value: 1000,
            timestamp: "2020-01-01T00:00:00.000Z",
          },
        ];

        const username = randomString(10);
        const password = randomString(10);
        postCredentials(username, password);

        const requestParams = getTransactionParams(username, password);

        for (const transaction of transactions) {
          const response = postTransaction(
            transaction.category,
            transaction.description,
            transaction.value,
            transaction.timestamp,
            requestParams
          );
          expect(response.status, "response status").to.equal(201);

          transaction.id = response.json().id;
        }

        describe("should generate proper report when", () => {
          const testCases = [
            [
              "fetching all",
              { category: undefined, from: undefined, to: undefined },
              {
                transactions_sum: 1630,
                expenses_sum: -370,
                incomes_sum: 2000,
                transactions_count: 8,
                expenses_count: 6,
                incomes_count: 2,
              },
            ],
            [
              "filtering by Household & Services category",
              {
                category: "Household & Services",
                from: undefined,
                to: undefined,
              },
              {
                transactions_sum: 2000,
                expenses_sum: 0,
                incomes_sum: 2000,
                transactions_count: 2,
                expenses_count: 0,
                incomes_count: 2,
              },
            ],
            [
              "filtering by Food & Drinks category",
              { category: "Food & Drinks", from: undefined, to: undefined },
              {
                transactions_sum: -50,
                expenses_sum: -50,
                incomes_sum: 0,
                transactions_count: 1,
                expenses_count: 1,
                incomes_count: 0,
              },
            ],
            [
              "filtering by Transport category",
              { category: "Transport", from: undefined, to: undefined },
              {
                transactions_sum: -50,
                expenses_sum: -50,
                incomes_sum: 0,
                transactions_count: 1,
                expenses_count: 1,
                incomes_count: 0,
              },
            ],
            [
              "filtering by Recreation category",
              { category: "Recreation", from: undefined, to: undefined },
              {
                transactions_sum: -120,
                expenses_sum: -120,
                incomes_sum: 0,
                transactions_count: 1,
                expenses_count: 1,
                incomes_count: 0,
              },
            ],
            [
              "filtering by Health category",
              { category: "Health", from: undefined, to: undefined },
              {
                transactions_sum: -150,
                expenses_sum: -150,
                incomes_sum: 0,
                transactions_count: 3,
                expenses_count: 3,
                incomes_count: 0,
              },
            ],
            [
              "filtering by Other",
              { category: "Other", from: undefined, to: undefined },
              {
                transactions_sum: 0,
                expenses_sum: 0,
                incomes_sum: 0,
                transactions_count: 0,
                expenses_count: 0,
                incomes_count: 0,
              },
            ],
            [
              "filtering starting from specific timestamp",
              {
                category: undefined,
                from: "2022-01-01T00:00:00Z",
                to: undefined,
              },
              {
                transactions_sum: 680,
                expenses_sum: -320,
                incomes_sum: 1000,
                transactions_count: 6,
                expenses_count: 5,
                incomes_count: 1,
              },
            ],
            [
              "filtering until specific timestamp",
              {
                category: undefined,
                from: undefined,
                to: "2022-01-01T00:00:00Z",
              },
              {
                transactions_sum: 1900,
                expenses_sum: -100,
                incomes_sum: 2000,
                transactions_count: 4,
                expenses_count: 2,
                incomes_count: 2,
              },
            ],
            [
              "combining params",
              {
                category: "health",
                from: "2023-09-01T00:00:00Z",
                to: "2024-03-01T00:00:00Z",
              },
              {
                transactions_sum: -50,
                expenses_sum: -50,
                incomes_sum: 0,
                transactions_count: 1,
                expenses_count: 1,
                incomes_count: 0,
              },
            ],
          ];

          for (const testCase of testCases) {
            const [name, parameters, expectedBody] = testCase;

            describe(name, () => {
              const response = getReport(
                parameters.category,
                parameters.from,
                parameters.to,
                requestParams
              );
              expect(response.status, "response status").to.equal(200);
              expect(response).to.have.validJsonBody();

              const jsonBody = response.json();

              expect(jsonBody, "response body is as expected").to.deep.equal(
                expectedBody
              );
            });
          }
        });

        describe("should return validation error when", () => {
          const testCases = [
            [
              "filtering by invalid category",
              { category: "recreational", from: undefined, to: undefined },
            ],
            [
              "filtering by invalid from timestamp",
              { category: undefined, from: "invalid", to: undefined },
            ],
            [
              "filtering by invalid to timestamp",
              { category: undefined, from: undefined, to: "invalid" },
            ],
          ];

          for (const testCase of testCases) {
            const [name, parameters] = testCase;

            describe(name, () => {
              const response = getTransactions(
                parameters.category,
                parameters.from,
                parameters.to,
                parameters.sort,
                parameters.order,
                parameters.limit,
                parameters.skip,
                requestParams
              );
              expect(response.status, "response status").to.equal(400);
              assertValidErrorBody(response);
            });
          }
        });

        runAuthenticationTests((requestParams) =>
          getReport(undefined, undefined, undefined, requestParams)
        );
      });
    });

    describe("OpenAPI document", () => {
      describe("should be served successfully", () => {
        const response = getOpenAPI();

        expect(response.status, "response status").to.equal(200);
        expect(response.headers["Content-Type"], "content type").to.include(
          "yaml"
        );
      });
    });
  });
};
