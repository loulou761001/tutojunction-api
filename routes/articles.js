const express = require("express");
const router = express.Router();

// PLUGINS
const objectId = require("mongoose").Types.ObjectId;

const jwt = require("jsonwebtoken");

// MIDDLEWARE
const userMiddleware = require("../middleware/checkUser");

// MODELS
const UserModel = require("../models/User");
const ArticleModel = require("../models/Article");

// FUNCTIONS
let slug = require("slug");

// SEND A MAIL
function sendMailConfirm(article) {
  const url = siteUrl + "confirm?code=" + article.confirmation_code;
  const mailOptions = {
    from: "TutoJunction@gmail.com",
    to: article.email,
    subject: "Valide ton compte !",
    text:
      "Salut " +
      article.articlename +
      ", Afin de confirmer ton compte, rends toi sur ce lien. Si le lien ne fonctionne pas, copie et colle cette URL dans la barre d'adresse de ton navigateur : " +
      url,
    html:
      "<p>Salut " +
      article.articlename +
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

router.get("/", async (req, res) => {
  let articles = await ArticleModel.find();
  res.send(articles);
});

router.get("/findById/:id", async (req, res) => {
  let article = await ArticleModel.findOne({ _id: req.params.id });
  res.send(article);
});

router.post("/create", userMiddleware.checkConfirmed, async (req, res) => {
  const article = req.fields;
  const user = res.locals.user;
  console.log(res.locals.user);
  article.slug = slug(article.title);
  article.author = user._id;
  article.thumbnail = user._id;
  ArticleModel.create(article)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      console.error(err.message);
      res.status(500).send(err);
    });
});

router.post("/login", async (req, res) => {
  console.log(req.fields);
  const sentInfo = req.fields;
  let article;
  try {
    article = await ArticleModel.findOne({ email: sentInfo.email });
  } catch (e) {
    res.send(e);
  }

  if (!article) {
    res.statusMessage = "No article found";
    res.status(404).send();
  }

  bcrypt.compare(sentInfo.password, article.password, (err, result) => {
    if (result === true) {
      if (article.banned) {
        res.status(403).send;
      }
      const token = jwt.sign(
        { id: article._id, role: article.role, confirmed: article.confirmed },
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
