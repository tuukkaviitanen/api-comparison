"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Transactions", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      credentialId: {
        type: Sequelize.UUID,
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
        allowNull: false,
        references: {
          model: "Credentials",
          key: "id",
        },
      },
      category: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      description: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      value: {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      timestamp: {
        type: Sequelize.DATE(3),
        allowNull: false,
      },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable("Transactions");
  },
};
