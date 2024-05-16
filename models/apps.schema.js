const mongoose = require("mongoose");

const { Schema } = mongoose;

const AppSchema = new Schema({
  developerUid:{type:String},
  appName: { type: String, required: true },
  appUrl: { type: String, required: true, unique: true },
  appPackageName: { type: String, required: true, unique: true },
  appDescription: { type: String, required: true },
  appIconUrl: { type: String, required: true },
  totalAppInstalls: { type: Number, default: 0}
});

const User = mongoose.model("App", AppSchema);

module.exports = User;
