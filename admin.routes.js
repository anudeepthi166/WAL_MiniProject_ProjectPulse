//import express and create mini express app
const express = require("express");
const adminApp = express.Router();

//import controllers
const {
  addProject,
  potfolioDashboard,
  projectConcerns,
  projectDetails,
  projectPotfolioDashboard,
  projectUpdates,
  teamComposition,
  updatingProject,
  deletingProject,
  resourceRequest,
} = require("../controllers/admin.controllers");

//Body Parser
adminApp.use(express.json());

//defining routes
adminApp.post("/project", addProject);
adminApp.put("/project", updatingProject);
adminApp.delete("/project/:projectName", deletingProject);
adminApp.get("/portfolioDashboard", potfolioDashboard);
adminApp.get("/portfolioDashboard/:project_id", projectPotfolioDashboard);
adminApp.get("/portfolioDashboard/:project_id/projectDetails", projectDetails);
adminApp.get("/portfolioDashboard/:project_id/projectUpdates", projectUpdates);
adminApp.get(
  "/portfolioDashboard/:project_id/teamComposition",
  teamComposition
);
adminApp.get(
  "/portfolioDashboard/:project_id/projectConcerns",
  projectConcerns
);
adminApp.get(
  "/portfolioDashboard/:project_id/resourceRequest",
  resourceRequest
);
//export Router Object
module.exports = adminApp;
