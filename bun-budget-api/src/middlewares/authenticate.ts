import { Context } from "elysia";
import { getCredentialId } from "../services/credential-service";
import AuthenticationError from "../errors/authentication-error";

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

const authenticate = async ({ headers }: Context) => {
  const authorizationHeader = headers.authorization;

  if (!authorizationHeader) {
    throw new AuthenticationError("Authorization header missing");
  }

  const authHeaderRegexResult = basicAuthHeaderRegex.exec(authorizationHeader);

  if (!authHeaderRegexResult) {
    throw new AuthenticationError("Invalid authorization header");
  }

  const { authString } = authHeaderRegexResult.groups as { authString: string };

  const decryptedAuthorization = decryptBase64(authString);

  if (!decryptedAuthorization) {
    throw new AuthenticationError("Invalid base64 string");
  }

  const decryptedAuthRegexResult = basicAuthDecryptedFormatRegex.exec(
    decryptedAuthorization,
  );

  if (!decryptedAuthRegexResult) {
    throw new AuthenticationError("Invalid credentials format");
  }

  const { username, password } = decryptedAuthRegexResult.groups as {
    username: string;
    password: string;
  };

  const credentialId = await getCredentialId(username, password);

  if (!credentialId) {
    throw new AuthenticationError("Invalid credentials");
  }

  return { credentialId };
};

export default authenticate;
