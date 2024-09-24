"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Credential extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */

    static associate(models) {
      // define association here
      Credential.hasMany(models.Transaction);
    }
  }
  Credential.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      username: { type: DataTypes.STRING(50), unique: true },
      passwordHash: DataTypes.STRING(64),
    },
    {
      sequelize,
      modelName: "Credential",
      timpestamps: false,
    },
  );
  return Credential;
};
