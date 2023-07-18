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
const { ObjectId } = require("mongodb");
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
      console.log("email sent ");
    })
    .catch((err) => {
      console.log(err);
    });
}
function sendMailBan(user, message) {
  const mailOptions = {
    from: "TutoJunction@gmail.com",
    to: user.email,
    subject: "Tu as été banni",
    text:
      "Bonjour " +
      user.username +
      ", L'équipe de TutoJunction a pris la décision de bannir ton compte, pour la raison suivante : " +
      message,
    html:
      "<p>Bonjour " +
      user.username +
      ",</p><p>, L'équipe de TutoJunction a pris la décision de bannir ton compte, pour la raison suivante :  <p style='font-size: 16px;font-weight: bold'>'" +
      message +
      "'.</p>",
  };
  transporter
    .sendMail(mailOptions)
    .then((data) => {
      console.log("email sent ");
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
router.get("/bySubscribers", async (req, res) => {
  let users = await UserModel.find().sort({ followers: "desc" }).limit(7);
  res.send(users);
});
router.get("/recommended", userMiddleware.checkLoggedIn, async (req, res) => {
  let categories_followed;
  let sort;
  if (!res.locals.user.categories_followed.length) {
    console.log("no length");
    categories_followed = { $exists: true };
    sort = {
      article_count: "desc",
      _id: "desc",
    };
  } else {
    categories_followed = {
      $ne: [],
      $in: res.locals.user.categories_followed,
    };
    sort = {
      common_count: "desc",
      article_count: "desc",
      _id: "desc",
    };
  }
  try {
    let users = await UserModel.find(
      {
        banned: { $ne: true },
        _id: { $ne: res.locals.user._id, $nin: res.locals.user.following },
        categories_followed: categories_followed,
        articles: { $ne: [] },
      },
      {
        username: 1,
        slug: 1,
        avatar: 1,
        role: 1,
        followers: 1,
        followers_count: { $size: "$followers" },
        article_count: { $size: "$articles" },
        common: {
          $setIntersection: [
            "$categories_followed",
            res.locals.user.categories_followed,
          ],
        },
        common_count: {
          $size: {
            $setIntersection: [
              "$categories_followed",
              res.locals.user.categories_followed,
            ],
          },
        },
      }
    )
      .populate("avatar")
      .populate("categories_followed")
      .sort(sort)
      .limit(6);
    console.log(users);
    res.send(users);
  } catch (e) {
    console.error(e);
    res.status(500).send;
  }
});

router.get("/findById/:id", async (req, res) => {
  console.log(req.params);
  let user = await UserModel.findOne({ _id: req.params.id }, { password: 0 })
    .populate("avatar")
    .populate({
      path: "articles",

      populate: [
        {
          path: "thumbnail",
        },
        {
          path: "categories",
        },
        {
          path: "author",
          populate: { path: "avatar" },
        },
      ],
    })
    .populate({
      path: "following",
      populate: {
        path: "avatar",
      },
    })
    .populate({
      path: "followers",
      populate: {
        path: "avatar",
      },
    })
    .populate("categories_followed");
  res.send(user);
});
router.get("/checkLoggedIn", userMiddleware.checkLoggedIn, async (req, res) => {
  res.send(["Logged in", req.headers.authorization]);
});
router.get("/me", userMiddleware.checkLoggedIn, async (req, res) => {
  const sentObject = {
    id: res.locals.user._id,
    slug: res.locals.user.slug,
    username: res.locals.user.username,
    confirmed: res.locals.user.confirmed,
    role: res.locals.user.role,
    email: res.locals.user.email,
    avatar: res.locals.user.avatar,
    categories_followed: res.locals.user.categories_followed,
    banned: res.locals.user.banned,
    followers: res.locals.user.followers,
  };
  res.send({ user: sentObject });
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
router.put("/editProfile", userMiddleware.checkLoggedIn, async (req, res) => {
  const user = res.locals.user;
  const updatedFields = req.fields;
  if (updatedFields.username) {
    updatedFields.slug = slug(updatedFields.username);
  }
  if (updatedFields.email) {
    updatedFields.confirmed = false;
    updatedFields.confirmation_code = updatedFields.slug + makeToken(12);
    updatedFields.confirmation_code_time = new Date();
  }
  await UserModel.findOneAndUpdate(
    { _id: user._id },
    {
      $set: updatedFields,
    },
    { returnDocument: "after" }
  )
    .then((userUpdate) => {
      console.log("userUpdate", userUpdate);
      if (updatedFields.email) {
        sendMailConfirm(userUpdate);
        res.send(userUpdate);
      } else {
        res.send(userUpdate);
      }
    })
    .catch((e) => {
      console.log(e);
      res.status(500).send(e);
    });
});
router.put("/followCat", userMiddleware.checkConfirmed, async (req, res) => {
  const user = res.locals.user;
  const category = new ObjectId(req.fields.category);
  try {
    let userUpdate = await UserModel.updateOne(
      { _id: user._id },
      {
        $push: { categories_followed: category },
      }
    );
    res.send(userUpdate);
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
});
router.put("/unfollowCat", userMiddleware.checkConfirmed, async (req, res) => {
  const user = res.locals.user;
  const category = new ObjectId(req.fields.category);
  try {
    let userUpdate = await UserModel.updateOne(
      { _id: user._id },
      {
        $pull: { categories_followed: category },
      }
    );
    res.send(userUpdate);
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
});

router.post("/register", async (req, res) => {
  const user = req.fields;
  user.likes = [];
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
router.get("/resendMail", userMiddleware.checkLoggedIn, async (req, res) => {
  const user = res.locals.user;
  user.confirmation_code = user.slug + makeToken(12);
  UserModel.updateOne(
    { _id: user._id },
    {
      confirmation_code: user.confirmation_code,
      confirmation_code_time: new Date(),
    }
  ).then((data) => {
    sendMailConfirm(user);
    res.send(data);
  });
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
router.post("/follow", userMiddleware.checkConfirmed, async (req, res) => {
  console.log("targetUser", req.fields);
  console.log("logged in user", res.locals.user);
  const sentInfo = req.fields;

  try {
    await UserModel.updateOne(
      { _id: sentInfo._id },
      { $push: { followers: res.locals.user._id } }
    );
    await UserModel.updateOne(
      { _id: res.locals.user._id },
      { $push: { following: sentInfo._id } }
    );
    res.status(200).send();
  } catch (e) {
    res.status(500).send();
  }
});

router.post("/unfollow", userMiddleware.checkConfirmed, async (req, res) => {
  console.log("targetUser", req.fields);
  console.log("logged in user", res.locals.user);
  const sentInfo = req.fields;

  try {
    await UserModel.updateOne(
      { _id: sentInfo._id },
      { $pull: { followers: res.locals.user._id } }
    );
    await UserModel.updateOne(
      { _id: res.locals.user._id },
      { $pull: { following: sentInfo._id } }
    );
  } catch (e) {
    res.status(500).send();
  }
  // try {
  //   UserModel.updateOne(
  //     { _id: res.locals.user._id },
  //     { $push: { following: res.locals.user } }
  //   );
  // } catch (e) {
  //   res.status(500).send();
  // }
  res.send("success");
});

router.post("/ban", userMiddleware.checkModerator, async (req, res) => {
  console.log("targetUser", req.fields);
  console.log("logged in user", res.locals.user);
  const user = req.fields.user;
  const message = req.fields.message;

  try {
    await UserModel.updateOne({ _id: user._id }, { banned: true });
    await sendMailBan(user, message);
    res.status(200).send();
  } catch (e) {
    res.status(500).send();
  }
});

router.post("/unBan", userMiddleware.checkModerator, async (req, res) => {
  console.log("targetUser", req.fields);
  console.log("logged in user", res.locals.user);
  const user = req.fields.user;

  try {
    await UserModel.updateOne({ _id: user._id }, { banned: false });
    res.status(200).send();
  } catch (e) {
    res.status(500).send();
  }
  // res.send("success");
});

module.exports = router;
