//import express-async-handler
const expressasynchandler = require("express-async-handler");

//import  Model
const { Project } = require("../db/models/Project.model");
const { Client } = require("../db/models/Client.model");
const { ProjectUpdate } = require("../db/models/ProjectUpdate.model");
const { Concern } = require("../db/models/Concern.model");
const { Resource_Request } = require("../db/models/ResourceRequest.model");
const { sequelize } = require("../db/db.config");
const { Employee } = require("../db/models/Employee.model");

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
exports.Concerns = expressasynchandler(async (req, res) => {
  //get projects under this PROJECT MANAGER
  let projects = await Project.findOne({
    where: { Project_Manager: req.params.email },
  });
  if (projects) {
    //check both Project_id's
    if (projects.dataValues.Project_id == req.body.Project_id) {
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
exports.ProjectUpdating = expressasynchandler(async (req, res) => {
  //get projects under this PROJECT MANAGER
  let projects = await Project.findOne({
    where: { Project_Manager: req.params.email },
  });
  //check both Project_id's
  if (projects) {
    if (projects.dataValues.Project_id == req.body.Project_id) {
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
exports.Resource_Request = expressasynchandler(async (req, res) => {
  //get projects under this PROJECT MANAGER
  let projects = await Project.findOne({
    where: { Project_Manager: req.params.email },
  });
  if (projects) {
    //check both Project_id's
    if (projects.dataValues.Project_id == req.body.Project_id) {
      //If equal perform the action
      let resource = await Resource_Request.create(req.body);

      if (resource) {
        //Get The GDO AND ADMIN
        let gdoHead = await Project.findOne({
          where: { Project_id: req.body.Project_id },
        });

        let admin = await Employee.findAll({ where: { Role: "Admin User" } });

        let admins = admin.map((userObject) => userObject.dataValues.Email);

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
exports.ProjectDetails = expressasynchandler(async (req, res) => {
  //Get Specific Project Details

  let project = await Project.findOne({
    where: { Project_Manager: req.params.email },
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
    res.send({ message: " Contact This Project's Project Manager Or Admin" });
  }
});

//-----------------------------------------------------VIEW SPECIFIC PROJECT UPDATES----------------------------------------//
exports.ProjectUpdates = expressasynchandler(async (req, res) => {
  //get projects under this PROJECT MANAGER
  let projects = await Project.findOne({
    where: { Project_Manager: req.params.email },
  });

  //if projects are under this Project Manager
  if (projects) {
    //Creating New Date
    const Today_Date = new Date();
    //Create Two Weeks Before Date
    const Two_Weeks_Before_Date = new Date();
    Two_Weeks_Before_Date.setDate(Today_Date.getDate() - 14);

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
        Project_id: projects.dataValues.Project_id,
        Updated_On: {
          [Op.between]: [Two_Weeks_Before_Date, Today_Date],
        },
      },
      //exclude attributes
      attributes: {
        exclude: ["Update_id", "Project_id"],
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
    res.status(204).send({ message: "No Projects" });
  }
});

//-----------------------------------------------------VIEW SPECIFIC PROJECT TEAM COMPOSITION----------------------------------------//
exports.TeamComposition = expressasynchandler(async (req, res) => {
  //get projects under this PROJECT MANAGER
  let projects = await Project.findOne({
    where: { Project_Manager: req.params.email },
  });

  //if projects are under this Project Manager
  if (projects) {
    //get team details
    let TeamMembers = await sequelize.query(
      "select Email,Role,Start_Date,End_Date,Status,Exposed_To_Client,Billing_Status from Team_Members where Project_id=?",
      { replacements: [projects.dataValues.Project_id] }
    );

    if (TeamMembers) {
      if (TeamMembers[0].length) {
        res.send({
          message: "Project Team Composition",
          payload: TeamMembers[0],
        });
      } else {
        res.status(204).send({ message: "No Team Members Under This Project" });
      }
    }
  } else {
    res.send({ message: " Contact This Project GDO Head Or Admin" });
  }
});

//-----------------------------------------------------VIEW SPECIFIC PROJECT CONCERNS----------------------------------------//
exports.ProjectConcerns = expressasynchandler(async (req, res) => {
  //get projects under this PROJECT MANAGER
  let projects = await Project.findOne({
    where: { Project_Manager: req.params.email },
  });

  //if projects are under this Project Manager
  if (projects) {
    //get concerns

    let concerns = await sequelize.query(
      "select Projects.Project_id,Concern_Desc,Concern_Raised_By,Concern_Raised_On,Concern_Severity,Concern_Raised_From_Client,Concern_Status,Concern_Mitigated_Date from Projects inner join Concerns where Concerns.Project_id=?",
      { replacements: [projects.dataValues.Project_id] }
    );

    if (concerns[0].length) {
      res
        .status(200)
        .send({ message: "Concerns Of This Project", payload: concerns[0] });
    } else {
      res.status(204).send({ message: "No Concerns Raised For This Project" });
    }
  } else {
    res.send({ message: " Contact This Project GDO Head Or Admin" });
  }
});
