//import express-async-handler
const expressasynchandler = require("express-async-handler");

//import Model
const { Project } = require("../db/models/project.model");
const { Concern } = require("../db/models/concern.model");
const { ProjectUpdate } = require("../db/models/projectUpdate.model");
const { Resource_Request } = require("../db/models/resourceRequest.model");
const { Client } = require("../db/models/client.model");
const { TeamMember } = require("../db/models/teamMembers.model");
const { sequelize } = require("../db/db.config");
const { User } = require("../db/models/User.model");

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

//----------------------------------------------------------RAISE RESOURCE REQUEST---------------------------------------------//
exports.raiseResourceRequest = expressasynchandler(async (req, res) => {
  //get projects under this PROJECT MANAGER
  console.log("______body", req.body);
  let projects = await Project.findOne({
    where: {
      [Op.and]: [
        { gdoHead: req.params.email },
        { projectId: req.body.projectId },
      ],
    },
  });
  if (projects) {
    //check both Project_id's
    if (projects.dataValues.projectId == req.body.projectId) {
      //If equal perform the action
      let resource = await Resource_Request.create(req.body);
      console.log(resource);

      if (resource) {
        //Get The GDO AND ADMIN
        let gdoHead = await Project.findOne({
          where: { projectId: req.body.projectId },
        });

        let admin = await User.findAll({ where: { role: "adminUser" } });

        let admins = admin.map((userObject) => userObject.dataValues.email);

        //Write The Mail
        let mailOptions = {
          from: process.env.EMAIL,
          to: [gdoHead.dataValues.GDO_Head, admins],
          subject: "Resource Request Raised ",
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
    res.send({
      message: "Contact admin to give access this project is not under you",
    });
  }
});

//----------------------------------------------------------ADD TEAM MEMBERS---------------------------------------------//
exports.addTeamMembers = expressasynchandler(async (req, res) => {
  //inserti into teamMembers Table
  console.log(req.body);
  //find employee in emplouyees table
  let [employee] = await sequelize.query(
    "select * from employees where email=?",
    {
      replacements: [req.body.email],
    }
  );
  //If emploee exists add to Team
  if (employee.length) {
    let teamMembers = await TeamMember.create(req.body);

    if (teamMembers) {
      res.status(201).send({
        message: "Team Details Added",
        payload: teamMembers.dataValues,
      });
    }
  } else {
    res.send({ message: "Employee with that mail not exists" });
  }
});
//----------------------------------------------------------UPDATE TEAM MEMBERS---------------------------------------------//
exports.updatingTeamMembers = expressasynchandler(async (req, res) => {
  //Check Project Under This GDO
  let projects = await Project.findAll({
    where: { gdoHead: req.params.gdoHead },
  });

  let result = false;
  let project_id = req.body.projectId;
  for (let project of projects) {
    if (project.dataValues.projectId == project_id) {
      result = true;
    }
  }
  if (result) {
    let [updated] = await TeamMember.update(req.body, {
      where: {
        [Op.and]: [{ projectId: project_id }, { email: req.body.email }],
      },
    });

    if (updated) {
      res.status(201).send({ message: "Updated Team Member Details " });
    }
  } else {
    res.send({ mesage: "This Project is Under Another GDO Head" });
  }
});

//----------------------------------------------------------DELETE TEAM MEMBERS---------------------------------------------//
exports.deletingTeamMembers = expressasynchandler(async (req, res) => {
  //get project_id of that User(Team Member)
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
      [Op.and]: [{ gdoHead: req.params.email }, { deleteStatus: false }],
    },
  });

  //Send Response
  res.send({ message: "All Project Details", payload: projects });
});

