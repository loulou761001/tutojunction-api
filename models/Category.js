const mongoose = require("mongoose");

const { ObjectId } = require("mongodb");

const CategoryModel = mongoose.Schema({
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
  name: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },

  parent: { type: ObjectId },
});

module.exports = category = mongoose.model("categories", CategoryModel);
