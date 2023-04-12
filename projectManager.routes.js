//import ecpress and create mini express app
const express = require("express");
const projectManagerApp = express.Router();

//import controllers
const {
  concerns,
  projectConcerns,
  projectDetails,
  projectUpdates,
  projectUpdating,

  teamComposition,
  projectPorfolioDashboard,
  portfolioDashboard,
  editConcern,
} = require("../controllers/projectManager.controller");

//Body Parser
projectManagerApp.use(express.json());

//define routes
projectManagerApp.post("/:email/projectId/:projectId/concerns", concerns);
projectManagerApp.put("/:email/projectId/:projectId/concerns", editConcern);

projectManagerApp.post(
  "/:email/projectId/:projectId/projectUpdates",
  projectUpdating
);
projectManagerApp.get("/:email/portfolioDashboard", portfolioDashboard);

projectManagerApp.get(
  "/:email/projectId/:projectId/detailedView",
  projectPorfolioDashboard
);

projectManagerApp.get(
  "/:email/projectId/:projectId/projectDetails",
  projectDetails
);

projectManagerApp.get(
  "/:email/projectId/:projectId/projectUpdates",
  projectUpdates
);
projectManagerApp.get(
  "/:email/projectId/:projectId/teamComposition",
  teamComposition
);
projectManagerApp.get(
  "/:email/projectId/:projectId/projectConcerns",
  projectConcerns
);

//export router object
module.exports = projectManagerApp;
