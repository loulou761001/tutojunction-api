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
  try {
    let article = await ArticleModel.findOne({
      $and: [
        { _id: req.params.id },
        { published_at: { $exists: true, $ne: null } },
      ],
    });
    console.log(article);
    if (article) {
      res.send(article);
    } else {
      res.status(404).send();
    }
  } catch (e) {
    console.error(e.message);
    res.status(500).send(e);
  }
});

router.get("/subscribed", userMiddleware.checkConfirmed, async (req, res) => {
  const limit = req.query.limit;
  const start = req.query.start;
  const user = res.locals.user;
  try {
    let articles = await ArticleModel.find({
      author: { $in: user.following },
      published_at: { $exists: true },
    })
      .limit(limit ? limit : null)
      .skip(start ? start : null)
      .sort({ published_at: "desc" });
    if (!articles) res.status(404).send();
    res.send(articles);
  } catch (e) {
    res.status(500).send(e);
  }
});

router.get(
  "/byCategory/:category",
  userMiddleware.checkConfirmed,
  async (req, res) => {
    const limit = req.query.limit;
    const start = req.query.start;
    const category = new objectId(req.params.category);
    console.log("category", category);
    // const truc =
    try {
      let articles = await ArticleModel.find({
        categories: { $elemMatch: { $eq: category } },

        published_at: { $exists: true },
      })
        .populate("categories", "name slug")
        // .limit(limit ? limit : null)
        // .skip(start ? start : null)
        .sort({ published_at: "desc" });
      if (!articles) res.status(404).send();
      res.send(articles);
    } catch (e) {
      console.log(e);
      res.status(500).send(e);
    }
  }
);

// POST -------------------------

router.post("/create", userMiddleware.checkConfirmed, async (req, res) => {
  const article = req.fields;
  const user = res.locals.user;
  article.slug = slug(article.title);
  article.author = user._id;
  article.thumbnail = user._id;
  article.content = cleanXss(article.content);
  console.log(article);
  ArticleModel.create(article)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      console.error(err.message);
      res.status(500).send(err);
    });
});

router.put("/incrementViews/:id", async (req, res) => {
  try {
    article = await ArticleModel.findOneAndUpdate(
      { _id: req.params.id },
      { $inc: { views: 1 } }
    );
  } catch (e) {
    res.send(e);
  }
});

module.exports = router;
