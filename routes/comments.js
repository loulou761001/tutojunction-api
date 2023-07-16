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
const CommentModel = require("../models/Comment");
const { ObjectId } = require("mongodb");

router.post("/", userMiddleware.checkConfirmed, async (req, res) => {
  const newComment = req.fields;
  console.log(newComment);
  try {
    const data = await CommentModel.create(newComment);
    console.log(data._id);
    const article = await ArticleModel.updateOne(
      { _id: { $eq: new ObjectId(newComment.article) } },
      { $push: { comments: data._id } }
    );
    console.log(data);
    res.send({ comment: data, article: article });
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
