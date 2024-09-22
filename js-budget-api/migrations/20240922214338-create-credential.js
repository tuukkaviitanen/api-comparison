"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Credentials", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      username: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      passwordHash: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable("Credentials");
  },
};
