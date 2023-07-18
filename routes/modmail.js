const express = require("express");
const router = express.Router();

// PLUGINS
const objectId = require("mongoose").Types.ObjectId;

// MIDDLEWARE
const userMiddleware = require("../middleware/checkUser");

// MODELS
const UserModel = require("../models/User");
const ArticleModel = require("../models/Article");
const ModmailModel = require("../models/ModMessage");
const { ObjectId } = require("mongodb");
function sendMail(message, user) {
  const mailOptions = {
    from: "TutoJunction@gmail.com",
    to: user.email,
    subject: "Réponse à ton message",
    text:
      "Salut, " +
      user.username +
      ", L'équipe de TutoJunction a répondu à ton message : '" +
      message +
      "' Merci d'avoir pris le temps de nous écrire, en espérant que notre réponse te convienne.",
    html:
      "<p>Salut, " +
      user.username +
      ", </p><p>L'équipe de TutoJunction a répondu à ton message : </p> <p style='font-weight: bold;font-size: 16px'> '" +
      message +
      "'</p> <p>Merci d'avoir pris le temps de nous écrire, en espérant que notre réponse te convienne.</p> <p>L'équipe de TutoJunction.</p>",
  };
  transporter
    .sendMail(mailOptions)
    .then((data) => {
      console.log("email sent ", data);
    })
    .catch((err) => {
      console.log(err);
    });
}
function sendMailCertif(message, user, condition) {
  let text;
  let html;
  if (!condition) {
    text =
      "Salut, " +
      user.username +
      ", L'équipe de TutoJunction a malheureusement refusé ta demande de certification : '" +
      message +
      "' Merci d'avoir pris le temps de nous écrire, en espérant que notre réponse te convienne.";
    html =
      "<p>Salut, " +
      user.username +
      ", </p><p>L'équipe de TutoJunction a malheureusement refusé ta demande de certification : </p> <p style='font-weight: bold;font-size: 16px'> '" +
      message +
      "'</p> <p>Merci d'avoir pris le temps de nous écrire, en espérant que notre réponse te convienne.</p> <p>L'équipe de TutoJunction.</p>";
  } else {
    text =
      "Salut, " +
      user.username +
      ", L'équipe de TutoJunction a accepté ta demande de certification : '" +
      message +
      "' Merci d'avoir pris le temps de nous écrire, en espérant que notre réponse te convienne.";
    html =
      "<p>Salut, " +
      user.username +
      ", </p><p>L'équipe de TutoJunction a accepté ta demande de certification : </p> <p style='font-weight: bold;font-size: 16px'> '" +
      message +
      "'</p> <p>Merci d'avoir pris le temps de nous écrire, en espérant que notre réponse te convienne.</p> <p>L'équipe de TutoJunction.</p>";
  }
  const mailOptions = {
    from: "TutoJunction@gmail.com",
    to: user.email,
    subject: "Réponse à ton message",
    text: text,
    html: html,
  };
  transporter
    .sendMail(mailOptions)
    .then((data) => {
      console.log("email sent ", data);
    })
    .catch((err) => {
      console.log(err);
    });
}
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
router.post("/email", userMiddleware.checkLoggedIn, async (req, res) => {
  const message = req.fields.message;
  const response = req.fields.response;
  try {
    await sendMail(response, message.author);
    res.send("success");
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});
router.post("/answerCertif", userMiddleware.checkLoggedIn, async (req, res) => {
  const message = req.fields.message;
  const response = req.fields.response;
  const certif = req.fields.certif;
  try {
    if (certif) {
      await UserModel.updateOne(
        { _id: new ObjectId(message.author._id) },
        { role: "writer" }
      );
    }
    await sendMailCertif(response, message.author, certif);
    res.send("success");
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});
router.get("/messages", userMiddleware.checkModerator, async (req, res) => {
  const skip = req.query.skip;
  try {
    const data = await ModmailModel.find({
      object: { $nin: ["report", "certif"] },
    })
      .limit(20)
      .skip(skip)
      .sort({ created_at: "desc" })
      .populate("author");
    console.log(data);
    res.send(data);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});
router.get("/certifs", userMiddleware.checkModerator, async (req, res) => {
  const skip = req.query.skip;
  try {
    const data = await ModmailModel.find({
      object: { $eq: "certif" },
    })
      .limit(20)
      .skip(skip)
      .sort({ created_at: "desc" })
      .populate("author");
    console.log(data);
    res.send(data);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});
router.get("/message/:id", userMiddleware.checkModerator, async (req, res) => {
  const skip = req.query.skip;
  const id = req.params.id;
  try {
    const data = await ModmailModel.findOneAndUpdate(
      {
        _id: { $eq: new ObjectId(id) },
      },
      { open: true }
    ).populate({ path: "author", populate: "avatar" });
    console.log(data);
    res.send(data);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});
router.delete(
  "/message/:id",
  userMiddleware.checkModerator,
  async (req, res) => {
    const skip = req.query.skip;
    const id = req.params.id;
    try {
      const data = await ModmailModel.deleteOne({
        _id: { $eq: new ObjectId(id) },
      });
      console.log(data);
      res.send(data);
    } catch (error) {
      console.error(error);
      res.status(500).send(error);
    }
  }
);

module.exports = router;
