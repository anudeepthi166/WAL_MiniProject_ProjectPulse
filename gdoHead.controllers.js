//import express-async-handler
const expressasynchandler = require("express-async-handler");

//import Model
const { Project } = require("../db/models/project.model");
const { Resource_Request } = require("../db/models/resourceRequest.model");
const { Client } = require("../db/models/client.model");
const { TeamMember } = require("../db/models/teamMembers.model");
const { sequelize } = require("../db/db.config");

//import Op
const { Op } = require("sequelize");

//----------------------------------------------------------ADD TEAM MEMBERS---------------------------------------------//
exports.addTeamMembers = expressasynchandler(async (req, res) => {
  //inserti into teamMembers Table
  let teamMembers = await TeamMember.create(req.body);
  if (teamMembers) {
    res.status(201).send({
      message: "Team Details Added",
      payload: teamMembers.dataValues,
    });
  }
});
//----------------------------------------------------------UPDATE TEAM MEMBERS---------------------------------------------//
exports.updatingTeamMembers = expressasynchandler(async (req, res) => {
  //Check Project Under This GDO
  let projects = await Project.findAll({
    where: { gdoHead: req.params.gdoHead },
  });

  let result = false;
  let project_id = req.body.project_id;
  for (let project of projects) {
    if (project.dataValues.projectId == project_id) {
      result = true;
    }
  }
  if (result) {
    let [updated] = await TeamMember.update(req.body, {
      where: { Email: req.body.Email },
    });

    if (updated) {
      res.status(205).send({ message: "Updated Team Member Details " });
    }
  } else {
    res.status(403).send({ mesage: "This Project is Under Another GDO Head" });
  }
});

//----------------------------------------------------------DELETE TEAM MEMBERS---------------------------------------------//
exports.deletingTeamMembers = expressasynchandler(async (req, res) => {
  //get project_id of that Employee(Team Member)
  let teamMember = await TeamMember.findOne({
    where: { email: req.params.email },
  });
  if (teamMember) {
    //get projects under this gdo
    let projects = await Project.findAll({
      where: { gdoHead: req.params.gdoHead },
    });
    let result = false;
    for (let project of projects) {
      //console.log("-----------", project.dataValues.Project_id);
      if (project.dataValues.projectId == teamMember.dataValues.projectId) {
        result = true;
      }
    }
    if (result) {
      //delete the memeber from Team
      let deleted = await TeamMember.destroy({
        where: { Email: req.params.email },
      });

      //deleted
      if (deleted) {
        res.status(200).send({ message: "Deleted The Team Member" });
      }
      //Not deleted
      else {
        res.status(404).send({ message: "No Team Member with that Email" });
      }
    }
    //
    else {
      res.send({ message: "This Team Member is under Another GDO Head" });
    }
  }
  //Team Member Not Exists
  else {
    res.status(404).send({ message: "Team Member not exists" });
  }
});

//--------------------------------------------------PORTFOLIO DASHBOARD-------------------------------------------------------//
exports.portfolioDashboard = expressasynchandler(async (req, res) => {
  let bearerToken = req.headers.authorization;
  let role = bearerToken.split(".")[3];
  if (role == "GDO Head") {
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
      where: { gdoHead: req.params.email },
    });

    //Send Response
    res.status(200).send({ message: "All Project Details", payload: projects });
  }
});

//--------------------------------------------------SPECIFIC PROJECT-------------------------------------------------------//
exports.projectPortfolioDashboard = expressasynchandler(async (req, res) => {
  let bearerToken = req.headers.authorization;
  let role = bearerToken.split(".")[3];
  if (role == "GDO Head") {
    //get details

    let project = await Project.findOne({
      where: { projectId: req.params.project_id, gdoHead: req.params.email },
      attributes: {
        exclude: [
          "project_id",
          "project_Name",
          "gdoHead",
          "projectManager",
          "projectStatus",
          "projectStartDate",
          "projectEndDate",
          "projectDomain",
          "projectType",
          "clientId",
        ],
      },
    });
    let [count] = await sequelize.query(
      "select count(Email) as teamCount from teamMembers where projectId=? and billingStatus=?",
      {
        replacements: [req.params.project_id, "Billed"],
      }
    );
    if (project) {
      project.dataValues.teamSize = count[0].teamcount;
      res.status(200).send({ message: "Project", payload: project });
    } else {
      res
        .status(403)
        .send({ message: "Contact This Projetc GDO Head Or Admin" });
    }
  }
});

