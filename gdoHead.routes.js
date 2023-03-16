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
gdoHeadApp.post("/teamMembers", addTeamMembers);
gdoHeadApp.put("/teamMembers/:gdoHead", updatingTeamMembers);
gdoHeadApp.delete("/:gdoHead/teamMembers/:email", deletingTeamMembers);
gdoHeadApp.get("/portfolioDashboard/:email", portfolioDashboard);
gdoHeadApp.get(
  "/portfolioDashboard/:email/:project_id",
  projectPortfolioDashboard
);
gdoHeadApp.get(
  "/portfolioDashboard/:email/:project_id/projectDetails",
  projectDetails
);

gdoHeadApp.get(
  "/portfolioDashboard/:email/:project_id/projectUpdates",
  projectUpdates
);
gdoHeadApp.get(
  "/portfolioDashboard/:email/:project_id/teamComposition",
  teamComposition
);
gdoHeadApp.get(
  "/PotfolioDashboard/:email/:project_id/ProjectConcerns",
  projectConcerns
);
gdoHeadApp.get(
  "/PotfolioDashboard/:email/:project_id/resourceRequest",
  resourceRequest
);
//export router object
module.exports = gdoHeadApp;