//--------------------------------------------------SPECIFIC PROJECT-------------------------------------------------------//
exports.projectPortfolioDashboard = expressasynchandler(async (req, res) => {
  //get details

  let project = await Project.findOne({
    where: { projectId: req.params.project_id },
    //include model
    include: [
      { association: Project.ProjectUpdate },
      { association: Project.Concern },
      { association: Project.TeamMembers },
      { association: Project.Client },
    ],

    attributes: {
      exclude: ["clientId"],
    },
  });
  //get team Size
  let [count] = await sequelize.query(
    "select count(Email) as teamCount from teamMembers where projectId=? and billingStatus=?",
    {
      replacements: [req.params.project_id, "billed"],
    }
  );
  console.log("----", count[0].teamCount);
  if (project) {
    project.dataValues.count = count[0].teamCount;
    console.log(project.dataValues);
    res.status(200).send({ message: "Project", payload: project });
  } else {
    res.status(403).send({ message: "Contact This Projetc GDO Head Or Admin" });
  }
});

//-----------------------------------------------------VIEW SPECIFIC PROJECT DETAILS----------------------------------------//
exports.projectDetails = expressasynchandler(async (req, res) => {
  //Get Specific Project Details
  let project = await Project.findOne({
    where: {
      [Op.and]: [
        { projectId: req.params.project_id },
        { gdoHead: req.params.email },
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
    res
      .status(403)
      .send({ message: " Contact This Project GDO Head Or Admin" });
  }
});

//-----------------------------------------------------VIEW SPECIFIC PROJECT UPDATES----------------------------------------//
exports.projectUpdates = expressasynchandler(async (req, res) => {
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
});

//-----------------------------------------------------VIEW SPECIFIC PROJECT TEAM COMPOSITION----------------------------------------//
exports.teamComposition = expressasynchandler(async (req, res) => {
  //get team details
  let teamMembers = await sequelize.query(
    "select email,role,startDate,endDate,status,exposedToClient,billingStatus from projects inner join teamMembers where gdoHead=? and projects.projectId=?",
    { replacements: [req.params.email, req.params.project_id] }
  );
  //Check team members exists or not
  console.log(teamMembers);
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
});

//-----------------------------------------------------VIEW SPECIFIC PROJECT CONCERNS----------------------------------------//
exports.projectConcerns = expressasynchandler(async (req, res) => {
  //get projects under this GDO
  let projects = await Project.findAll({
    where: {
      [Op.and]: [
        { gdoHead: req.params.email },
        { projectId: req.params.project_id },
      ],
    },
  });

  projects = projects.map((project) => project.dataValues.projectId);
  console.log(projects);
  //get concerns

  let concerns = await Concern.findAll({
    where: { projectId: projects[0] },
    attributes: {
      exclude: ["concerId"],
    },
  });
  //if any concerns send them

  if (concerns) {
    res
      .status(200)
      .send({ message: "Concerns Of This Project", payload: concerns[0] });
  } else {
    res.send({ message: " Contact This Project GDO Head Or Admin" });
  }
});

//-----------------------------------------------------VIEW RESOURCE REQUEST----------------------------------------//
exports.resourceRequest = expressasynchandler(async (req, res) => {
  //get projects under gdo
  let projects = await Project.findAll({
    where: {
      gdoHead: req.params.email,
    },
  });
  //check pojects exists or not

  projects = projects.map((project) => project.dataValues.projectId);
  console.log("------------", projects);
  if (projects.length) {
    //get project Ids and resource request
    let resources = await sequelize.query(
      "select id,requestRaisedBy,projectId,resourceDesc from resourceRequests  where projectId in(?)",
      { replacements: [projects] }
    );

    if (resources) {
      res
        .status(200)
        .send({ message: "Resource Request", payload: resources[0] });
    }
  } else {
    res
      .status(404)
      .send({ message: "No resource Requests for the projects under you" });
  }
});

//-----------------------------------------------------VIEW Concerns----------------------------------------//
exports.allconcerns = expressasynchandler(async (req, res) => {
  //get projects under gdo
  let projects = await Project.findAll({
    where: {
      gdoHead: req.params.email,
    },
  });
  //check pojects exists or not
  if (projects)
    projects = projects.map((project) => project.dataValues.projectId);
  console.log("------------", projects);
  //get project Ids and resource request
  let concerns = await sequelize.query(
    "select * from concerns  where projectId in(?)",
    { replacements: [projects] }
  );

  if (concerns) {
    res.status(200).send({ message: "Concern", payload: concerns[0] });
  }
});
