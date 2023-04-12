//import express-async-handler
const expressasynchandler = require("express-async-handler");

//import Employee,Project Model
const { Project } = require("../db/models/project.model");
const { Employee } = require("../db/models/employee.model");
const { Client } = require("../db/models/client.model");
const { ProjectUpdate } = require("../db/models/projectUpdate.model");
const { Concern } = require("../db/models/concern.model");
const { TeamMember } = require("../db/models/teamMembers.model");
const { Resource_Request } = require("../db/models/resourceRequest.model");
const { sequelize } = require("../db/db.config");

//import Op from sequelize
const { Op } = require("sequelize");

//-----------------------------------------------------ADD PROJECT----------------------------------------//
exports.addProject = expressasynchandler(async (req, res) => {
  //check role

  //extract body
  let {
    projectName,
    gdoHead,
    projectManager,
    clientId,
    projectStatus,
    projectStartDate,
    projectFitnessIndicator,
    projectDomain,
    projectType,
  } = req.body;
  //check gdo_head ,project manager exists
  let gdo = await Employee.findOne({ where: { email: gdoHead } });
  let manager = await Employee.findOne({
    where: { email: projectManager },
  });
  //If exists
  if (gdo && manager) {
    //check roles
    if (
      gdo.dataValues.role == "gdoHead" &&
      manager.dataValues.role == "projectManager"
    ) {
      //insert into Projects
      let project = await Project.create({
        projectName,
        gdoHead,
        projectManager,
        clientId,
        projectStatus,
        projectStartDate,
        projectFitnessIndicator,
        projectDomain,
        projectType,
      });
      if (project) {
        res
          .status(201)
          .send({ message: "Project Added", payload: project.dataValues });
      } else {
        res.send({ message: "Error While Adding a Project,Try Again" });
      }
    }
  }
  //not exists
  else {
    res.status(403).send("Please Recheck the GDO and Project Manager Email");
  }
});

//-----------------------------------------------------UPDATE PROJECT----------------------------------------//
exports.updatingProject = expressasynchandler(async (req, res) => {
  //Updating Project Details
  let updated = await Project.update(req.body, {
    where: { projectName: req.body.projectName },
  });
  if (updated) {
    res.send({
      message: "Project Details Updated",
      payload: updated.dataValues,
    });
  }
});
//-----------------------------------------------------DELETE PROJECT----------------------------------------//
exports.deletingProject = expressasynchandler(async (req, res) => {
  //Hard Delete
  let deleted = await Project.destroy({
    where: { projectName: req.params.projectName },
  });

  if (deleted) {
    res.status(200).send({ message: "Project Deteled " });
  }
});

//-----------------------------------------------------VIEW PROJECTS----------------------------------------//
exports.potfolioDashboard = expressasynchandler(async (req, res) => {
  //Get All Projects
  let projects = await Project.findAll({
    //include model
    include: {
      model: Client,
      attributes: {
        exclude: ["clientId"],
      },
    },

    attributes: {
      exclude: [
        "projectId",
        "gdoHead",
        "projectManager",
        "clientId",
        "projectDomain",
        "projectType",
      ],
    },
  });
  //Send Response
  res.status(200).send({ message: "All Project Details", payload: projects });
});
//-----------------------------------------------------VIEW SPECIFIC PROJECT ----------------------------------------//
exports.projectPotfolioDashboard = expressasynchandler(async (req, res) => {
  //get details

  let project = await Project.findOne({
    where: { projectId: req.params.project_id },
    attributes: {
      exclude: [
        "projectid",
        "projectName",
        "gdoHead",
        "projectManager",
        "projectStatus",
        "projectStart_Date",
        "projectEnd_Date",
        "projectDomain",
        "projectType",
        "clientId",
      ],
    },
  });
  if (project) {
    let [count] = await sequelize.query(
      "select count(email) as teamCount from teamMembers where projectId=? and billingStatus=?",
      {
        replacements: [req.params.project_id, "billed"],
      }
    );
    project.dataValues.count = count[0].teamCount;
    res.status(200).send({ message: "Project", payload: project });
  } else {
    res.send({ message: "Some Error Occurred Please Recheck" });
  }
});

//-----------------------------------------------------VIEW SPECIFIC PROJECT DETAILS----------------------------------------//
exports.projectDetails = expressasynchandler(async (req, res) => {
  //Get Specific Project Details
  let project = await Project.findOne({
    where: { projectId: req.params.project_id },
    include: {
      model: Client,
      attributes: {
        exclude: ["clientId"],
      },
    },

    attributes: {
      exclude: ["projectId", "gdoHead", "projectManager", "clientId"],
    },
  });
  if (project) {
    let [count] = await sequelize.query(
      "select count(email) as teamCount from teamMembers where projectId=? and billingStatus=?",
      {
        replacements: [req.params.project_id, "billed"],
      }
    );
    project.dataValues.team_Size = count[0].teamCount;
    res.status(200).send({ message: " Project Details", payload: project });
  } else {
    res.send({ message: "Some Error Occurred Please Recheck" });
  }
});

//-----------------------------------------------------VIEW SPECIFIC PROJECT UPDATES----------------------------------------//
exports.projectUpdates = expressasynchandler(async (req, res) => {
  //Creating New Date
  const today_Date = new Date();

  // console.log(
  //   Today_Date.getDate(),
  //   Today_Date.getMonth(),
  //   Today_Date.getFullYear()
  // );
  //Create Two Weeks Before Date
  const two_Weeks_Before_Date = new Date();
  two_Weeks_Before_Date.setDate(today_Date.getDate() - 14);
  //console.log(Two_Weeks_Before_Date);
  //get updates
  let updates = await ProjectUpdate.findAll({
    where: {
      projectId: req.params.project_id,
      updatedOn: {
        [Op.between]: [two_Weeks_Before_Date, today_Date],
      },
    },
    //exclude attributes
    attributes: {
      exclude: ["updateId", "projectId"],
    },
  });

  if (updates) {
    res
      .status(200)
      .send({ message: "Updates Of This Project", payload: updates });
  } else {
    res.send({ message: "Some Error Occurred Please Recheck" });
  }
});

//-----------------------------------------------------VIEW SPECIFIC PROJECT TEAM COMPOSITION----------------------------------------//
exports.teamComposition = expressasynchandler(async (req, res) => {
  //get team details
  let teamMembers = await TeamMember.findAll({
    where: { projectId: req.params.project_id },
    attributes: {
      exclude: ["id", "projectId"],
    },
  });

  if (teamMembers.length) {
    res
      .status(200)
      .send({ message: "Project Team Composition", payload: teamMembers });
  } else {
    res.send({ message: "No Team Members Under This Project" });
  }
});

//-----------------------------------------------------VIEW SPECIFIC PROJECT CONCERNS----------------------------------------//
exports.projectConcerns = expressasynchandler(async (req, res) => {
  //get concerns
  let concerns = await Concern.findAll({
    where: { projectId: req.params.project_id },
    attributes: {
      exclude: ["Concern_id", "Concern_Indicator"],
    },
  });

  res
    .status(200)
    .send({ message: "Concerns Of This Project", payload: concerns });
});

//-----------------------------------------------------VIEW RESOURCE REQUEST----------------------------------------//
exports.resourceRequest = expressasynchandler(async (req, res) => {
  //get resource requests
  let resources = await Resource_Request.findAll();
  if (resources) {
    res.status(200).send({ message: "Resource Request", payload: resources });
  }
});
