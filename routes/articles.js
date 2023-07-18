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
const { ObjectId } = require("mongodb");

// SEND A MAIL
function sendMailNewArticle(article, user) {
  const mailOptions = {
    from: user.email,
    to: "TutoJunction@gmail.com",
    subject: "Nouvel article",
    text:
      "Nouvel article posté par " + user.username + " : " + article.title + ".",
    html:
      "<p>Nouvel article posté par <a target='_blank' href='" +
      process.env.BASE_URL +
      "/users/" +
      user.slug +
      "'>" +
      user.username +
      "</a> : <a target='_blank' href='" +
      process.env.BASE_URL +
      "/tuto/" +
      article._id +
      "'>" +
      article.title +
      "</a>.</p>",
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
function sendMailValidate(article, user) {
  const mailOptions = {
    from: "TutoJunction@gmail.com",
    to: user.email,
    subject: "Article approuvé !",
    text:
      "Félicitations ! Ton article '" +
      article.title +
      "' vient d'être approuvé par notre équipe, et est désormais visible par toute la communauté.",
    html:
      "<p>Félicitations !</p> <p>Ton article '" +
      article.title +
      "' vient d'être approuvé par notre équipe, et est désormais visible par toute la communauté.</p> <p>L'équipe de TutoJunction.</p>",
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
function sendMailDelete(article, user) {
  const mailOptions = {
    from: "TutoJunction@gmail.com",
    to: user.email,
    subject: "Article supprimé !",
    text: "Ton article '" + article.title + "' vient d'être supprimé.",
    html:
      "<p>Ton article '" +
      article.title +
      "' vient d'être supprimé.</p> <p>L'équipe de TutoJunction.</p>",
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
router.get("/latest", async (req, res) => {
  let limit = req.fields.limit;
  let skip = req.fields.skip;
  let category = req.fields.category;
  let categorySub = req.fields.categorySub;
  let articles = await ArticleModel.find({
    published_at: { $exists: true, $ne: null },
  })
    .limit(limit)
    .skip(skip)
    .populate("categories")
    .populate("thumbnail")
    .populate({ path: "author", populate: "avatar" })
    .sort({ published_at: "desc" });
  res.send(articles);
});
router.get("/admin/latest", userMiddleware.checkModerator, async (req, res) => {
  let limit = req.fields.limit;
  let skip = req.fields.skip;
  let category = req.fields.category;
  let categorySub = req.fields.categorySub;
  let articles = await ArticleModel.find()
    .limit(limit)
    .skip(skip)
    .populate("categories")
    .populate("thumbnail")
    .populate({ path: "author", populate: "avatar" })
    .sort({ published_at: "desc" });
  res.send(articles);
});
router.get("/featured", async (req, res) => {
  let limit = req.fields.limit;
  let skip = req.fields.skip;
  let category = req.fields.category;
  let categorySub = req.fields.categorySub;
  let articles = await ArticleModel.find({
    published_at: { $exists: true, $ne: null },
    featured: { $eq: true },
  })
    .limit(limit)
    .skip(skip)
    .populate("categories")
    .populate("thumbnail")
    .populate({ path: "author", populate: "avatar" })
    .sort({ published_at: "desc" });
  res.send(articles);
});
router.get("/byLikes", async (req, res) => {
  let limit = req.fields.limit;
  let skip = req.fields.skip;
  let articles = await ArticleModel.find(
    { published_at: { $exists: true, $ne: null } },
    {
      likes_count: { $size: "$liked_by" },
      title: 1,
      liked_by: 1,
      published_at: 1,
    }
  )
    .limit(limit)
    .skip(skip)
    .populate("categories")
    .populate("thumbnail")
    .populate({ path: "author", populate: "avatar" })
    .sort({ likes_count: "desc", published_at: "desc" });
  res.send(articles);
});
router.get("/byViews", async (req, res) => {
  let limit = req.fields.limit;
  let skip = req.fields.skip;
  let articles = await ArticleModel.find({
    published_at: { $exists: true, $ne: null },
  })
    .limit(limit)
    .skip(skip)
    .populate("categories")
    .populate("thumbnail")
    .populate({ path: "author", populate: "avatar" })
    .sort({ views: "desc", published_at: "desc" });
  res.send(articles);
});

router.get("/findById/:id", async (req, res) => {
  let author = null;
  if (req.query.author) {
    author = new ObjectId(req.query.author);
  }
  try {
    let article = await ArticleModel.findOne({
      $and: [
        { _id: req.params.id },
        {
          $or: [
            { published_at: { $exists: true, $ne: null } },
            { author: { $eq: author } },
          ],
        },
      ],
    })
      .populate("categories", "name slug")
      .populate("thumbnail", "url")
      .populate({
        path: "comments",
        options: { sort: { published_at: "desc" }, limit: 10 },
        populate: {
          path: "author",
          populate: {
            path: "avatar",
          },
        },
      })
      .populate({
        path: "author",
        populate: {
          path: "avatar",
        },
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
router.get("/findByUserLikes/:id", async (req, res) => {
  const id = new ObjectId(req.params.id);
  try {
    let article = await ArticleModel.find({
      liked_by: {
        $elemMatch: { $eq: id },
      },
      published_at: { $exists: true, $ne: null },
    })
      .populate("categories", "name slug")
      .populate("thumbnail", "url")
      .populate({
        path: "author",
        populate: {
          path: "avatar",
        },
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

router.put("/validate/:id", userMiddleware.checkModerator, async (req, res) => {
  try {
    let article = await ArticleModel.findOneAndUpdate(
      { _id: req.params.id },
      { published_at: new Date() }
    );
    const user = req.fields.user;
    console.log("user", article);
    await sendMailValidate(article, user);
    res.send(article);
  } catch (e) {
    console.error(e.message);
    res.status(500).send(e);
  }
});
router.delete(
  "/:id/:userId",
  userMiddleware.checkConfirmed,
  async (req, res) => {
    try {
      let article = await ArticleModel.findOneAndDelete({ _id: req.params.id });
      const user = await UserModel.findOne({
        _id: new ObjectId(req.params.userId),
      });
      console.log("user", user);
      await sendMailDelete(article, user);
      res.send(article);
    } catch (e) {
      console.error(e.message);
      res.status(500).send(e);
    }
  }
);
router.put(
  "/unpublish/:id",
  userMiddleware.checkModerator,
  async (req, res) => {
    try {
      let article = await ArticleModel.updateOne(
        { _id: req.params.id },
        { published_at: null }
      );
      res.send(article);
    } catch (e) {
      console.error(e.message);
      res.status(500).send(e);
    }
  }
);

router.post("/findByContent/", async (req, res) => {
  let author = null;
  let articleData = req.fields.article;
  try {
    let article = await ArticleModel.find(
      { $text: { $search: articleData.content } },
      { score: { $meta: "textScore" } }
    )
      // .sort({ score: { $meta: "textScore" } })
      .limit(1);
    console.log(article[0]);
    if (article && article[0]) {
      res.send(article[0]);
    } else {
      res.send("ok");
    }
  } catch (e) {
    console.error(e.message);
    res.status(500).send(e);
  }
});
router.post("/search/", async (req, res) => {
  let match;
  let limit = req.fields.limit;
  let skip = req.fields.skip;
  let query = req.fields.searchQuery;
  let category = req.fields.category;
  let categorySub = req.fields.categorySub;
  console.log(category, categorySub);
  if (categorySub) {
    match = {
      categories: { $elemMatch: { $eq: new ObjectId(categorySub) } },
      published_at: { $ne: null, $exists: true },
    };
  } else if (category) {
    match = {
      categories: { $elemMatch: { $eq: new ObjectId(category) } },
      published_at: { $ne: null, $exists: true },
    };
  } else {
    match = {
      published_at: { $ne: null, $exists: true },
    };
  }
  console.log(query);
  try {
    let article = await ArticleModel.aggregate([
      {
        $search: {
          index: "article",
          compound: {
            should: [
              {
                search: {
                  path: "title",
                  query: query,
                },
              },
              {
                search: {
                  path: "tags",
                  query: query,
                },
              },
            ],
          },
        },
      },
      {
        $match: match,
      },
      {
        $limit: limit,
      },
      {
        $skip: skip,
      },
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "author",
          pipeline: [
            {
              $lookup: {
                from: "files",
                localField: "avatar",
                foreignField: "_id",
                as: "avatar",
              },
            },
            {
              $unwind: {
                path: "$avatar",
                preserveNullAndEmptyArrays: true,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "categories",
          foreignField: "_id",
          as: "categories",
        },
      },
      {
        $unwind: {
          path: "$author",
        },
      },
      {
        $lookup: {
          from: "files",
          localField: "thumbnail",
          foreignField: "_id",
          as: "thumbnail",
        },
      },
      {
        $unwind: {
          path: "$thumbnail",
        },
      },
    ]);
    console.log(article);
    if (article) {
      res.send(article);
    } else {
      res.send("ok");
    }
  } catch (e) {
    console.error(e.message);
    res.status(500).send(e);
  }
});
router.post("/autocomplete/", async (req, res) => {
  let query = req.fields.query;
  let match = {
    published_at: { $ne: null, $exists: true },
  };
  let limit = 8;
  try {
    let article = await ArticleModel.aggregate([
      {
        $search: {
          index: "article",
          compound: {
            should: [
              {
                autocomplete: {
                  path: "title",
                  query: query,
                },
              },
              {
                autocomplete: {
                  path: "tags",
                  query: query,
                },
              },
            ],
          },
        },
      },
      {
        $match: match,
      },
      {
        $limit: limit,
      },
      {
        $lookup: {
          from: "categories",
          localField: "categories",
          foreignField: "_id",
          as: "categories",
        },
      },
      {
        $project: {
          title: 1,
          categories: 1,
          tags: 1,
          published_at: 1,
        },
      },
    ]);
    console.log(article);
    if (article) {
      res.send(article);
    } else {
      res.send("ok");
    }
  } catch (e) {
    console.error(e.message);
    res.status(500).send(e);
  }
});

router.post("/findSimilar/", async (req, res) => {
  let articleData = req.fields.article;
  try {
    let articles = await ArticleModel.find(
      { $text: { $search: articleData.content } },
      { score: { $meta: "textScore" } }
    )
      .populate("thumbnail", "url")
      .populate("categories", "name slug")
      .populate({ path: "author", populate: "avatar" })
      .sort({ score: "desc" })
      .limit(6);
    res.send(articles);
  } catch (e) {
    console.error(e.message);
    res.status(500).send(e);
  }
});

router.get("/subscribed", userMiddleware.checkLoggedIn, async (req, res) => {
  const limit = req.query.limit;
  const start = req.query.start;
  const user = res.locals.user;
  try {
    let articles = await ArticleModel.find({
      author: { $in: user.following },
      published_at: { $exists: true, $ne: null },
    })
      .populate("thumbnail")
      .populate("categories")
      .populate({ path: "author", populate: "avatar" })
      .limit(limit ? limit : null)
      .skip(start ? start : null)
      .sort({ published_at: "desc" });
    if (!articles) res.status(404).send();
    res.send(articles);
  } catch (e) {
    res.status(500).send(e);
  }
});

router.get("/byCategory/:category", async (req, res) => {
  const limit = req.query.limit;
  const start = req.query.start;
  const category = new objectId(req.params.category);
  console.log(category);

  console.log("category", category);
  // const truc =
  try {
    let articles = await ArticleModel.find({
      categories: { $elemMatch: { $eq: category } },

      published_at: { $exists: true, $ne: null },
    })
      .populate("thumbnail", "url")
      .populate("categories", "name slug")
      .populate({ path: "author", populate: "avatar" })
      .limit(limit ? limit : null)
      .skip(start ? start : null)
      .sort({ published_at: "desc" });
    if (!articles) res.status(404).send();
    res.send(articles);
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
});
router.post(
  "/subbedCategories/",
  userMiddleware.checkLoggedIn,
  async (req, res) => {
    const limit = req.query.limit;
    const start = req.query.start;
    const category = req.fields.categories.map((item) => new ObjectId(item));

    console.log("category", category);
    // const truc =
    try {
      let articles = await ArticleModel.find({
        categories: { $in: category },

        published_at: { $exists: true, $ne: null },
      })
        .populate("thumbnail", "url")
        .populate("categories", "name slug")
        .populate({ path: "author", populate: "avatar" })
        .limit(limit ? limit : null)
        .skip(start ? start : null)
        .sort({ published_at: "desc" });
      if (!articles) res.status(404).send();
      console.log(articles);
      res.send(articles);
    } catch (e) {
      console.log(e);
      res.status(500).send(e);
    }
  }
);
router.get("/byTag/:tag", userMiddleware.checkConfirmed, async (req, res) => {
  const limit = req.query.limit;
  const start = req.query.start;
  const tag = req.params.tag;
  // const truc =
  try {
    let articles = await ArticleModel.find({
      tags: { $elemMatch: { $eq: tag } },

      published_at: { $exists: true, $ne: null },
    })
      .populate("thumbnail", "url")
      .populate("categories", "name slug")
      .limit(limit ? limit : null)
      .skip(start ? start : null)
      .sort({ published_at: "desc" });
    if (!articles) res.status(404).send();
    res.send(articles);
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
});

// POST -------------------------

router.post("/create", userMiddleware.checkConfirmed, async (req, res) => {
  const article = req.fields;
  const user = res.locals.user;
  article.slug = slug(article.title);
  article.author = user._id;
  article.content = cleanXss(article.content);
  if (user.role !== "user") {
    article.published_at = new Date();
  }
  console.log(article);
  ArticleModel.create(article)
    .then(async (data) => {
      sendMailNewArticle(data, user);
      await UserModel.updateOne(
        { _id: user._id },
        { $push: { articles: data._id } }
      );

      res.send(data);
    })
    .catch((err) => {
      console.error(err.message);
      res.status(500).send(err);
    });
});

router.get("/incrementViews/:id", async (req, res) => {
  try {
    const article = await ArticleModel.updateOne(
      { _id: req.params.id },
      { $inc: { views: 1 } }
    );
    res.send(article);
  } catch (e) {
    res.send(e);
  }
});
router.put("/like/:id", async (req, res) => {
  const user = req.fields.user;
  try {
    const article = await ArticleModel.updateOne(
      { _id: req.params.id },
      { $push: { liked_by: user } }
    );
    try {
      const newUser = await UserModel.updateOne(
        { _id: user },
        { $push: { likes: req.params.id } }
      );
      res.send({ article, newUser });
    } catch (e) {
      res.send(e);
    }
  } catch (e) {
    res.send(e);
  }
});
router.put("/unlike/:id", async (req, res) => {
  const user = req.fields.user;
  try {
    const article = await ArticleModel.updateOne(
      { _id: req.params.id },
      { $pull: { liked_by: user } }
    );
    await UserModel.updateOne(
      { _id: user },
      { $pull: { likes: req.params.id } }
    );
    res.send(article);
  } catch (e) {
    res.send(e);
  }
});

module.exports = router;
