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
// const userMiddleware = require("./middleware/checkUser");
// app.use(userMiddleware.checkRole);

//CORS
const cors = require("cors");
app.use(cors());

const formidableMiddleware = require("express-formidable");

// ROUTES
const usersRoute = require("./routes/users");

app.use(formidableMiddleware());

app.use("/users", usersRoute);

app.listen(port, () => {
  console.log(`API listening at http://localhost:${port}`);
});
