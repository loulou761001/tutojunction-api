const mongoose = require("mongoose");

const { ObjectId } = require("mongodb");

const ModMessageModel = mongoose.Schema({
  created_at: {
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
  open: {
    type: Boolean,
    default: false,
  },
  object: {
    type: String,
    required: true,
  },
});

module.exports = ModMessage = mongoose.model("modMessages", ModMessageModel);
