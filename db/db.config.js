//import sequelize
const { Sequelize } = require("sequelize");

//configure dotenv
require("dotenv").config();

//Sequelize object
exports.sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: "localhost",
    dialect: "mysql",
  }
);
