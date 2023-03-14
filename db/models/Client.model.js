//import sequelize from db.config
const { DataTypes } = require("sequelize");
const { sequelize } = require("../db.config");

//import Employee model
const { Employee } = require("./Employee.model");

//Client Model
exports.Client = sequelize.define(
  "Clients",
  {
    Client_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    Client_Email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Client_Account_Manager: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: Employee,
        key: "Email",
      },
    },
  },
  {
    timestamps: false,
    freezeTableName: true,
  }
);
