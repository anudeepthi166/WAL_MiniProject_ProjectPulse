//import express-async-handler
const expressasynchandler = require("express-async-handler");

//import  Model
const { Project } = require("../db/models/project.model");
const { Client } = require("../db/models/client.model");
const { ProjectUpdate } = require("../db/models/projectUpdate.model");
const { Concern } = require("../db/models/concern.model");
const { Resource_Request } = require("../db/models/resourceRequest.model");
const { sequelize } = require("../db/db.config");
const { User } = require("../db/models/User.model");
const { TeamMember } = require("../db/models/teamMembers.model");

// ASSOCIATION

// //Clent And Project
Client.Project = Client.hasMany(Project, {
  foreignKey: { name: "clientId" },
});
Project.Client = Project.belongsTo(Client, {
  foreignKey: { name: "clientId" },
});

// //Project And Concerns
Project.Concern = Project.hasMany(Concern, {
  foreignKey: { name: "projectId" },
  onDelete: "CASCADE",
});
Concern.Project = Concern.belongsTo(Project, {
  foreignKey: { name: "projectId" },
});

//Project And ProjectUpdate
Project.ProjectUpdate = Project.hasMany(ProjectUpdate, {
  foreignKey: { name: "projectId" },
  onDelete: "CASCADE",
});
UpdatesOfProject = ProjectUpdate.belongsTo(Project, {
  foreignKey: { name: "projectId" },
});

// //Project Team Members
Project.TeamMembers = Project.hasMany(TeamMember, {
  foreignKey: { name: "projectId" },
  onDelete: "CASCADE",
});
TeamMember.Project = TeamMember.belongsTo(Project, {
  foreignKey: { name: "projectId" },
});
// //Project and Resource Requests
Project.Resource_Request = Project.hasMany(Resource_Request, {
  foreignKey: { name: "projectId" },
  onDelete: "CASCADE",
});
Resource_Request.Project = Resource_Request.belongsTo(Project, {
  foreignKey: { name: "projectId" },
});

//import Op
const { Op } = require("sequelize");

//configure the dotenv
require("dotenv").config();

//----------------------------------------------------------RAISE CONCERNS---------------------------------------------//
exports.concerns = expressasynchandler(async (req, res) => {
  //get projects under this PROJECT MANAGER
  let projects = await Project.findOne({
    where: {
      [Op.and]: [
        { projectManager: req.params.email },
        { projectId: req.body.projectId },
      ],
    },
  });
  if (projects) {
    //check both Project_id's
    if (projects.dataValues.projectId == req.body.projectId) {
      //If equal perform the action
      let concerns = await Concern.create(req.body);
      if (concerns) {
        res.status(201).send({
          message: "Concern Raised",
          payload: concerns.dataValues,
        });
      }
    } else {
      res.send({ message: "This Project id under Another Project Manager" });
    }
  }
  //if not equal send the message
  else {
    res.send({ message: "Contact Admin to give access" });
  }
});

//----------------------------------------------------------Edit Concern--------------------------------------------//
exports.editConcern = expressasynchandler(async (req, res) => {
  //updating
  let [updated] = await Concern.update(req.body, {
    where: { concernId: req.body.concernId },
  });
  console.log(updated);
  res.send({ message: "Concern edited" });
});

//----------------------------------------------------------ADD PROJECT UPDATES--------------------------------------------//
exports.projectUpdating = expressasynchandler(async (req, res) => {
  //get projects under this PROJECT MANAGER
  let projects = await Project.findOne({
    where: {
      [Op.and]: [
        { projectManager: req.params.email },
        { projectId: req.body.projectId },
      ],
    },
  });
  //check both Project_id's
  if (projects) {
    if (projects.dataValues.projectId == req.body.projectId) {
      //If equal perform the action
      let updates = await ProjectUpdate.create(req.body);
      if (updates) {
        res.status(200).send({
          message: "Project Updates Added",
          payload: updates.dataValues,
        });
      }
    }
  }
  //if not equal send the message
  else {
    res.send({ message: "Contact admin to give access" });
  }
});

