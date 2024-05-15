const mongoose = require("mongoose");

const { Schema } = mongoose;

const UserSchema = new Schema({
    uid: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    coins: { type: Number, required: true },
    installedApps: { type: Array, required: true },
    promotedApps: { type: Array, required: true },
    createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
