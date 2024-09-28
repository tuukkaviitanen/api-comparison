const { Credential } = require("../models");
const { generateHash } = require("../utils/helpers");

const getCredentialId = async (username, password) => {
  const passwordHash = generateHash(password);
  const credential = await Credential.findOne({
    where: {
      username,
      passwordHash,
    },
  });

  return credential?.id;
};

const createCredential = async (username, password) => {
  const passwordHash = generateHash(password);
  await Credential.create({ username, passwordHash });
};

const deleteCredential = async (credentialId) => {
  await Credential.destroy({
    where: {
      id: credentialId,
    },
  });
};

module.exports = {
  getCredentialId,
  createCredential,
  deleteCredential,
};
