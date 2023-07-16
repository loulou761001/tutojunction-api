const mongoose = require("mongoose");

const { ObjectId } = require("mongodb");

const CommentModel = mongoose.Schema({
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
  content: {
    type: String,
    required: true,
  },
  author: {
    type: ObjectId,
    required: true,
    ref: "users",
    autopopulate: true,
  },
  liked_by: [{ type: ObjectId, ref: "users" }],
  article: { type: ObjectId, ref: "articles" },
});

module.exports = comment = mongoose.model("comments", CommentModel);
