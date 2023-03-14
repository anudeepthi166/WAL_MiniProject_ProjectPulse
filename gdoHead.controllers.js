//import express-async-handler
const expressasynchandler = require("express-async-handler");

//import Model
const { Project } = require("../db/models/Project.model");
const { Client } = require("../db/models/Client.model");
const { TeamMember } = require("../db/models/TeamMembers.model");
const { sequelize } = require("../db/db.config");

//import Op
const { Op } = require("sequelize");

//----------------------------------------------------------ADD TEAM MEMBERS---------------------------------------------//
exports.AddTeamMembers = expressasynchandler(async (req, res) => {
  let TeamMembers = await TeamMember.create(req.body);
  if (TeamMembers) {
    res.status(201).send({
      message: "Team Details Added",
      payload: TeamMembers.dataValues,
    });
  }
});
//----------------------------------------------------------UPDATE TEAM MEMBERS---------------------------------------------//
exports.updatingTeamMembers = expressasynchandler(async (req, res) => {
  //Check Project Under This GDO
  let projects = await Project.findAll({
    where: { GDO_Head: req.params.gdoHead },
  });

  let result = false;
  let project_id = req.body.Project_id;
  for (let project of projects) {
    if (project.dataValues.Project_id == project_id) {
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

//----------------------------------------------------------UPDATE TEAM MEMBERS---------------------------------------------//
exports.deletingTeamMembers = expressasynchandler(async (req, res) => {
  //get project_id of that Employee(Team Member)
  let teamMember = await TeamMember.findOne({
    where: { Email: req.params.email },
  });
  if (teamMember) {
    //get projects under this gdo
    let projects = await Project.findAll({
      where: { GDO_Head: req.params.gdoHead },
    });
    let result = false;
    for (let project of projects) {
      console.log("-----------", project.dataValues.Project_id);
      if (project.dataValues.Project_id == teamMember.dataValues.Project_id) {
        result = true;
      }
    }
    if (result) {
      let deleted = await TeamMember.destroy({
        where: { Email: req.params.email },
      });

      if (deleted) {
        res.status(200).send({ message: "Deleted The Team Member" });
      } else {
        res.status(404).send({ message: "No Team Member with that Email" });
      }
    } else {
      res.send({ message: "This Team Member is under Another GDO Head" });
    }
  } else {
    res.status(404).send({ message: "Team Member not exists" });
  }
});

//--------------------------------------------------PORTFOLIO DASHBOARD-------------------------------------------------------//
exports.PortfolioDashboard = expressasynchandler(async (req, res) => {
  let bearerToken = req.headers.authorization;
  let Role = bearerToken.split(".")[3];
  if (Role == "GDO Head") {
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
      where: { GDO_Head: req.params.email },
    });

    //Send Response
    res.status(200).send({ message: "All Project Details", payload: projects });
  }
});

//--------------------------------------------------SPECIFIC PROJECT-------------------------------------------------------//
exports.ProjectPortfolioDashboard = expressasynchandler(async (req, res) => {
  let bearerToken = req.headers.authorization;
  let Role = bearerToken.split(".")[3];
  if (Role == "GDO Head") {
    //get details

    let project = await Project.findOne({
      where: { Project_id: req.params.project_id, GDO_Head: req.params.email },
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
    let [count] = await sequelize.query(
      "select count(Email) as Team_Count from Team_Members where Project_id=? and Billing_Status=?",
      {
        replacements: [req.params.project_id, "Billed"],
      }
    );
    if (project) {
      project.dataValues.Team_Size = count[0].Team_Count;
      res.status(200).send({ message: "Project", payload: project });
    } else {
      res
        .status(403)
        .send({ message: "Contact This Projetc GDO Head Or Admin" });
    }
  }
});

//-----------------------------------------------------VIEW SPECIFIC PROJECT DETAILS----------------------------------------//
exports.ProjectDetails = expressasynchandler(async (req, res) => {
  let bearerToken = req.headers.authorization;
  let Role = bearerToken.split(".")[3];
  if (Role == "GDO Head") {
    //Get Specific Project Details
    let project = await Project.findOne({
      where: { Project_id: req.params.project_id, GDO_Head: req.params.email },
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
      res.status(200).send({ message: " Project Details", payload: project });
    } else {
      res
        .status(403)
        .send({ message: " Contact This Project GDO Head Or Admin" });
    }
  }
});

//-----------------------------------------------------VIEW SPECIFIC PROJECT UPDATES----------------------------------------//
exports.ProjectUpdates = expressasynchandler(async (req, res) => {
  let bearerToken = req.headers.authorization;
  let Role = bearerToken.split(".")[3];
  if (Role == "GDO Head") {
    //Check Whether Project under this GDO Or Not
    let projects = await Project.findAll({
      where: { GDO_Head: req.params.email },
    });
    //Creating New Date
    const Today_Date = new Date();
    //Create Two Weeks Before Date
    const Two_Weeks_Before_Date = new Date();
    Two_Weeks_Before_Date.setDate(Today_Date.getDate() - 14);
    //get updates
    let updates = await sequelize.query(
      "select Project_Status_Update,Schedule_Status,Resourcing_Status,Quality_Status,Waiting_For_Client_Inputs,Updated_On from Projects  inner join Project_Updates where GDO_Head=? and Projects.Project_id=?",
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
exports.TeamComposition = expressasynchandler(async (req, res) => {
  let bearerToken = req.headers.authorization;
  let Role = bearerToken.split(".")[3];
  if (Role == "GDO Head") {
    //get team details
    let TeamMembers = await sequelize.query(
      "select Email,Role,Start_Date,End_Date,Status,Exposed_To_Client,Billing_Status from Projects inner join Team_Members where GDO_Head=? and Projects.Project_id=?",
      { replacements: [req.params.email, req.params.project_id] }
    );

    if (TeamMembers) {
      if (TeamMembers.length) {
        res.send({
          message: "Project Team Composition",
          payload: TeamMembers[0],
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
exports.ProjectConcerns = expressasynchandler(async (req, res) => {
  let bearerToken = req.headers.authorization;
  let Role = bearerToken.split(".")[3];
  if (Role == "GDO Head") {
    //get concerns

    let concerns = await sequelize.query(
      "select Projects.Project_id,Concern_Desc,Concern_Raised_By,Concern_Raised_On,Concern_Severity,Concern_Raised_From_Client,Concern_Status,Concern_Mitigated_Date from Projects inner join Concerns where GDO_Head=? and Projects.Project_id=?",
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
