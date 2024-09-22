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

const basicAuthPrefixRegex = /^basic /i;
const basicAuthFormatRegex = /(?<username>.+):(?<password>.+)/;

/**
 * Parses Authorization header, fetches the corresponding credentialsId and stores it in request
 */
const authenticate = async (req, res, next) => {
  try {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader) {
      return res.status(401).json({ error: "Authorization header required" });
    }

    if (!basicAuthPrefixRegex.test(authorizationHeader)) {
      return res.status(401).json({ error: "Basic authorization required" });
    }

    const decryptedAuthorizationHeader = decryptBase64(
      authorizationHeader.replace(basicAuthPrefixRegex, ""),
    );

    if (!decryptedAuthorizationHeader) {
      return res.status(401).json({ error: "Invalid authorization header" });
    }

    const regexResult = basicAuthFormatRegex.exec(decryptedAuthorizationHeader);

    if (!regexResult) {
      return res.status(401).json({ error: "Invalid authorization header" });
    }

    const [username, password] = regexResult;

    const passwordHash = generateHash(password);

    const credentialId = await getCredentialId(username, passwordHash);

    if (!credentialId) {
      return res.status(401).json({ error: "Invald credentials" });
    }

    req.credentialId = credentialId;

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authenticate;
