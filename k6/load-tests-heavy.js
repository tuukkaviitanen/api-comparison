import { expect } from "https://jslib.k6.io/k6chaijs/4.3.4.3/index.js";
import { randomString } from "https://jslib.k6.io/k6-utils/1.4.0/index.js";
import {
  deleteCredentials,
  getReport,
  getTransactionParams,
  getTransactions,
  postCredentials,
  postTransaction,
} from "./helpers.js";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";

const username = "populated-user";
const password = "password";

const transactionParams = getTransactionParams(username, password);

export const setup = () => {
  // POST credential
  const postCredentialsResponse = postCredentials(username, password);

  expect(
    postCredentialsResponse.status,
    "POST credential response status"
  ).to.equal(204);

  // Populate user with 1000 transactions
  for (let i = 0; i < 1000; i++) {
    const postResponse = postTransaction(
      "Food & Drinks",
      "Pizza at Frank's",
      -10.99,
      "2024-01-01T18:00:00Z",
      transactionParams
    );

    expect(postResponse.status, "POST transaction response status").to.equal(
      201
    );
  }
};

export const options = {
  stages: [
    { duration: "1m", target: 1 }, // Holding
    { duration: "30s", target: 5 }, // Ramping up
    { duration: "1m", target: 5 }, // Holding
    { duration: "30s", target: 10 }, // Ramping up
    { duration: "1m", target: 10 }, // Holding
    { duration: "30s", target: 100 }, // Ramping up
    { duration: "1m", target: 100 }, // Holding
    { duration: "30s", target: 0 }, // Ramping down
  ],
};

export const handleSummary = (data) => {
  const now = new Date();
  const timestamp = now.toISOString();

  const summary = textSummary(data, {
    indent: " ",
    enableColors: true,
  });

  return {
    [`/results/summary_${timestamp}.txt`]: summary,
    stdout: summary,
  };
};

export default () => {
  const reportResponse = getReport(
    undefined,
    undefined,
    undefined,
    transactionParams
  );

  expect(reportResponse.status, "GET report response status").to.equal(200);
};
