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
const { ObjectId } = require("mongodb");
// const { checkLoggedIn } = require("../middleware/checkUser");

router.get("/", async (req, res) => {
  let categories = await CategoryModel.find();
  res.send(categories);
});
router.get("/getSubs/:id", async (req, res) => {
  let categories = await CategoryModel.find({ parent: req.params.id });
  res.send(categories);
});

router.delete("/:id", async (req, res) => {
  let id = new ObjectId(req.params.id);
  let idString = req.params.id;
  console.log("working");
  try {
    let category = await CategoryModel.findOneAndDelete({
      _id: { $eq: id },
    });
    console.log("working cat", category);
    id = category._id;
    await UserModel.updateMany(
      {
        categories_followed: id,
      },
      {
        $pull: { categories_followed: id },
      }
    );
    console.log("working users", category);
    if (!category.parent) {
      await ArticleModel.deleteMany({
        categories: id,
      });
      await CategoryModel.deleteMany({
        parent: { $eq: id },
      });
    } else {
      await ArticleModel.updateMany(
        {
          categories: id,
        },
        {
          $pull: { categories: id },
        }
      );
    }
    res.send(category);
  } catch (e) {
    console.log(e);
    res.status(500).send();
  }
});

// POST
router.post("/create", userMiddleware.checkModerator, async (req, res) => {
  let newCat = req.fields;
  newCat.slug = slug(newCat.name);
  try {
    const check = await CategoryModel.find({
      $or: [{ slug: newCat.slug }, { name: newCat.name }],
    });
    console.log(check);
    if (check.length) {
      res.status(500).send("exists");
    } else {
      CategoryModel.create(newCat)
        .then(async (data) => {
          res.send(data);
        })
        .catch((err) => {
          console.log(err);
          res.status(500).send(err);
        });
    }
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
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
