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
      id: DataTypes.UUID,
      username: DataTypes.STRING(50),
      passwordHash: DataTypes.STRING(50),
    },
    {
      sequelize,
      modelName: "Credential",
    },
  );
  return Credential;
};
