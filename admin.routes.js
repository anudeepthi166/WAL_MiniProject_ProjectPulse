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
  allConcerns,
} = require("../controllers/admin.controllers");

//Body Parser
adminApp.use(express.json());

//defining routes
adminApp.post("/:email/project", addProject);
adminApp.put("/:email/project/:projectId", updatingProject);
adminApp.put("/:email/delete/project/:projectId", deletingProject);
adminApp.get("/:email/portfolioDashboard", potfolioDashboard);
adminApp.get(
  "/:email/projectId/:project_id/detailedView",
  projectPotfolioDashboard
);
adminApp.get("/:email/projectId/:project_id/projectDetails", projectDetails);
adminApp.get("/:email/projectId/:project_id/projectUpdates", projectUpdates);
adminApp.get("/:email/projectId/:project_id/teamComposition", teamComposition);
adminApp.get("/:email/projectId/:project_id/projectConcerns", projectConcerns);
adminApp.get("/:email/resourceRequest", resourceRequest);
adminApp.get("/:email/concerns", allConcerns);

//export Router Object
module.exports = adminApp;
