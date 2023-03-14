//import sequlize from db.config
const { sequelize } = require("../db.config");
//import DataTypes from sequelize module
const { DataTypes, INTEGER } = require("sequelize");

//import Project Model
const { Project } = require("./Project.model");

//define a model and exporting
exports.ProjectUpdate = sequelize.define(
  "Project_Updates",
  {
    Update_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    Project_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Project,
        key: "Project_id",
      },
    },
    Project_Status_Update: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Schedule_Status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Resourcing_Status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Quality_Status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Waiting_For_Client_Inputs: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    Updated_On: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    timestamps: false,
    freezeTableName: true,
  }
);
