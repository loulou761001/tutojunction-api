const express = require("express");
const router = express.Router();

// CLOUDINARY
const cloudinary = require("cloudinary").v2;

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
const ModmailModel = require("../models/ModMessage");
const { ObjectId } = require("mongodb");

router.post("/", userMiddleware.checkLoggedIn, async (req, res) => {
  const newMail = req.fields;
  console.log(newMail);
  try {
    const data = await ModmailModel.create(newMail);
    console.log(data);
    res.send(data);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

// GET BY ARTICLE
router.get("/:article", async (req, res) => {
  const article = req.params.article;
  const limit = req.query.limit;
  const skip = req.query.skip;
  console.log("article", article);
  await FileModel.find({ article: new ObjectId(article) })

    .skip(skip)
    .limit(limit)
    .sort({ created_at: "desc", _id: "desc" })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send(err);
    });
});

module.exports = router;
