import { expect } from "https://jslib.k6.io/k6chaijs/4.3.4.3/index.js";
import { randomString } from "https://jslib.k6.io/k6-utils/1.4.0/index.js";
import {
  deleteCredentials,
  getOpenAPI,
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
  const response = getOpenAPI();

  expect(response.status, "response status").to.equal(200);
};
