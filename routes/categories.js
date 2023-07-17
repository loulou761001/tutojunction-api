const express = require("express");
const router = express.Router();

// PLUGINS
const objectId = require("mongoose").Types.ObjectId;
// bcrypt
const bcrypt = require("bcryptjs");
const saltRounds = 10;
const jwt = require("jsonwebtoken");

// MIDDLEWARE
const userMiddleware = require("../middleware/checkUser");

// MODELS
const UserModel = require("../models/User");
const ArticleModel = require("../models/Article");
const CategoryModel = require("../models/Category");

// FUNCTIONS
let slug = require("slug");
const nodemailer = require("nodemailer");
// const { checkLoggedIn } = require("../middleware/checkUser");

router.get("/", async (req, res) => {
  let categories = await CategoryModel.find();
  res.send(categories);
});
router.get("/getSubs/:id", async (req, res) => {
  let categories = await CategoryModel.find({ parent: req.params.id });
  res.send(categories);
});

// POST
router.post("/create", userMiddleware.checkModerator, async (req, res) => {
  let newCat = req.fields;
  newCat.slug = slug(newCat.name);
  CategoryModel.create(newCat)
    .then(async (data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});

router.get("/getAllParents", async (req, res) => {
  CategoryModel.find({ parent: { $exists: false } })
    .limit(11)
    .then((data) => res.send(data))
    .catch((err) => {
      res.status(500).send(err);
    });
  // res.send(parents);
});

module.exports = router;
