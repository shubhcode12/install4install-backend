const mongoose = require("mongoose");

const { Schema } = mongoose;

const Adschema = new Schema({
  imageUrl: { type: String, required: true },
  link: { type: String, required: true },
});

const User = mongoose.model("Ad", Adschema);

module.exports = User;
