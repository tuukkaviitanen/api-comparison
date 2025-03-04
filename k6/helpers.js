import http from "k6/http";
import encoding from "k6/encoding";
import { URL } from "https://jslib.k6.io/url/1.0.0/index.js";

const BASE_URL = __ENV.BASE_URL;

if (!BASE_URL) {
  exec.test.abort("BASE_URL not provided");
}

const getBasicAuthHeader = (username, password) => {
  const credentials = `${username}:${password}`;
  const encodedCredentials = encoding.b64encode(credentials);
  const basicAuthHeader = `basic ${encodedCredentials}`;
  return basicAuthHeader;
};

export const postCredentials = (username, password) => {
  const requestBody = JSON.stringify({
    username,
    password,
  });

  const params = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  return http.post(`${BASE_URL}/credentials`, requestBody, params);
};

export const deleteCredentials = (
  username,
  password,
  optionalParams = undefined
) => {
  const params = optionalParams ?? {
    headers: {
      Authorization: getBasicAuthHeader(username, password),
    },
  };

  return http.del(`${BASE_URL}/credentials`, undefined, params);
};

export const getTransactionParams = (username, password) => {
  const params = {
    headers: {
      "Content-Type": "application/json",
      Authorization: getBasicAuthHeader(username, password),
    },
  };
  return params;
};

export const postTransaction = (
  category,
  description,
  value,
  timestamp,
  params
) => {
  const payload = JSON.stringify({
    category,
    description,
    value,
    timestamp,
  });

  return http.post(`${BASE_URL}/transactions`, payload, params);
};

export const putTransaction = (
  transactionId,
  category,
  description,
  value,
  timestamp,
  params
) => {
  const payload = JSON.stringify({
    category,
    description,
    value,
    timestamp,
  });

  return http.put(`${BASE_URL}/transactions/${transactionId}`, payload, params);
};

export const getSingleTransaction = (transactionId, params) => {
  return http.get(`${BASE_URL}/transactions/${transactionId}`, params);
};

export const getTransactions = (
  category = "",
  from = "",
  to = "",
  sort = "",
  order = "",
  limit = "",
  skip = "",
  params
) => {
  const url = new URL(`${BASE_URL}/transactions`);

  if (category) {
    url.searchParams.append("category", category);
  }
  if (from) {
    url.searchParams.append("from", from);
  }
  if (to) {
    url.searchParams.append("to", to);
  }
  if (sort) {
    url.searchParams.append("sort", sort);
  }
  if (order) {
    url.searchParams.append("order", order);
  }
  if (limit) {
    url.searchParams.append("limit", limit);
  }
  if (skip) {
    url.searchParams.append("skip", skip);
  }

  return http.get(url.toString(), params);
};

export const deleteTransaction = (transactionId, params) => {
  return http.del(
    `${BASE_URL}/transactions/${transactionId}`,
    undefined,
    params
  );
};

export const getReport = (category = "", from = "", to = "", params) => {
  const url = new URL(`${BASE_URL}/reports`);

  if (category) {
    url.searchParams.append("category", category);
  }
  if (from) {
    url.searchParams.append("from", from);
  }
  if (to) {
    url.searchParams.append("to", to);
  }

  return http.get(url.toString(), params);
};

export const getOpenAPI = () => http.get(`${BASE_URL}/openapi.yaml`);

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

export const loadTestOptions = {
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
