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
const FileModel = require("../models/File");

router.post("/", userMiddleware.checkConfirmed, async (req, res) => {
  const options = {
    use_filename: true,
    unique_filename: false,
    overwrite: false,
  };
  const imagePath = req.files.image.path;

  try {
    // Upload the image
    const result = await cloudinary.uploader.upload(imagePath, options);
    const newImage = {
      url: result.url,
      uploader: res.locals.user._id,
      public_id: result.public_id,
      category: "article",
    };
    try {
      const data = await FileModel.create(newImage);
      console.log(data);
      res.send(data);
    } catch (error) {
      console.error(error);
      res.status(500).send(error);
    }
  } catch (error) {
    console.error(error);
  }
});
router.post("/profile", userMiddleware.checkConfirmed, async (req, res) => {
  const options = {
    use_filename: true,
    unique_filename: false,
    overwrite: false,
  };
  const imagePath = req.files.image.path;

  try {
    const category = req.query.cat;
    console.log("query", req.query);
    // Upload the image
    const result = await cloudinary.uploader.upload(imagePath, options);
    const newImage = {
      url: result.url,
      uploader: res.locals.user._id,
      public_id: result.public_id,
      category: "profile",
    };
    try {
      const data = await FileModel.create(newImage);
      console.log(data);
      res.send(data);
    } catch (error) {
      console.error(error);
      res.status(500).send(error);
    }
  } catch (error) {
    console.error(error);
  }
});

router.delete("/:id", userMiddleware.checkConfirmed, async (req, res) => {
  try {
    const bddResult = await FileModel.updateOne(
      { _id: req.params.id },
      { uploader: null }
    );
    res.send(bddResult);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

// GET BY CATEGORY
router.get("/popup", userMiddleware.checkConfirmed, async (req, res) => {
  const category = req.query.category;
  const limit = req.query.limit;
  const skip = req.query.skip;
  console.log("category", category);
  await FileModel.find({ category: category, uploader: res.locals.user._id })

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
