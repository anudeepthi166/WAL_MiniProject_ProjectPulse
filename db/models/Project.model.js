//import sequelize
const { DataTypes } = require("sequelize");
const { sequelize } = require("../db.config");

//import Employee,client Model
const { Employee } = require("./Employee.model");
const { Client } = require("./Client.model");

//deining Project model and exporting
exports.Project = sequelize.define(
  "Projects",
  {
    Project_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    Project_Name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    GDO_Head: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    Project_Manager: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: Employee,
        key: "Email",
      },
    },

    Project_Status: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    Project_Start_Date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    Project_End_Date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    Project_Fitness_Indicator: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    Project_Domain: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Project_Type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: false,
    freezeTableName: true,
  }
);
