// MODELS
const UserModel = require("../models/User");

// middleware
const jwt = require("jsonwebtoken");
module.exports = {
  checkLoggedIn: function (req, res, next) {
    if (!req.headers.authorization) {
      res.status(401).send();
    }
    req.headers.authorization = req.headers.authorization.split(" ")[1];
    const token = req.headers.authorization;
    // req.headers
    console.log(token);
    let userId;

    try {
      userId = jwt.verify(token, process.env.JWT_KEY).id;
      console.log("userId", userId);
      UserModel.findOne({ _id: userId }).then((data) => {
        console.log(data);
        if (data.role === "banned") {
          res.status(403).send();
        } else {
          next();
        }
      });
    } catch (e) {
      console.log(e);
      res.status(401).send();
    }
  },
  checkModerator: function (req, res, next) {
    const token = req.headers.authorization.split(" ")[1];
    // req.headers
    console.log(token);
    console.log(jwt.verify(token, process.env.JWT_KEY));
    let user;
    let userId;
    try {
      userId = jwt.verify(token, process.env.JWT_KEY).id;
      UserModel.findOne({ _id: userId }).then((data) => {
        console.log(data);
        if (data.role !== "admin" && data.role !== "moderator") {
          res.status(403).send();
        } else {
          next();
        }
      });
    } catch (e) {
      console.log(e);
      res.status(401).send();
    }
  },
};
