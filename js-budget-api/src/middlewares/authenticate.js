const crypto = require("node:crypto");
const { getCredentialId } = require("../services/credential-service");

const decryptBase64 = (base64) => {
  try {
    const decryptedString = Buffer.from(base64, "base64").toString("utf-8");
    return decryptedString;
  } catch {
    return null;
  }
};

const generateHash = (string) => {
  const hash = crypto.createHash("sha256");
  hash.update(string);
  const result = hash.digest("hex");
  return result;
};

const sendAuthorizationError = (res) => {
  res
    .setHeader("WWW-Authenticate", "Basic")
    .status(401)
    .json({ error: "Authentication failed" });
};

const basicAuthPrefixRegex = /^basic /i;
const basicAuthFormatRegex = /(?<username>.+):(?<password>.+)/;

/**
 * Parses Authorization header, fetches the corresponding credentialsId and stores it in request
 */
const authenticate = async (req, res, next) => {
  try {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader) {
      return sendAuthorizationError(res);
    }

    if (!basicAuthPrefixRegex.test(authorizationHeader)) {
      return sendAuthorizationError(res);
    }

    const decryptedAuthorizationHeader = decryptBase64(
      authorizationHeader.replace(basicAuthPrefixRegex, ""),
    );

    if (!decryptedAuthorizationHeader) {
      return sendAuthorizationError(res);
    }

    const regexResult = basicAuthFormatRegex.exec(decryptedAuthorizationHeader);

    if (!regexResult) {
      return sendAuthorizationError(res);
    }

    const [username, password] = regexResult;

    const passwordHash = generateHash(password);

    const credentialId = await getCredentialId(username, passwordHash);

    if (!credentialId) {
      return sendAuthorizationError(res);
    }

    req.credentialId = credentialId;

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authenticate;
