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
  resourceRequest,
  teamComposition,
} = require("../controllers/projectManager.controller");

//Body Parser
projectManagerApp.use(express.json());

//define routes
projectManagerApp.post("/:email/concerns", concerns);
projectManagerApp.post("/:email/resourceRequest", resourceRequest);
projectManagerApp.post("/:email/projectUpdates", projectUpdating);

projectManagerApp.get("/:email/projectDetails", projectDetails);

projectManagerApp.get("/:email/projectUpdates", projectUpdates);
projectManagerApp.get("/:email/teamComposition", teamComposition);
projectManagerApp.get("/:email/projectConcerns", projectConcerns);

//export router object
module.exports = projectManagerApp;
