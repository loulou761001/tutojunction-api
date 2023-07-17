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
      UserModel.findOne({ _id: userId })
        .populate("avatar")
        .then((data) => {
          console.log(data);
          if (data) {
            if (data.role === "banned") {
              res.status(403).send();
            } else {
              res.locals.user = data;
              next();
            }
          } else {
            res.status(404).send();
          }
        });
    } catch (e) {
      console.log(e);
      res.status(401).send();
    }
  },
  checkConfirmed: function (req, res, next) {
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
      console.log(jwt.verify(token, process.env.JWT_KEY));
      console.log("userId", userId);
      UserModel.findOne({ _id: userId })
        .then((data) => {
          console.log(data);
          if (data.confirmed !== true) {
            res.status(403).send();
          } else if (data.role === "banned") {
            res.status(403).send();
          } else {
            res.locals.user = data;
            next();
          }
        })
        .catch((e) => {
          console.log(e);
          res.status(500).send();
        });
    } catch (e) {
      console.log(e);
      res.status(401).send();
    }
  },
  checkModerator: function (req, res, next) {
    console.log(req.headers);
    req.headers.authorization = req.headers.authorization.split(" ")[1];
    const token = req.headers.authorization;
    // req.headers
    console.log(token);
    console.log(jwt.verify(token, process.env.JWT_KEY));
    let user;
    let userId;
    try {
      userId = jwt.verify(token, process.env.JWT_KEY).id;
      console.log(jwt.verify(token, process.env.JWT_KEY));
      console.log("userId", userId);
      UserModel.findOne({ _id: userId })
        .then((data) => {
          console.log(data);
          if (data.confirmed !== true) {
            res.status(403).send();
          } else if (data.role === "banned") {
            res.status(403).send();
          } else if (data.role !== "moderator" && data.role !== "admin") {
            res.status(403).send();
          } else {
            res.locals.user = data;
            next();
          }
        })
        .catch((e) => {
          console.log(e);
          res.status(500).send();
        });
    } catch (e) {
      console.log(e);
      res.status(401).send();
    }
  },
};
