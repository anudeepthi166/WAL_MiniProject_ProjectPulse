//import express-async-handler to handle asynchronous errors
const expressasynchandler = require("express-async-handler");

//import bcryptjs
const bcrypt = require("bcryptjs");

//import jsonwebtoken
const jwt = require("jsonwebtoken");

//configure dotenv to read environment variables
require("dotenv").config();

//import Employee,User model
const { Employee } = require("../db/models/employee.model");
//import Controller from admin
const { PotfolioDashboard } = require("./admin.controllers");

//import sequelize from db.config
const { sequelize } = require("../db/db.config");
const { Project } = require("../db/models/project.model");

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

//creating otps
let otps = {};

//-------------------------------------------Registration-------------------------------------//
exports.registeration = expressasynchandler(async (req, res) => {
  //Extract fields from request body
  let { email, employeeName, password } = req.body;

  //Check email domain
  if (
    /^([A-Za-z0-9_\.])+\@(westagilelabs|WESTAGILELABS)+\.(com)$/.test(email)
  ) {
    //Hash the password
    password = await bcrypt.hash(password, 5);

    //adding employee details to database
    let employee = await Employee.create({ email, employeeName, password });

    //sending employee details for conformation
    res
      .status(201)
      .send({ message: "Employee Added", payload: employee.dataValues });
  }
  //Not Valid Gmail id
  else {
    res.send({ message: "Register with the Organisation Email Only" });
  }
});

//-------------------------------------------Login-------------------------------------//
exports.login = expressasynchandler(async (req, res) => {
  //extract requset body
  let { email, password } = req.body;
  email = email.toLowerCase();

  //check email is organization email or not
  if (!/^([A-Za-z0-9_\.])+\@(westagilelabs)+\.(com)$/.test(email)) {
    res.send({
      message: "Only Organization Emails required ,Others Not Allowed",
    });
  }
  //Organization Email
  else {
    //check email exists or not
    let user = await Employee.findOne({ where: { email: email } });
    if (user) {
      //check Password

      let result = await bcrypt.compare(password, user.dataValues.password);
      if (result) {
        //check Role
        let role = user.dataValues.role;
        console.log("-------------------------", role);
        if (
          role == "adminUser" ||
          role == "gdoHead" ||
          role == "projectManager" ||
          role == "superAdmin" ||
          role == "hrManager"
        ) {
          //generate jwt token
          let signedToken = jwt.sign({}, process.env.SECRET_KEY, {
            expiresIn: "2d",
          });
          signedToken = signedToken.concat(" .").concat(role);
          //if role is admin user ,send all the project details
          if (role == "adminUser") {
            let dashboard = await Project.findAll();

            res.send({
              message: "login Success",
              token: signedToken,
              payload: dashboard,
            });
          }
          //
          if (role == "superAdmin") {
            let dashboard = await Employee.findAll({
              attributes: {
                exclude: ["employeeName", "password"],
              },
            });

            res.status(200).send({
              message: "login Success",
              token: signedToken,
              payload: dashboard,
            });
          } else {
            res.send({
              message: "login Success",
              token: signedToken,
            });
          }
        }

        //Other Role
        else {
          res.status(200).send({
            message:
              "Only Special Users Has Access, Contact Super Admin for more info",
          });
        }
      } else {
        res.status(401).send({ message: "Invalid Password" });
      }
    }
    //user not in Employees
    else {
      res.status(404).send({ message: "Employee Not Exists" });
    }
  }
});
//-------------------------------------------FORGOT PASSWORD-------------------------------------//
exports.forgotPassword = expressasynchandler(async (req, res) => {
  //generate6 digits OTP
  let otp = Math.floor(Math.random() * (999999 - 199999)) + 100000;
  //Add otp to otps{}
  otps[req.body.email] = otp;
  console.log(otps);
  //Write The Mail
  let mailOptions = {
    from: process.env.EMAIL,
    to: req.body.email,
    subject: "OTP TO RESET YOUR PASSWORD",
    text:
      "Hey ,We Received a request To CHANGE THE PASSWORD,If it is done by you,Please enter the following otp to Reset Your Password" +
      otp,
  };
  //Sending The Mail
  transporter.sendMail(mailOptions, function (err, info) {
    //Error Occurred
    if (err) {
      console.log("------ERROR-----", err);
    }
    //If no Error
    else {
      res.status(200).send({ message: "Mail Sent " + info.response });
    }
  });
  //Expire Time To OTP
  setTimeout(() => {
    delete otps[req.body.email];
  }, 6000000);
});

//-------------------------------------------RESET PASSWORD-------------------------------------//
exports.resetPassword = expressasynchandler(async (req, res) => {
  //Check OTP
  if (req.body.otp == otps[req.body.email]) {
    console.log("-------OTP VERIFIED-----");
    //Hash Th Password
    let hashedPassword = await bcrypt.hash(req.body.password, 5);

    let [updated] = await Employee.update(
      { password: hashedPassword },
      { where: { email: req.body.email } }
    );

    console.log(updated);
    if (updated) {
      res.send({ message: "Password Updated" });
    }
  } else {
    res.status(408).send({ message: "Invalid OTP" });
  }
});

//-------------------------------------------Role Mapping-------------------------------------//
exports.roleMapping = expressasynchandler(async (req, res) => {
  let { superAdmin, user, userRole } = req.body;
  let bearerToken = req.headers.authorization;
  let role = bearerToken.split(".")[3];
  //check Role
  if (role == "Super Admin") {
    let employee = await Employee.findOne({ where: { email: user } });

    //if employee exists assign role
    if (employee) {
      let [updatedCount] = await Employee.update(
        { role: req.body.userRole },
        { where: { email: req.body.user } }
      );

      if (updatedCount != 0) {
        res.status(200).send({
          message: "Role Mapped Successfully",
          payload: [user, userRole],
        });
      } else {
        res.send({
          message:
            "Unable To Map Roles Please Recheck the Role You Are Trying To Map",
        });
      }
    } else {
      res.status(404).send({ message: "Please Register the Employee" });
    }
  }
  //If not Super Admin
  else {
    res.send({ message: "Contact Super Admin" });
  }
});
