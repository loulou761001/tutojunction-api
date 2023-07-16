const express = require("express");
const app = express();
const port = 1337;
const nodemailer = require("nodemailer");
// GLOBAL VARIABLES
require("./global");

//Connection to mongoDB
require("./config/db/conn");

//Connection to Cloudinary
require("./config/cloudinary");

// MIDDLEWARE

//CORS
const cors = require("cors");
app.use(cors());

const formidableMiddleware = require("express-formidable");

// ROUTES
const usersRoute = require("./routes/users");
const articlesRoute = require("./routes/articles");
const CategoriesRoute = require("./routes/categories");
const FilesRoute = require("./routes/files");
const CommentsRoute = require("./routes/comments");
const ModmailRoute = require("./routes/modmail");

app.use(formidableMiddleware());

app.use("/users", usersRoute);
app.use("/articles", articlesRoute);
app.use("/categories", CategoriesRoute);
app.use("/files", FilesRoute);
app.use("/comments", CommentsRoute);
app.use("/modmail", ModmailRoute);

app.listen(port, () => {
  console.log(`API listening at http://localhost:${port}`);
});
