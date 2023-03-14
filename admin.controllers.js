//import express-async-handler
const expressasynchandler = require("express-async-handler");

//import Employee,Project Model
const { Project } = require("../db/models/Project.model");
const { Employee } = require("../db/models/Employee.model");
const { Client } = require("../db/models/Client.model");
const { ProjectUpdate } = require("../db/models/ProjectUpdate.model");
const { Concern } = require("../db/models/Concern.model");
const { TeamMember } = require("../db/models/TeamMembers.model");
const { sequelize } = require("../db/db.config");

//import Op from sequelize
const { Op } = require("sequelize");
//-----------------------------------------------------ADD PROJECT----------------------------------------//
exports.AddProject = expressasynchandler(async (req, res) => {
  //check role

  //extract body
  let {
    Project_Name,
    GDO_Head,
    Project_Manager,
    Client_id,
    Project_Status,
    Project_Start_Date,
    Project_Fitness_Indicator,
    Project_Domain,
    Project_Type,
  } = req.body;
  //check gdo_head ,project manager exists
  let gdo = await Employee.findOne({ where: { Email: GDO_Head } });
  let projectManager = await Employee.findOne({
    where: { Email: Project_Manager },
  });
  //If exists
  if (gdo && projectManager) {
    //check roles
    if (
      gdo.dataValues.Role == "GDO Head" &&
      projectManager.dataValues.Role == "Project Manager"
    ) {
      //insert into Projects
      let project = await Project.create({
        Project_Name,
        GDO_Head,
        Project_Manager,
        Client_id,
        Project_Status,
        Project_Start_Date,
        Project_Fitness_Indicator,
        Project_Domain,
        Project_Type,
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
    where: { Project_Name: req.body.Project_Name },
  });
  if (updated) {
    res.status(205).send({ message: "Project Details Updated" });
  }
});
//-----------------------------------------------------DELETE PROJECT----------------------------------------//
exports.deletingProject = expressasynchandler(async (req, res) => {
  //Hard Delete
  let deleted = await Project.destroy({
    where: { Project_Name: req.params.Project_Name },
  });

  if (deleted) {
    res.status(200).send({ message: "Project Deteled " });
  }
});

//-----------------------------------------------------VIEW PROJECTS----------------------------------------//
exports.PotfolioDashboard = expressasynchandler(async (req, res) => {
  //Get All Projects
  let projects = await Project.findAll({
    //include model
    include: {
      model: Client,
      attributes: {
        exclude: ["Client_id"],
      },
    },

    attributes: {
      exclude: [
        "Project_id",
        "GDO_Head",
        "Project_Manager",
        "Client_id",
        "Project_Domain",
        "Project_Type",
      ],
    },
  });
  //Send Response
  res.status(200).send({ message: "All Project Details", payload: projects });
});
//-----------------------------------------------------VIEW SPECIFIC PROJECT ----------------------------------------//
exports.ProjectPotfolioDashboard = expressasynchandler(async (req, res) => {
  //get details

  let project = await Project.findOne({
    where: { Project_id: req.params.proj_id },
    attributes: {
      exclude: [
        "Project_id",
        "Project_Name",
        "GDO_Head",
        "Project_Manager",
        "Project_Status",
        "Project_Start_Date",
        "Project_End_Date",
        "Project_Domain",
        "Project_Type",
        "Client_id",
      ],
    },
  });
  if (project) {
    let [count] = await sequelize.query(
      "select count(Email) as Team_Count from Team_Members where Project_id=? and Billing_Status=?",
      {
        replacements: [req.params.proj_id, "Billed"],
      }
    );
    project.dataValues.count = count[0].Team_Count;
    res.status(200).send({ message: "Project", payload: project });
  } else {
    res.send({ message: "Some Error Occurred Please Recheck" });
  }
});

//-----------------------------------------------------VIEW SPECIFIC PROJECT DETAILS----------------------------------------//
exports.ProjectDetails = expressasynchandler(async (req, res) => {
  //Get Specific Project Details
  let project = await Project.findOne({
    where: { Project_id: req.params.proj_id },
    include: {
      model: Client,
      attributes: {
        exclude: ["Client_id"],
      },
    },

    attributes: {
      exclude: ["Project_id", "GDO_Head", "Project_Manager", "Client_id"],
    },
  });
  if (project) {
    let [count] = await sequelize.query(
      "select count(Email) as Team_Count from Team_Members where Project_id=? and Billing_Status=?",
      {
        replacements: [req.params.proj_id, "Billed"],
      }
    );
    project.dataValues.Team_Size = count[0].Team_Count;
    res.status(200).send({ message: " Project Details", payload: project });
  } else {
    res.send({ message: "Some Error Occurred Please Recheck" });
  }
});

//-----------------------------------------------------VIEW SPECIFIC PROJECT UPDATES----------------------------------------//
exports.ProjectUpdates = expressasynchandler(async (req, res) => {
  //Creating New Date
  const Today_Date = new Date();

  // console.log(
  //   Today_Date.getDate(),
  //   Today_Date.getMonth(),
  //   Today_Date.getFullYear()
  // );
  //Create Two Weeks Before Date
  const Two_Weeks_Before_Date = new Date();
  Two_Weeks_Before_Date.setDate(Today_Date.getDate() - 14);
  //console.log(Two_Weeks_Before_Date);
  //get updates
  let updates = await ProjectUpdate.findAll({
    where: {
      Project_id: req.params.proj_id,
      Updated_On: {
        [Op.between]: [Two_Weeks_Before_Date, Today_Date],
      },
    },
    //exclude attributes
    attributes: {
      exclude: ["Update_id", "Project_id"],
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
exports.TeamComposition = expressasynchandler(async (req, res) => {
  //get team details
  let TeamMembers = await TeamMember.findAll({
    where: { Project_id: req.params.proj_id },
    attributes: {
      exclude: ["id", "Project_id"],
    },
  });

  if (TeamMembers.length) {
    res
      .status(200)
      .send({ message: "Project Team Composition", payload: TeamMembers });
  } else {
    res.send({ message: "No Team Members Under This Project" });
  }
});

//-----------------------------------------------------VIEW SPECIFIC PROJECT CONCERNS----------------------------------------//
exports.ProjectConcerns = expressasynchandler(async (req, res) => {
  //get concerns
  let concerns = await Concern.findAll({
    where: { Project_id: req.params.proj_id },
    attributes: {
      exclude: ["Concern_id", "Concern_Indicator"],
    },
  });

  res
    .status(200)
    .send({ message: "Concerns Of This Project", payload: concerns });
});
