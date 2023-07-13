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
    overwrite: true,
  };
  const imagePath = req.files.image.path;
  try {
    // Upload the image
    const result = await cloudinary.uploader.upload(imagePath, options);
    const newImage = {
      url: result.url,
      uploader: res.locals.user._id,
      placeholder: result.placeholder,
      category: "article",
    };
    try {
      const data = await FileModel.create(newImage);
      console.log(data);
      return data;
    } catch (error) {
      console.error(error);
    }
  } catch (error) {
    console.error(error);
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
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send(err);
    });
});

module.exports = router;
