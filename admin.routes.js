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
adminApp.post("/:email/project", addProject);
adminApp.put("/:email/project", updatingProject);
adminApp.delete("/:email/project/:projectName", deletingProject);
adminApp.get("/:email/portfolioDashboard", potfolioDashboard);
adminApp.get("/:email/projectId/:project_id", projectPotfolioDashboard);
adminApp.get("/:email/projectId/:project_id/projectDetails", projectDetails);
adminApp.get("/:email/projectId/:project_id/projectUpdates", projectUpdates);
adminApp.get("/:email/projectId/:project_id/teamComposition", teamComposition);
adminApp.get("/:email/projectId/:project_id/projectConcerns", projectConcerns);
adminApp.get("/:email/resourceRequest", resourceRequest);

//export Router Object
module.exports = adminApp;
