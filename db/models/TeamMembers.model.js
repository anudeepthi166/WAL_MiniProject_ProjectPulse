//import sequelize
const { DataTypes } = require("sequelize");
const { sequelize } = require("../db.config");
//import Employee Model
const { Employee } = require("./Employee.model");

//Team Members Model
exports.TeamMember = sequelize.define(
  "Team_Members",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    Email: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: Employee,
        key: "Email",
      },
    },
    Project_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    Role: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Start_Date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    End_Date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    Status: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    Exposed_To_Client: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    Billing_Status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Allocation_Type: {
      type: DataTypes.STRING,
      allownull: false,
    },
  },
  { timestamps: false, freezeTableName: true }
);
