//import jesonwebtoken
const jwt = require("jsonwebtoken");

//confogure dotenv
require("dotenv").config();

//verifyToken Middleware
exports.AdminUserVerifyToken = (req, res, next) => {
  //get the bearer token
  let bearerToken = req.headers.authorization;
  //If token is exist
  if (bearerToken) {
    //Check token valid or not
    let token = bearerToken.split(" ")[1];

    //if token valid decode the token
    try {
      //console.log(process.env.SECRET_KEY);
      let decode = jwt.verify(token, process.env.SECRET_KEY);
      console.log("Token Verified");
      let bearerToken = req.headers.authorization;
      let Role = bearerToken.split(".")[3];
      if (Role == "Admin User") next();
      else {
        res.send({ message: "Only Admin Users  can  access  this" });
      }
    } catch (err) {
      res.send({ message: "Please Relogin" });
    }
  }
  //if no token exists
  else {
    res.send({ message: "Unauthorized Access" });
  }
};
