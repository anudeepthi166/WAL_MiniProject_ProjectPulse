//import sequlize from db.config
const { sequelize } = require("../db.config");
//import DataTypes from sequelize module
const { DataTypes } = require("sequelize");

//define a model and exporting
exports.Employee = sequelize.define(
  "Employees",
  {
    Email: {
      type: DataTypes.STRING,
      primaryKey: true,
      set(Email) {
        this.setDataValue("Email", Email.toLowerCase());
      },
    },
    Employee_Name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Password: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    Role: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    timestamps: false,
    freezeTableName: true,
  }
);
