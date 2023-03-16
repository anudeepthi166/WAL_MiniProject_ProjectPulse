//import express and create mini express app
const express = require("express");
const userApp = express.Router();

//import controllers
const {
  registeration,
  login,
  roleMapping,
  forgotPassword,
  resetPassword,
} = require("../controllers/user.controllers");

//Body Parser
userApp.use(express.json());

//define routes
//register
userApp.post("/:email/register", registeration);

//login
userApp.post("/:email/login", login);

//forgot Password
userApp.post("/:email/forgotPassword", forgotPassword);

//Reset Password
userApp.put("/:email/resetPassword", resetPassword);

//RoleMapping
userApp.post("/roleMapping", roleMapping);

//export router object
module.exports = userApp;
