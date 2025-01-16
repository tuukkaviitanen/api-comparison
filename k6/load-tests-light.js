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
  const username = randomString(10);
  const password = randomString(10);

  // POST Credential
  const postCredentialsResponse = postCredentials(username, password);

  expect(
    postCredentialsResponse.status,
    "POST credential response status"
  ).to.equal(204);

  const transactionParams = getTransactionParams(username, password);

  // POST Transaction
  const postResponse = postTransaction(
    "Food & Drinks",
    "Pizza at Frank's",
    -10.99,
    "2024-01-01T18:00:00Z",
    transactionParams
  );

  expect(postResponse.status, "POST transaction response status").to.equal(201);

  // GET Transactions
  const getResponse = getTransactions(
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    transactionParams
  );

  expect(getResponse.status, "GET transactions response status").to.equal(200);

  // DELETE the credential
  const deleteCredentialResponse = deleteCredentials(username, password);

  expect(
    deleteCredentialResponse.status,
    "DELETE credential response status"
  ).to.equal(204);
};
