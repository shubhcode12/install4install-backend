const mongoose = require("mongoose");

const { Schema } = mongoose;

const AppSchema = new Schema({
  appName: { type: String, required: true },
  appUrl: { type: String, required: true, unique: true },
  appPackageName: { type: String, required: true, unique: true },
  appDesciption: { type: String, required: true },
  appIconUrl: { type: String, required: true },
});

const User = mongoose.model("App", AppSchema);

module.exports = User;
