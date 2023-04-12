//import express and create mini express app
const express = require("express");
const userApp = express.Router();

const {
  superAdminVerifyToken,
} = require("../middlewares/superAdmin.Verify.Token");

//import controllers
const {
  registeration,
  login,
  roleMapping,
  forgotPassword,
  resetPassword,
  getUsers,
  deleteRole,
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
userApp.put("/roleMapping", superAdminVerifyToken, roleMapping);

//Removing role
userApp.put("/:user/removeRole", superAdminVerifyToken, deleteRole);

// get All Users
userApp.get("/getAllUsers", superAdminVerifyToken, getUsers);

//export router object
module.exports = userApp;
