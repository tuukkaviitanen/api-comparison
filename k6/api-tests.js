import http from 'k6/http';
import { describe, expect } from 'https://jslib.k6.io/k6chaijs/4.3.4.3/index.js';
import { randomString } from 'https://jslib.k6.io/k6-utils/1.0.0/index.js';
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

const deleteCredentials = (username, password) => {
    const params = {
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
            })

            describe('DELETE', () => {
                describe('should remove credentials successfully', () => {
                    const response = deleteCredentials(username, password)
                    expect(response.status, 'response status').to.equal(204)
                    expect(response.body, 'response status').to.be.null
                })
                describe('should respond with 401 when unable to authenticate', () => {
                    const response = deleteCredentials(username, password)
                    expect(response.status, 'response status').to.equal(401)
                    assertValidErrorBody(response)
                })
            })
        });

        describe('Transactions endpoint', () => {
            const username = randomString(10)
            const password = randomString(10)

            postCredentials(username, password)

            const requestParams = getTransactionParams(username, password)

            const category = 'health'
            const description = "Doctor's appointment"
            const value = 99.99
            const timestamp = "2024-01-01"

            const validationErrorTestCases = [
                ["invalid category", { category: "invalid category", description, value, timestamp }],
                ["too short description", { category, description: randomString(3), value, timestamp }],
                ["too long description", { category, description: randomString(201), value, timestamp }],
                ["too small value", { category, description, value: -1000000001, timestamp }],
                ["too big value", { category, description, value: 1000000001, timestamp }],
                ["too many decimals in value", { category, description, value: 0.001, timestamp }],
                ["invalid timestamp", { category, description, value, timestamp: "invalid timestamp" }],
            ]

            describe('POST', () => {
                describe('should create transaction successfully', () => {
                    const response = postTransaction(category, description, value, timestamp, requestParams)

                    expect(response.status, 'response status').to.equal(201)

                    expect(response).to.have.validJsonBody();
                    const jsonBody = response.json()
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
                describe('should throw authentication error on', () => {
                    describe('invalid credentials', () => {
                        const newUsername = randomString(10)
                        const newPassword = randomString(10)
                        const newRequestParams = getTransactionParams(newUsername, newPassword)

                        const response = postTransaction(category, description, value, timestamp, newRequestParams)

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

                        const response = postTransaction(category, description, value, timestamp, newRequestParams)

                        expect(response.status, 'response status').to.equal(401)
                        assertValidErrorBody(response)
                    })

                    describe('missing authentication header', () => {
                        const newRequestParams = {
                            headers: {
                                'Content-Type': 'application/json',
                            },
                        };

                        const response = postTransaction(category, description, value, timestamp, newRequestParams)

                        expect(response.status, 'response status').to.equal(401)
                        assertValidErrorBody(response)
                    })
                })
            })
        })
    })
}
