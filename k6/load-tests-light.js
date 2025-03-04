import { expect } from "https://jslib.k6.io/k6chaijs/4.3.4.3/index.js";
import {
  getOpenAPI,
  handleSummary,
  loadTestOptions as options,
} from "./helpers.js";

export { handleSummary, options };

export default () => {
  const response = getOpenAPI();

  expect(response.status, "response status").to.equal(200);
};
