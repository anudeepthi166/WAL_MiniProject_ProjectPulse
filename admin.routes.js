//import express and create mini express app
const express = require("express");
const AdminApp = express.Router();

//import controllers
const {
  AddProject,
  PotfolioDashboard,
  ProjectConcerns,
  ProjectDetails,
  ProjectPotfolioDashboard,
  ProjectUpdates,
  TeamComposition,
  updatingProject,
  deletingProject,
} = require("../controllers/admin.controllers");

//Body Parser
AdminApp.use(express.json());

//defining routes
AdminApp.post("/Project", AddProject);
AdminApp.put("/Project", updatingProject);
AdminApp.delete("/Project/:Project_Name", deletingProject);
AdminApp.get("/PotfolioDashboard", PotfolioDashboard);
AdminApp.get("/PotfolioDashboard/:proj_id", ProjectPotfolioDashboard);
AdminApp.get("/PotfolioDashboard/:proj_id/ProjectDetails", ProjectDetails);
AdminApp.get("/PotfolioDashboard/:proj_id/ProjectUpdates", ProjectUpdates);
AdminApp.get("/PotfolioDashboard/:proj_id/TeamComposition", TeamComposition);
AdminApp.get("/PotfolioDashboard/:proj_id/ProjectConcerns", ProjectConcerns);
//export Router Object
module.exports = AdminApp;
