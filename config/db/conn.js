const mongoose = require("mongoose");
require("dotenv").config();
console.log(process.env);
try {
  mongoose.connect(process.env.ATLAS_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
} catch (err) {
  console.log(err);
}
