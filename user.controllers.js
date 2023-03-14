//import express-async-handler to handle asynchronous errors
const expressasynchandler = require("express-async-handler");

//import bcryptjs
const bcrypt = require("bcryptjs");

//import jsonwebtoken
const jwt = require("jsonwebtoken");

//configure dotenv to read environment variables
require("dotenv").config();

//import Employee,User model
const { Employee } = require("../db/models/Employee.model");
//import Controller from admin
const { PotfolioDashboard } = require("./admin.controllers");

//import sequelize from db.config
const { sequelize } = require("../db/db.config");
const { Project } = require("../db/models/Project.model");

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
  let { Email, Employee_Name, Password } = req.body;

  //Check email domain
  if (
    /^([A-Za-z0-9_\.])+\@(westagilelabs|WESTAGILELABS)+\.(com)$/.test(Email)
  ) {
    //Hash the password
    Password = await bcrypt.hash(Password, 5);

    //adding employee details to database
    let employee = await Employee.create({ Email, Employee_Name, Password });
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
  let { Email, Password } = req.body;
  Email = Email.toLowerCase();

  //check email is organization email or not
  if (!/^([A-Za-z0-9_\.])+\@(westagilelabs)+\.(com)$/.test(Email)) {
    res.send({
      message: "Only Organization Emails required ,Others Not Allowed",
    });
  }
  //Organization Email
  else {
    //check email exists or not
    let user = await Employee.findOne({ where: { Email: Email } });
    if (user) {
      //check Password

      let result = await bcrypt.compare(Password, user.dataValues.Password);
      if (result) {
        //check Role
        let Role = user.dataValues.Role;
        console.log("-------------------------", Role);
        if (
          Role == "Admin User" ||
          Role == "GDO Head" ||
          Role == "Project Manager" ||
          Role == "Super Admin" ||
          Role == "HR Manager"
        ) {
          //generate jwt token
          let signedToken = jwt.sign({}, process.env.SECRET_KEY, {
            expiresIn: "2d",
          });
          signedToken = signedToken.concat(" .").concat(Role);

          if (Role == "Admin User") {
            let dashboard = await Project.findAll();

            res.send({
              message: "login Success",
              token: signedToken,
              payload: dashboard,
            });
          }
          if (Role == "Super Admin") {
            let dashboard = await Employee.findAll({
              attributes: {
                exclude: ["Employee_Name", "Password"],
              },
            });

            res.send({
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
        res.send({ message: "Invalid Password" });
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
  otps[req.body.Email] = otp;
  console.log(otps);
  //Write The Mail
  let mailOptions = {
    from: process.env.EMAIL,
    to: req.body.Email,
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
    delete otps[req.body.Email];
  }, 6000000);
});

//-------------------------------------------RESET PASSWORD-------------------------------------//
exports.resetPassword = expressasynchandler(async (req, res) => {
  //Check OTP
  if (req.body.OTP == otps[req.body.Email]) {
    console.log("-------OTP VERIFIED-----");
    //Hash Th Password
    let hashedPassword = await bcrypt.hash(req.body.Password, 5);

    let updated = await Employee.update(
      { Password: hashedPassword },
      { where: { Email: req.body.Email } }
    );

    if (updated) {
      res.status(205).send({ message: "Password Updated" });
    }
  } else {
    res.status(408).send({ message: "Invalid OTP" });
  }
});

//-------------------------------------------Role Mapping-------------------------------------//
exports.RoleMapping = expressasynchandler(async (req, res) => {
  let { SuperAdmin, user, userRole } = req.body;
  let bearerToken = req.headers.authorization;
  let Role = bearerToken.split(".")[3];
  //check Role
  if (Role == "Super Admin") {
    let employee = await Employee.findOne({ where: { Email: user } });

    //if employee exists assign role
    if (employee) {
      let [updatedCount] = await Employee.update(
        { Role: req.body.userRole },
        { where: { Email: req.body.user } }
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
