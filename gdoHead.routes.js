//import ecpress and create mini express app
const express = require("express");
const gdoHeadApp = express.Router();

//import controllers
const {
  AddTeamMembers,
  PortfolioDashboard,
  ProjectConcerns,
  ProjectDetails,
  ProjectPortfolioDashboard,
  ProjectUpdates,
  TeamComposition,
  updatingTeamMembers,
  deletingTeamMembers,
} = require("../controllers/gdoHead.controllers");

//Body Parser
gdoHeadApp.use(express.json());

//define routes
gdoHeadApp.post("/TeamMembers", AddTeamMembers);
gdoHeadApp.put("/TeamMembers/:gdoHead", updatingTeamMembers);
gdoHeadApp.delete("/:gdoHead/TeamMembers/:email", deletingTeamMembers);
gdoHeadApp.get("/PortfolioDashboard/:email", PortfolioDashboard);
gdoHeadApp.get(
  "/PortfolioDashboard/:email/:project_id",
  ProjectPortfolioDashboard
);
gdoHeadApp.get(
  "/PortfolioDashboard/:email/:project_id/ProjectDetails",
  ProjectDetails
);

gdoHeadApp.get(
  "/PotfolioDashboard/:email/:project_id/ProjectUpdates",
  ProjectUpdates
);
gdoHeadApp.get(
  "/PotfolioDashboard/:email/:project_id/TeamComposition",
  TeamComposition
);
gdoHeadApp.get(
  "/PotfolioDashboard/:email/:project_id/ProjectConcerns",
  ProjectConcerns
);

//export router object
module.exports = gdoHeadApp;
