import http from 'k6/http';
import { describe, expect } from 'https://jslib.k6.io/k6chaijs/4.3.4.3/index.js';
import { randomString, uuidv4 } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';
import encoding from 'k6/encoding';
import exec from 'k6/execution';

const BASE_URL = __ENV.BASE_URL

if (!BASE_URL) {
    exec.test.abort("BASE_URL not provided")
}

export const options = {
    vus: 1,
    iterations: 1,
    thresholds: {
        checks: ['rate==1'], // Ensure all checks pass
    },
};

const getBasicAuthHeader = (username, password) => {
    const credentials = `${username}:${password}`
    const encodedCredentials = encoding.b64encode(credentials);
    const basicAuthHeader = `basic ${encodedCredentials}`
    return basicAuthHeader
}

const postCredentials = (username, password) => {
    const requestBody = JSON.stringify({
        username,
        password
    })

    const params = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    return http.post(`${BASE_URL}/credentials`, requestBody, params);
}

const deleteCredentials = (username, password, optionalParams = undefined) => {
    const params = optionalParams ?? {
        headers: {
            'Authorization': getBasicAuthHeader(username, password)
        },
    };

    return http.del(`${BASE_URL}/credentials`, undefined, params);
}

const assertValidErrorBody = (response) => {
    expect(response).to.have.validJsonBody();
    const jsonBody = response.json()
    expect(jsonBody, 'response body').to.have.property('error')
    expect(jsonBody.error, "error property").to.be.a('string')
}

const getTransactionParams = (username, password) => {
    const params = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': getBasicAuthHeader(username, password)
        },
    };
    return params;
}

const postTransaction = (category, description, value, timestamp, params) => {
    const payload = JSON.stringify({
        category,
        description,
        value,
        timestamp
    })

    return http.post(`${BASE_URL}/transactions`, payload, params)
}

const putTransaction = (transactionId, category, description, value, timestamp, params) => {
    const payload = JSON.stringify({
        category,
        description,
        value,
        timestamp
    })

    return http.put(`${BASE_URL}/transactions/${transactionId}`, payload, params)
}

const getSingleTransaction = (transactionId, params) => {
    return http.get(`${BASE_URL}/transactions/${transactionId}`, params)
}

const getTransactions = (category, from, to, sort, order, limit, skip) => {
    return http.get(`${BASE_URL}/transactions?category=${category}&from=${from}&to=${to}&sort=${sort}&order=${order}&limit=${limit}&skip=${skip}`, params)
}

const deleteTransaction = (transactionId, params) => {
    return http.del(`${BASE_URL}/transactions/${transactionId}`, undefined, params)
}

/**
 * Runs authentication tests for the given request
 * @param {(requestParams: ReturnType<typeof getTransactionParams>) => http.RefinedResponse<http.ResponseType | undefined>} requestFactory A function that runs the request when called. Takes the request params object as params
 */
const runAuthenticationTests = (requestFactory) => {
    describe('should throw authentication error on', () => {
        describe('invalid credentials', () => {
            const newUsername = randomString(10)
            const newPassword = randomString(10)
            const newRequestParams = getTransactionParams(newUsername, newPassword)

            const response = requestFactory(newRequestParams)

            expect(response.status, 'response status').to.equal(401)
            assertValidErrorBody(response)
        })

        describe('invalid authentication header', () => {
            const newRequestParams = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'invalid'
                },
            };

            const response = requestFactory(newRequestParams)

            expect(response.status, 'response status').to.equal(401)
            assertValidErrorBody(response)
        })

        describe('missing authentication header', () => {
            const newRequestParams = {
                headers: {
                    'Content-Type': 'application/json',
                },
            };

            const response = requestFactory(newRequestParams)

            expect(response.status, 'response status').to.equal(401)
            assertValidErrorBody(response)
        })
    })
}

