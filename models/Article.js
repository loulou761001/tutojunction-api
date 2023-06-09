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
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
    trim: true,
  },
  author: {
    type: ObjectId,
    required: true,
    trim: true,
  },
  lastname: {
    type: String,
    required: true,
    trim: true,
  },
  categories: [
    {
      category: { type: ObjectId, required: true },
    },
  ],
  liked_by: [
    {
      user: { type: ObjectId },
    },
  ],
  comments: [{ comment: { type: ObjectId } }],
  views: { type: Number, default: 0 },
  thumbnail: { type: ObjectId, required: true },
});

module.exports = article = mongoose.model("articles", ArticleModel);
