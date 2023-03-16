//import express-async-handler
const expressasynchandler = require("express-async-handler");

//import  Model
const { Project } = require("../db/models/project.model");
const { Client } = require("../db/models/client.model");
const { ProjectUpdate } = require("../db/models/projectUpdate.model");
const { Concern } = require("../db/models/concern.model");
const { Resource_Request } = require("../db/models/resourceRequest.model");
const { sequelize } = require("../db/db.config");
const { Employee } = require("../db/models/employee.model");

//import Op
const { Op } = require("sequelize");

//configure the dotenv
require("dotenv").config();

//----------------Nodemailer--------------------------//
//import nodemailer
const nodemailer = require("nodemailer");
//create connectio to SMTP
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE_PROVIDER,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

//----------------------------------------------------------RAISE CONCERNS---------------------------------------------//
exports.concerns = expressasynchandler(async (req, res) => {
  //get projects under this PROJECT MANAGER
  let projects = await Project.findOne({
    where: { projectManager: req.params.email },
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
    res.send({ message: "Contact GDO Head to give access" });
  }
});

//----------------------------------------------------------ADD PROJECT UPDATES--------------------------------------------//
exports.projectUpdating = expressasynchandler(async (req, res) => {
  //get projects under this PROJECT MANAGER
  let projects = await Project.findOne({
    where: { projectManager: req.params.email },
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
    res.send({ message: "Contact GDO Head to give access" });
  }
});

//----------------------------------------------------------RAISE RESOURCE REQUEST---------------------------------------------//
exports.resourceRequest = expressasynchandler(async (req, res) => {
  //get projects under this PROJECT MANAGER
  let projects = await Project.findOne({
    where: { projectManager: req.params.email },
  });
  if (projects) {
    //check both Project_id's
    if (projects.dataValues.projectId == req.body.projectId) {
      //If equal perform the action
      let resource = await Resource_Request.create(req.body);

      if (resource) {
        //Get The GDO AND ADMIN
        let gdoHead = await Project.findOne({
          where: { projectId: req.body.projectId },
        });

        let admin = await Employee.findAll({ where: { role: "Admin User" } });

        let admins = admin.map((userObject) => userObject.dataValues.email);

        //Write The Mail
        let mailOptions = {
          from: process.env.EMAIL,
          to: [gdoHead.dataValues.GDO_Head, admins],
          subject: "OTP TO RESET YOUR PASSWORD",
          text:
            " Hey SomeOne Raised the Resource Request for the Projects Under Your  Surveillance,See Who Raised These Requests ,  Resourcing Request Raised By " +
            req.body.Request_Raised_By,
        };
        //Sending The Mail
        transporter.sendMail(mailOptions, function (err, info) {
          //Error Occurred
          if (err) {
            console.log("------ERROR-----", err);
          }
          //If no Error
          else {
            res.send({ message: "Mail Sent " + info.response });
          }
        });
        res.status(201).send({
          message: "Resource Requesting Done",
          payload: resource.dataValues,
        });
      }
    }
  }
  //if not equal send the message
  else {
    res.send({ message: "Contact GDO Head to give access" });
  }
});

//-----------------------------------------------------VIEW SPECIFIC PROJECT DETAILS----------------------------------------//
exports.projectDetails = expressasynchandler(async (req, res) => {
  //Get Specific Project Details

  let project = await Project.findOne({
    where: { projectManager: req.params.email },
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
    where: { projectManager: req.params.email },
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
  let projects = await Project.findOne({
    where: { projectManager: req.params.email },
  });

  //if projects are under this Project Manager
  if (projects) {
    //get team details
    let teamMembers = await sequelize.query(
      "select email,role,startDate,endDate,status,exposedToClient,billingStatus from teamMembers where projectId=?",
      { replacements: [projects.dataValues.projectId] }
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
  let projects = await Project.findOne({
    where: { projectManager: req.params.email },
  });

  //if projects are under this Project Manager
  if (projects) {
    //get concerns

    let concerns = await sequelize.query(
      "select projects.projectId,concernDesc,concernRaisedBy,concernRaisedOn,concernSeverity,concernRaisedFromClient,concernStatus,concernMitigatedDate from projects inner join concerns where concerns.projectId=?",
      { replacements: [projects.dataValues.projectId] }
    );

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
