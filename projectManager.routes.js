//import ecpress and create mini express app
const express = require("express");
const projectManagerApp = express.Router();

//import controllers
const {
  Concerns,
  ProjectConcerns,
  ProjectDetails,
  ProjectUpdates,
  ProjectUpdating,
  Resource_Request,
  TeamComposition,
} = require("../controllers/projectManager.controller");

//Body Parser
projectManagerApp.use(express.json());

//define routes
projectManagerApp.post("/:email/Concerns", Concerns);
projectManagerApp.post("/:email/ResourceRequest", Resource_Request);
projectManagerApp.post("/:email/ProjectUpdates", ProjectUpdating);

projectManagerApp.get("/:email/ProjectDetails", ProjectDetails);

projectManagerApp.get("/:email/ProjectUpdates", ProjectUpdates);
projectManagerApp.get("/:email/TeamComposition", TeamComposition);
projectManagerApp.get("/:email/ProjectConcerns", ProjectConcerns);

//export router object
module.exports = projectManagerApp;
