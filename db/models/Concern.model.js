//import sequelize from db.config
const { DataTypes } = require("sequelize");
const { sequelize } = require("../db.config");

//import Employee model
const { Employee } = require("./Employee.model");
const { Project } = require("./Project.model");

//Resource Request Model
exports.Concern = sequelize.define(
  "Concerns",
  {
    Concern_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    Project_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Project,
        key: "Project_id",
      },
    },
    Concern_Desc: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Concern_Raised_By: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: Employee,
        key: "Email",
      },
    },
    Concern_Raised_On: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    Concern_Severity: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Concern_Indicator: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Concern_Raised_From_Client: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    Concern_Status: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    Concern_Mitigated_Date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },

  {
    timestamps: false,
    freezeTableName: true,
  }
);
