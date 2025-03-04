import { expect } from "https://jslib.k6.io/k6chaijs/4.3.4.3/index.js";
import {
  getReport,
  getTransactionParams,
  handleSummary,
  loadTestOptions as options,
  postCredentials,
  postTransaction,
} from "./helpers.js";

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

export { handleSummary, options };

export default () => {
  const reportResponse = getReport(
    undefined,
    undefined,
    undefined,
    transactionParams
  );

  expect(reportResponse.status, "GET report response status").to.equal(200);
};
