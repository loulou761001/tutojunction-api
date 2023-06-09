const express = require("express");
const app = express();
const port = 1337;
const nodemailer = require("nodemailer");

// GLOBAL VARIABLES
global.siteUrl = "http://localhost:3000/";
global.transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "TutoJunction@gmail.com",
    pass: "xnqd pmpd lcxw ywjv",
  },
});

//Connection to mongoDB
require("./config/db/conn");

// MIDDLEWARE

//CORS
const cors = require("cors");
app.use(cors());

const formidableMiddleware = require("express-formidable");

// ROUTES
const usersRoute = require("./routes/users");
const articlesRoute = require("./routes/articles");
const CategoriesRoute = require("./routes/categories");

app.use(formidableMiddleware());

app.use("/users", usersRoute);
app.use("/articles", articlesRoute);
app.use("/categories", CategoriesRoute);

app.listen(port, () => {
  console.log(`API listening at http://localhost:${port}`);
});
