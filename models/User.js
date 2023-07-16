const mongoose = require("mongoose");

const { ObjectId } = require("mongodb");

const UserModel = mongoose.Schema({
  created_at: {
    type: Date,
    required: true,
    default: new Date(),
  },
  updated_at: {
    type: Date,
    required: true,
    default: new Date(),
  },
  username: {
    type: String,
    required: true,
    trim: true,
  },
  firstname: {
    type: String,
    required: true,
    trim: true,
  },
  lastname: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    lowercase: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    trim: true,
  },
  role: {
    type: String,
    required: true,
    default: "user",
  },
  avatar: {
    type: ObjectId,
    required: false,
    ref: "files",
    autopopulate: true,
  },

  following: [{ type: ObjectId, required: true, ref: "users" }],
  followers: [
    {
      type: ObjectId,
      required: true,
      ref: "users",
    },
  ],
  categories_followed: [{ type: ObjectId, required: true, ref: "categories" }],
  reset_password_token: {
    type: String,
    default: "",
  },
  confirmation_code: {
    type: String,
    default: "",
  },
  confirmation_code_time: {
    type: Date,
    required: true,
    default: new Date(),
  },
  confirmed: {
    type: Boolean,
    required: true,
    default: false,
  },
  banned: {
    type: Boolean,
    required: true,
    default: false,
  },
  articles: [{ type: ObjectId, required: true, ref: "articles" }],
  likes: [{ type: ObjectId, required: true }],
});

UserModel.statics.isEmailTaken = async function (email) {
  return await this.findOne({ email: email.trim() });
};
UserModel.statics.isUsernameTaken = async function (username) {
  return await this.findOne({ username: username.trim() });
};

module.exports = user = mongoose.model("users", UserModel);
