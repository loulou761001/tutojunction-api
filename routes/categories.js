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

router.get("/findById/:id", async (req, res) => {
  let user = await UserModel.findOne({ _id: req.params.id });
  res.send(user);
});
router.get("/checkLoggedIn", userMiddleware.checkLoggedIn, async (req, res) => {
  res.send(["Logged in", req.headers.authorization]);
});
router.get("/me", userMiddleware.checkLoggedIn, async (req, res) => {
  const sentObject = {
    id: res.locals.user._id,
    slug: res.locals.user.slug,
    confirmed: res.locals.user.confirmed,
    role: res.locals.user.role,
  };
  res.send({ user: sentObject });
});

// POST

router.post("/checkUsername", async (req, res) => {
  const currentSlug = slug(req.fields.username);
  let user = await UserModel.findOne({
    $or: [{ username: req.fields.username }, { slug: currentSlug }],
  });
  res.send(user == null);
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

router.post("/create", async (req, res) => {
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

module.exports = router;
