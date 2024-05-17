const mongoose = require("mongoose");

const { Schema } = mongoose;

const UserSchema = new Schema({
  uid: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  coins: { type: Number, default: 0 },
  installedApps: { type: Array, default: [] },
  promotedApps: { type: Array, default: [] },
  createdAt: { type: Date, default: Date.now },
  lastRewardRecievedAt: { type: String },
  spinTarget: { type: Number, default: 0 },
  spinAvailable:{type:Number,default:0}
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
