import { Context, error } from "elysia";

import { getCredentialId } from "../services/credential-service";
const authenticationError = (set: Context["set"], message: string) => {
  set.headers["www-authenticate"] = "Basic";
  error(401, { error: `Authentication error: ${message}` });
};

const basicAuthHeaderRegex = /^basic (?<authString>.+)/i;
const basicAuthDecryptedFormatRegex = /(?<username>.+):(?<password>.+)/;

const decryptBase64 = (base64: string) => {
  try {
    const decryptedString = Buffer.from(base64, "base64").toString("utf-8");
    return decryptedString;
  } catch {
    return null;
  }
};

const authenticate = async ({ headers, set }: Context) => {
  const authorizationHeader = headers["Authorization"];

  if (!authorizationHeader) {
    return authenticationError(set, "Authorization header missing");
  }

  const authHeaderRegexResult = basicAuthHeaderRegex.exec(authorizationHeader);

  if (!authHeaderRegexResult) {
    return authenticationError(set, "Invalid authorization header");
  }

  const decryptedAuthorization = decryptBase64(authorizationHeader);

  if (!decryptedAuthorization) {
    return authenticationError(set, "Invalid base64 string");
  }

  const decryptedAuthRegexResult = basicAuthDecryptedFormatRegex.exec(
    decryptedAuthorization,
  );

  if (!decryptedAuthRegexResult) {
    return authenticationError(set, "Invalid credentials format");
  }

  const { username, password } = decryptedAuthRegexResult.groups as {
    username: string;
    password: string;
  };

  const credentialId = await getCredentialId(username, password);

  if (!credentialId) {
    return authenticationError(set, "Invalid credentials");
  }

  return { credentialId };
};

export default authenticate;