//-----------------------------------------------------VIEW SPECIFIC PROJECT DETAILS----------------------------------------//
exports.projectDetails = expressasynchandler(async (req, res) => {
  let bearerToken = req.headers.authorization;
  let role = bearerToken.split(".")[3];
  if (role == "GDO Head") {
    //Get Specific Project Details
    let project = await Project.findOne({
      where: { projectId: req.params.project_id, gdoHead: req.params.email },
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
      res
        .status(403)
        .send({ message: " Contact This Project GDO Head Or Admin" });
    }
  }
});

//-----------------------------------------------------VIEW SPECIFIC PROJECT UPDATES----------------------------------------//
exports.projectUpdates = expressasynchandler(async (req, res) => {
  let bearerToken = req.headers.authorization;
  let Role = bearerToken.split(".")[3];
  if (Role == "GDO Head") {
    //Check Whether Project under this GDO Or Not
    let projects = await Project.findAll({
      where: { gdoHead: req.params.email },
    });
    //Creating New Date
    const today_Date = new Date();
    //Create Two Weeks Before Date
    const two_Weeks_Before_Date = new Date();
    two_Weeks_Before_Date.setDate(today_Date.getDate() - 14);
    //get updates
    let updates = await sequelize.query(
      "select projectStatusUpdate,ScheduleStatus,ResourcingStatus,QualityStatus,WaitingForClientInputs,UpdatedOn from projects  inner join projectUpdates where gdoHead=? and projects.projectId=?",
      {
        replacements: [req.params.email, req.params.project_id],
      }
    );

    if (updates) {
      res
        .status(200)
        .send({ message: "Updates Of This Project", payload: updates });
    } else {
      res.send({ message: " Contact This Project GDO Head Or Admin" });
    }
  }
});

//-----------------------------------------------------VIEW SPECIFIC PROJECT TEAM COMPOSITION----------------------------------------//
exports.teamComposition = expressasynchandler(async (req, res) => {
  let bearerToken = req.headers.authorization;
  let role = bearerToken.split(".")[3];
  if (role == "GDO Head") {
    //get team details
    let teamMembers = await sequelize.query(
      "select email,role,startDate,endDate,status,exposedToClient,billingStatus from projects inner join teamMembers where gdoHead=? and projects.projectId=?",
      { replacements: [req.params.email, req.params.project_id] }
    );

    if (teamMembers) {
      if (teamMembers.length) {
        res.send({
          message: "Project Team Composition",
          payload: teamMembers[0],
        });
      } else {
        res.status(200).send({ message: "No Team Members Under This Project" });
      }
    } else {
      res.send({ message: " Contact This Project GDO Head Or Admin" });
    }
  }
});

//-----------------------------------------------------VIEW SPECIFIC PROJECT CONCERNS----------------------------------------//
exports.projectConcerns = expressasynchandler(async (req, res) => {
  let bearerToken = req.headers.authorization;
  let role = bearerToken.split(".")[3];
  if (role == "GDO Head") {
    //get concerns

    let concerns = await sequelize.query(
      "select projects.projectId,concernDesc,concernRaisedBy,concernRaisedOn,ConcernSeverity,ConcernRaisedFromClient,ConcernStatus,ConcernMitigatedDate from projects inner join concerns where gdoHead=? and projects.projectId=?",
      { replacements: [req.params.email, req.params.project_id] }
    );

    if (concerns) {
      res
        .status(200)
        .send({ message: "Concerns Of This Project", payload: concerns[0] });
    } else {
      res.send({ message: " Contact This Project GDO Head Or Admin" });
    }
  }
});

//-----------------------------------------------------VIEW RESOURCE REQUEST----------------------------------------//
exports.resourceRequest = expressasynchandler(async (req, res) => {
  //get resource requests
  let resources = await sequelize.query(
    "select requestRaisedBy,projects.projectId,resourceDesc from resourceRequests inner join projects where gdoHead=?",
    { replacements: [req.params.email] }
  );
  if (resources) {
    res.status(200).send({ message: "Resource Request", payload: resources });
  }
});
