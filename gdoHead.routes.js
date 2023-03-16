//import ecpress and create mini express app
const express = require("express");
const gdoHeadApp = express.Router();

//import controllers
const {
  addTeamMembers,
  portfolioDashboard,
  projectConcerns,
  projectDetails,
  projectPortfolioDashboard,
  projectUpdates,
  teamComposition,
  updatingTeamMembers,
  deletingTeamMembers,
  resourceRequest,
} = require("../controllers/gdoHead.controllers");

//Body Parser
gdoHeadApp.use(express.json());

//define routes
gdoHeadApp.post("/:gdoHead/teamMembers", addTeamMembers);
gdoHeadApp.put("/:gdoHead/teamMembers", updatingTeamMembers);
gdoHeadApp.delete("/:gdoHead/teamMembers/:email", deletingTeamMembers);
gdoHeadApp.get("/:email/portfolioDashboard", portfolioDashboard);
gdoHeadApp.get(
  "/:email/projectId/:project_id/portfolioDashboard/",
  projectPortfolioDashboard
);
gdoHeadApp.get("/:email/projectId/:project_id/projectDetails", projectDetails);

gdoHeadApp.get("/:email/projectId/:project_id/projectUpdates", projectUpdates);
gdoHeadApp.get(
  "/:email/projectId/:project_id/teamComposition",
  teamComposition
);
gdoHeadApp.get(
  "/:email/projectId/:project_id/ProjectConcerns",
  projectConcerns
);
gdoHeadApp.get("/:email/resourceRequest", resourceRequest);
//export router object
module.exports = gdoHeadApp;
