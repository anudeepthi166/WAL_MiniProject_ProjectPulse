//import sequelize from db.config
const { DataTypes } = require("sequelize");
const { sequelize } = require("../db.config");

//import Employee model
const { Employee } = require("./Employee.model");
const { Project } = require("./Project.model");

//Resource Request Model
exports.Resource_Request = sequelize.define(
  "Resource_Requests",
  {
    Request_Raised_By: {
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
      references: {
        model: Project,
        key: "Project_id",
      },
    },
    Resource_Desc: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: false,
    freezeTableName: true,
  }
);
