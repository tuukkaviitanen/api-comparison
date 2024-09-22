"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Transaction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Transaction.belongsTo(models.Credential, {
        onDelete: "CASCADE",
        foreignKey: {
          allowNull: false,
        },
      });
    }
  }
  Transaction.init(
    {
      id: DataTypes.UUID,
      credentialId: DataTypes.UUID,
      category: DataTypes.STRING(50),
      description: DataTypes.STRING(200),
      value: DataTypes.DECIMAL,
      timestamp: DataTypes.DATE(3),
    },
    {
      sequelize,
      modelName: "Transaction",
    },
  );
  return Transaction;
};
