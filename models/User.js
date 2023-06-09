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
  images: [
    {
      type: ObjectId,
      required: true,
    },
  ],
  following: [{ type: ObjectId, required: true }],
  followers: [
    {
      type: ObjectId,
      required: true,
    },
  ],
  categories_followed: [{ type: ObjectId, required: true }],
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
  articles: [
    {
      article: { type: ObjectId, required: true },
    },
  ],
});

UserModel.statics.isEmailTaken = async function (email) {
  return await this.findOne({ email: email.trim() });
};
UserModel.statics.isUsernameTaken = async function (username) {
  return await this.findOne({ username: username.trim() });
};

module.exports = user = mongoose.model("users", UserModel);
