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
userApp.post("/register", registeration);

//login
userApp.post("/login", login);

//forgot Password
userApp.post("/forgotPassword", forgotPassword);

//Reset Password
userApp.put("/resetPassword", resetPassword);

//RoleMapping
userApp.post("/roleMapping", roleMapping);

//export router object
module.exports = userApp;
