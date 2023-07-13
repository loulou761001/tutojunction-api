const mongoose = require("mongoose");

const { ObjectId } = require("mongodb");

const FileModel = mongoose.Schema({
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
  uploader: {
    type: ObjectId,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  placeholder: {
    type: String,
    required: false,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
});

module.exports = file = mongoose.model("files", FileModel);