export default function () {
    describe('Budget API', () => {
        describe('Credentials endpoint', () => {
            const username = randomString(10)
            const password = randomString(10)

            describe('POST', () => {
                describe('should create credentials successfully', () => {
                    const response = postCredentials(username, password)
                    expect(response.status, 'response status').to.equal(204);
                    expect(response.body, 'response status').to.be.null
                })

                describe('should not create duplicate usernames', () => {
                    const newPassword = randomString(10)
                    const response = postCredentials(username, newPassword)
                    expect(response.status, 'response status').to.equal(400);
                    assertValidErrorBody(response)
                })

                describe('should throw validation error on', () => {
                    const validationErrorTestCases = [
                        ["too short username", { username: randomString(3), password }],
                        ["too long username", { username: randomString(51), password }],
                        ["null username", { username: null, password }],
                        ["too short password", { username, password: randomString(7) }],
                        ["too long password", { username, password: randomString(51) }],
                        ["null password", { username: null, password }],
                    ]
                    for (const errorTestCase of validationErrorTestCases) {
                        const [name, parameters] = errorTestCase

                        describe(name, () => {
                            const response = postCredentials(parameters.username, parameters.password)

                            expect(response.status, 'response status').to.equal(400)
                            assertValidErrorBody(response)
                        })
                    }
                })
            })

            describe('DELETE', () => {
                describe('should remove credentials successfully', () => {
                    const response = deleteCredentials(username, password)
                    expect(response.status, 'response status').to.equal(204)
                    expect(response.body, 'response status').to.be.null
                })

                runAuthenticationTests((requestParams) => deleteCredentials(username, password, requestParams))
            })
        });

        describe('Transactions endpoint', () => {
            const username = randomString(10)
            const password = randomString(10)

            postCredentials(username, password)

            const requestParams = getTransactionParams(username, password)

            const category = 'health'
            const description = "Doctor's appointment"
            const value = -99.99
            const timestamp = "2024-01-01"

            const validationErrorTestCases = [
                ["invalid category", { category: "invalid category", description, value, timestamp }],
                ["null category", { category: null, description, value, timestamp }],
                ["too short description", { category, description: randomString(3), value, timestamp }],
                ["too long description", { category, description: randomString(201), value, timestamp }],
                ["null description", { category, description: null, value, timestamp }],
                ["too small value", { category, description, value: -1000000001, timestamp }],
                ["too big value", { category, description, value: 1000000001, timestamp }],
                ["too many decimals in value", { category, description, value: 0.001, timestamp }],
                ["null value", { category, description, value: null, timestamp }],
                ["invalid timestamp", { category, description, value, timestamp: "invalid timestamp" }],
                ["null timestamp", { category, description, value, timestamp: null }],
            ]

            describe('POST', () => {
                describe('should create transaction successfully', () => {
                    const response = postTransaction(category, description, value, timestamp, requestParams)

                    expect(response.status, 'response status').to.equal(201)
                    expect(response).to.have.validJsonBody();

                    const jsonBody = response.json()
                    expect(jsonBody.id, "id").to.be.a("string")
                    expect(jsonBody.category, "category").to.equal(category)
                    expect(jsonBody.description, "description").to.equal(description)
                    expect(jsonBody.value, "value").to.equal(value)
                    expect(jsonBody.timestamp, "timestamp").to.equal("2024-01-01T00:00:00.000Z")
                })

                describe('should throw validation error on', () => {
                    for (const errorTestCase of validationErrorTestCases) {
                        const [name, parameters] = errorTestCase

                        describe(name, () => {
                            const response = postTransaction(parameters.category, parameters.description, parameters.value, parameters.timestamp, requestParams)

                            expect(response.status, 'response status').to.equal(400)
                            assertValidErrorBody(response)
                        })
                    }
                })

                runAuthenticationTests((requestParams) => postTransaction(category, description, value, timestamp, requestParams))
            })

            describe('GET', () => {
                describe('single', () => {
                    const postResponse = postTransaction(category, description, value, timestamp, requestParams)
                    const transactionId = postResponse.json().id

                    describe('should return transaction successfully', () => {
                        const response = getSingleTransaction(transactionId, requestParams)

                        expect(response.status, 'response status').to.equal(200)
                        expect(response).to.have.validJsonBody();

                        const jsonBody = response.json()
                        expect(jsonBody.id, "id").to.be.a("string")
                        expect(jsonBody.category, "category").to.equal(category)
                        expect(jsonBody.description, "description").to.equal(description)
                        expect(jsonBody.value, "value").to.equal(value)
                        expect(jsonBody.timestamp, "timestamp").to.equal("2024-01-01T00:00:00.000Z")
                    })

                    describe('should return authentication error when invalid uuid', () => {
                        const invalidTransactionId = randomString(10)
                        const response = getSingleTransaction(invalidTransactionId, requestParams)

                        expect(response.status, 'response status').to.equal(400)
                        assertValidErrorBody(response)
                    })

                    describe('should return 404 error when transaction does not exist', () => {
                        const nonExistentTransactionId = uuidv4()
                        const response = getSingleTransaction(nonExistentTransactionId, requestParams)

                        expect(response.status, 'response status').to.equal(404)
                        assertValidErrorBody(response)
                    })

                    runAuthenticationTests((requestParams) => getSingleTransaction(transactionId, requestParams))
                })

                // TODO: Gets only transactions from these credentials
                describe('many', () => {
                    const transactions = [{
                        category: "health", description: "Doctor's appointment", value: -50, timestamp: "2024-01-01",
                        category: "recreation", description: 'Hotel for one night', value: -120, timestamp: "2023-01-01",
                        category: "food & drinks", description: "Doctor's appointment", value: -50, timestamp: "2022-01-01",
                        category: "transport", description: "Doctor's appointment", value: -50, timestamp: "2021-01-01",
                        category: 'household & services', description: 'work income', value: 2000, timestamp: "2020-01-01",
                    }]

                    for (const transaction of transactions) {
                        const response = postTransaction(transaction.category, transaction.description, transaction.value, transaction.timestamp, requestParams)
                        expect(response.status, 'response status').to.equal(201)
                    }

                    describe('should fetch correct transactions when', () => {
                        const testCases = [
                            ["invalid category", { category: "invalid category", description, value, timestamp }],
                        ]
                    })
                })
            })

            describe('PUT', () => {
                const postResponse = postTransaction(category, description, value, timestamp, requestParams)
                const transactionId = postResponse.json().id

                describe('should update transaction successfully', () => {
                    const newCategory = 'recreation'
                    const newDescription = "Ice cream"
                    const newValue = -5
                    const newTimestamp = "2024-06-01"

                    const response = putTransaction(transactionId, newCategory, newDescription, newValue, newTimestamp, requestParams)

                    expect(response.status, 'response status').to.equal(200)
                    expect(response).to.have.validJsonBody();

                    const jsonBody = response.json()
                    expect(jsonBody.id, "category").to.equal(transactionId)
                    expect(jsonBody.category, "category").to.equal(newCategory)
                    expect(jsonBody.description, "description").to.equal(newDescription)
                    expect(jsonBody.value, "value").to.equal(newValue)
                    expect(jsonBody.timestamp, "timestamp").to.equal("2024-06-01T00:00:00.000Z")
                })

                describe('should return 400 when invlid uuid', () => {
                    const invalidTransactionId = randomString(10)
                    const response = putTransaction(invalidTransactionId, category, description, value, timestamp, requestParams)

                    expect(response.status, 'response status').to.equal(400)
                    assertValidErrorBody(response)
                })

                describe('should return 404 when non-existent transaction id', () => {
                    const nonExistentTransactionId = uuidv4()
                    const response = putTransaction(nonExistentTransactionId, category, description, value, timestamp, requestParams)

                    expect(response.status, 'response status').to.equal(404)
                    assertValidErrorBody(response)
                })

                describe('should throw validation error on', () => {
                    for (const errorTestCase of validationErrorTestCases) {
                        const [name, parameters] = errorTestCase

                        describe(name, () => {
                            const response = putTransaction(transactionId, parameters.category, parameters.description, parameters.value, parameters.timestamp, requestParams)

                            expect(response.status, 'response status').to.equal(400)
                            assertValidErrorBody(response)
                        })
                    }
                })

                runAuthenticationTests((requestParams) => putTransaction(transactionId, category, description, value, timestamp, requestParams))
            })

            describe('DELETE', () => {
                const postResponse = postTransaction(category, description, value, timestamp, requestParams)
                const transactionId = postResponse.json().id

                describe('should successfully delete transaction', () => {
                    const response = deleteTransaction(transactionId, requestParams)

                    expect(response.status, 'response status').to.equal(204)
                    expect(response.body, 'response status').to.be.null
                })

                describe('should return 400 when invlid uuid', () => {
                    const invalidTransactionId = randomString(10)
                    const response = deleteTransaction(invalidTransactionId, requestParams)

                    expect(response.status, 'response status').to.equal(400)
                    assertValidErrorBody(response)
                })

                describe('should return 404 when transaction does not exist', () => {
                    const nonExistentTransactionId = uuidv4()
                    const response = deleteTransaction(nonExistentTransactionId, requestParams)

                    expect(response.status, 'response status').to.equal(404)
                    assertValidErrorBody(response)
                })
            })
        })
    })
}
