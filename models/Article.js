const mongoose = require("mongoose");

const { ObjectId } = require("mongodb");

const ArticleModel = mongoose.Schema({
  created_at: {
    type: Date,
    required: true,
    default: new Date(),
  },
  published_at: {
    type: Date,
    default: null,
  },
  updated_at: {
    type: Date,
    required: true,
    default: new Date(),
  },
  featured: {
    type: Boolean,
    required: true,
    default: false,
  },
  title: {
    type: String,
    required: true,
    trim: true,
    text: true,
    index: true,
  },
  content: {
    type: String,
    required: true,
    trim: true,
    text: true,
    index: true,
  },
  author: {
    type: ObjectId,
    required: true,
    trim: true,
    ref: "users",
    autopopulate: true,
  },
  categories: [{ type: ObjectId, ref: "categories" }],
  tags: [{ trim: true, type: String }],
  liked_by: [{ type: ObjectId, ref: "users" }],
  comments: [{ type: ObjectId, ref: "comments", foreignField: "article" }],
  views: { type: Number, default: 0 },
  thumbnail: {
    type: ObjectId,
    required: true,
    ref: "files",
    autopopulate: true,
  },
});

module.exports = article = mongoose.model("articles", ArticleModel);
