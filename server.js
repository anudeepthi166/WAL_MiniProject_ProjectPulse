//import express
const express = require("express");
const app = express();

//import sequelize from db.config
const { sequelize } = require("./db/db.config");

//import Routes from routes
const userApp = require("./routes/user.routes");
const AdminApp = require("./routes/admin.routes");
const projectManagerApp = require("./routes/projectManager.routes");
const gdoHeadApp = require("./routes/gdoHead.routes");

//import models
const { Employee } = require("./db/models/Employee.model");
const { Project } = require("./db/models/Project.model");
const { Client } = require("./db/models/Client.model");
const { ProjectUpdate } = require("./db/models/ProjectUpdate.model");
const { Resource_Request } = require("./db/models/ResourceRequest.model");
const { Concern } = require("./db/models/Concern.model");
const { TeamMember } = require("./db/models/TeamMembers.model");

//import middlewares
const {
  SuperAdminVerifyToken,
} = require("./middlewares/SuperAdmin.Verify.Token");
const {
  ProjectManagerVerifyToken,
} = require("./middlewares/ProjectManager.Verify.Token");
const {
  AdminUserVerifyToken,
} = require("./middlewares/AdminUser.Verify.Token");
const { GdoHeadVerifyToken } = require("./middlewares/GdoHead.Verify.Token");

//configuring dotnev
require("dotenv").config();

//Associations
//Employee And Project
GdoHeadProject = Employee.hasMany(Project, {
  foreignKey: { name: "GDO_Head" },
});
ProjectGdoHead = Project.belongsTo(Employee, {
  foreignKey: { name: "GDO_Head" },
});

//Clent And Project
ClientProject = Client.hasMany(Project, {
  foreignKey: { name: "Client_id" },
});
ProjectClient = Project.belongsTo(Client, {
  foreignKey: { name: "Client_id" },
});

//Project And Concerns
ProjectConcern = Project.hasMany(Concern, {
  foreignKey: { name: "Project_id" },
  onDelete: "CASCADE",
});
ConcernOfProject = Concern.belongsTo(Project, {
  foreignKey: { name: "Project_id" },
});

//Project And ProjectUpdate
let ProjectUpdates = Project.hasMany(ProjectUpdate, {
  foreignKey: { name: "Project_id" },
  onDelete: "CASCADE",
});
UpdatesOfProject = ProjectUpdate.belongsTo(Project, {
  foreignKey: { name: "Project_id" },
});

//Project Team Members
ProjectTeamMembers = Project.hasMany(TeamMember, {
  foreignKey: { name: "Project_id" },
  onDelete: "CASCADE",
});
TeamMeamberOfProject = TeamMember.belongsTo(Project, {
  foreignKey: { name: "Project_id" },
});
//Project and Resource Requests
ProjectResource = Project.hasMany(Resource_Request, {
  foreignKey: { name: "Project_id" },
  onDelete: "CASCADE",
});
ResourcesOfProject = Resource_Request.belongsTo(Project, {
  foreignKey: { name: "Project_id" },
});

//starting server
const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server Running On ${PORT}. . .`));

//Checking the DB Connection
sequelize
  .authenticate()
  .then(() => console.log("DB Connected"))
  .catch((err) => console.log(err.message));

//To create a tables
sequelize.sync();

//defining routes
app.use("/Pulse/Employee", userApp);
app.use("/Pulse/Admin", AdminUserVerifyToken, AdminApp);
app.use("/Pulse/GDOHead", GdoHeadVerifyToken, gdoHeadApp);
app.use("/Pulse/ProjectManager", ProjectManagerVerifyToken, projectManagerApp);

//Error Handler for Invalid Path
app.use("*", (req, res) => res.send({ message: "Invalid Path" }));

//Error Handler
app.use((err, req, res, next) => {
  res.send({ message: err.message });
});
