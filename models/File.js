const mongoose = require("mongoose");

const { ObjectId } = require("mongodb");

const FileModel = mongoose.Schema({
  created_at: {
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
  public_id: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
});

module.exports = file = mongoose.model("files", FileModel);
