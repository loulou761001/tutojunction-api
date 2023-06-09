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

// FUNCTIONS
let slug = require("slug");
const nodemailer = require("nodemailer");
// const { checkLoggedIn } = require("../middleware/checkUser");

// SEND A MAIL
function sendMailConfirm(user) {
  const url = siteUrl + "confirm?code=" + user.confirmation_code;
  const mailOptions = {
    from: "TutoJunction@gmail.com",
    to: user.email,
    subject: "Valide ton compte !",
    text:
      "Salut " +
      user.username +
      ", Afin de confirmer ton compte, rends toi sur ce lien. Si le lien ne fonctionne pas, copie et colle cette URL dans la barre d'adresse de ton navigateur : " +
      url,
    html:
      "<p>Salut " +
      user.username +
      ",</p><p>Afin de confirmer ton compte, rends toi sur ce lien <a href=" +
      url +
      " target=_blank>en cliquant ici</a>.</p><p>Si le lien ne fonctionne pas, copie et colle cette URL dans la barre d'adresse de ton navigateur : " +
      url +
      " .</p>",
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

// GENERATES A RANDOM TOKEN
function makeToken(length) {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

router.get("/", async (req, res) => {
  let users = await UserModel.find();
  res.send(users);
});

router.get("/findById/:id", async (req, res) => {
  let user = await UserModel.findOne({ _id: req.params.id });
  res.send(user);
});
router.get("/checkLoggedIn", userMiddleware.checkLoggedIn, async (req, res) => {
  res.send(["Logged in", req.headers.authorization]);
});

router.post("/checkUsername", async (req, res) => {
  const currentSlug = slug(req.fields.username);
  let user = await UserModel.findOne({
    $or: [{ username: req.fields.username }, { slug: currentSlug }],
  });
  res.send(user == null);
});

router.post("/checkEmail", async (req, res) => {
  let user = await UserModel.findOne({ email: req.fields.email });
  res.send(user == null);
});

router.put("/confirm/:id", async (req, res) => {
  let user = await UserModel.updateOne(
    { _id: req.params.id },
    {
      $set: {
        confirmed: true,
        confirmation_code: null,
      },
    }
  );
  res.send(user);
});

router.post("/register", async (req, res) => {
  const user = req.fields;
  user.slug = slug(user.username);
  user.confirmation_code = user.slug + makeToken(12);
  bcrypt
    .genSalt(saltRounds)
    .then((salt) => {
      return bcrypt.hash(user.password, salt);
    })
    .then((hash) => {
      user.password = hash;
      UserModel.create(user).then((data) => {
        jwt.sign(
          { id: user._id, role: user.role, confirmed: user.confirmed },
          process.env.JWT_KEY,
          { expiresIn: "24h" }
        );
        sendMailConfirm(user);
        res.send(data);
      });
    })
    .catch((err) => console.error(err.message));
});

router.post("/login", async (req, res) => {
  console.log(req.fields);
  const sentInfo = req.fields;
  let user;
  try {
    user = await UserModel.findOne({ email: sentInfo.email });
  } catch (e) {
    res.send(e);
  }

  if (!user) {
    res.statusMessage = "No user found";
    res.status(404).send();
  }

  bcrypt.compare(sentInfo.password, user.password, (err, result) => {
    if (result === true) {
      if (user.banned) {
        res.status(403).send;
      }
      const token = jwt.sign(
        { id: user._id, role: user.role, confirmed: user.confirmed },
        process.env.JWT_KEY,
        { expiresIn: "24h" }
      );
      res.send(token);
    } else {
      res.status(404).send();
    }
  });
});

module.exports = router;