//--------------------------------------------------PORTFOLIO DASHBOARD-------------------------------------------------------//
exports.portfolioDashboard = expressasynchandler(async (req, res) => {
  let projects = await Project.findAll({
    //include model
    include: {
      model: Client,
      attributes: {
        exclude: ["clientId"],
      },
    },

    attributes: {
      exclude: ["clientId"],
    },
    where: {
      [Op.and]: [{ projectManager: req.params.email }, { deleteStatus: false }],
    },
  });

  //Send Response
  res.send({ message: "All Project Details", payload: projects });
});
// ----------------detaied view------------------------------------------//
exports.projectPorfolioDashboard = expressasynchandler(async (req, res) => {
  //get details

  let project = await Project.findOne({
    where: { projectId: req.params.projectId },
    //include model
    include: [
      { association: Project.ProjectUpdate },
      { association: Project.Concern },
      { association: Project.TeamMembers },
      { association: Project.Client },
    ],

    attributes: {
      exclude: ["gdoHead", "projectManager"],
    },
  });
  //get team Size
  let [count] = await sequelize.query(
    "select count(Email) as teamCount from teamMembers where projectId=? and billingStatus=?",
    {
      replacements: [req.params.projectId, "billed"],
    }
  );
  console.log(count);
  if (project) {
    project.dataValues.count = count[0].teamCount;
    console.log(project);
    res.status(200).send({ message: "Project", payload: project });
  } else {
    res.status(403).send({ message: "Contact This Projetc GDO Head Or Admin" });
  }
});
//-----------------------------------------------------VIEW SPECIFIC PROJECT DETAILS----------------------------------------//
exports.projectDetails = expressasynchandler(async (req, res) => {
  //Get Specific Project Details

  let project = await Project.findAll({
    where: {
      [Op.and]: [
        { projectManager: req.params.email },
        { projectId: req.params.projectId },
      ],
    },
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
    res.status(200).send({ message: " Project Details", payload: project });
  } else {
    res.send({ message: " Contact This Project's Project Manager Or Admin" });
  }
});

//-----------------------------------------------------VIEW SPECIFIC PROJECT UPDATES----------------------------------------//
exports.projectUpdates = expressasynchandler(async (req, res) => {
  //get projects under this PROJECT MANAGER
  let projects = await Project.findOne({
    where: {
      [Op.and]: [
        { projectManager: req.params.email },
        { projectId: req.params.projectId },
      ],
    },
  });

  //if projects are under this Project Manager
  if (projects) {
    //Creating New Date
    const today_Date = new Date();
    //Create Two Weeks Before Date
    const two_Weeks_Before_Date = new Date();
    two_Weeks_Before_Date.setDate(today_Date.getDate() - 14);

    //get updates
    // let [updates] = await sequelize.query(
    //   "select Project_Status_Update,Schedule_Status,Resourcing_Status,Quality_Status,Waiting_For_Client_Inputs,Updated_On from Project_Updates where Project_id=? and Updated_On BETWEEN(?,?)",
    //   {
    //     replacements: [
    //       projects.dataValues.Project_id,
    //       Two_Weeks_Before_Date,
    //       Today_Date,
    //     ],
    //   }
    // );
    let updates = await ProjectUpdate.findAll({
      where: {
        projectId: projects.dataValues.projectId,
        updatedOn: {
          [Op.between]: [two_Weeks_Before_Date, today_Date],
        },
      },
      //exclude attributes
      attributes: {
        exclude: ["update_id", "projectId"],
      },
    });

    if (updates.length) {
      res
        .status(200)
        .send({ message: "Updates Of This Project", payload: updates[0] });
    } else {
      res.send({
        message: "No Updates Added Regarding this Project",
      });
    }
  }
  //if no projects
  else {
    res.send({ message: "No Projects" });
  }
});

//-----------------------------------------------------VIEW SPECIFIC PROJECT TEAM COMPOSITION----------------------------------------//
exports.teamComposition = expressasynchandler(async (req, res) => {
  //get projects under this PROJECT MANAGER

  let projects = await Project.findAll({
    where: {
      projectManager: req.params.email,
    },
  });
  projects = projects.map((project) => project.dataValues.projectId);
  console.log(projects);
  //if projects are under this Project Manager
  if (projects) {
    //get team details
    let teamMembers = await sequelize.query(
      "select email,role,startDate,endDate,status,exposedToClient,billingStatus from teamMembers where projectId in(?)",
      { replacements: [projects] }
    );

    if (teamMembers) {
      if (teamMembers[0].length) {
        res.send({
          message: "Project Team Composition",
          payload: teamMembers[0],
        });
      } else {
        res.send({ message: "No Team Members Under This Project" });
      }
    }
  } else {
    res.send({ message: " Contact This Project GDO Head Or Admin" });
  }
});

//-----------------------------------------------------VIEW SPECIFIC PROJECT CONCERNS----------------------------------------//
exports.projectConcerns = expressasynchandler(async (req, res) => {
  //get projects under this PROJECT MANAGER
  let projects = await Project.findAll({
    where: {
      [Op.and]: [
        { projectManager: req.params.email },
        { projectId: req.params.projectId },
      ],
    },
  });
  projects = projects.map((project) => project.dataValues.projectId);
  console.log(projects);

  //if projects are under this Project Manager
  if (projects) {
    //get concerns

    let concerns = await sequelize.query(
      "select projectId,concernDesc,concernRaisedBy,concernRaisedOn,concernSeverity,concernRaisedFromClient,concernStatus,concernMitigatedDate from concerns where projectId=?",
      { replacements: [projects[0]] }
    );
    console.log("--------------------", concerns);
    if (concerns[0].length) {
      res
        .status(200)
        .send({ message: "Concerns Of This Project", payload: concerns[0] });
    } else {
      res.send({ message: "No Concerns Raised For This Project" });
    }
  } else {
    res.send({ message: " Contact This Project GDO Head Or Admin" });
  }
});
