const crypto = require("node:crypto");

const generateHash = (string) => {
  const hash = crypto.createHash("sha256");
  hash.update(string);
  const result = hash.digest("hex");
  return result;
};

module.exports = { generateHash };
