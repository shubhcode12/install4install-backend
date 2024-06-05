const mongoose = require("mongoose");

const { Schema } = mongoose;

const OnboardingSchema = new Schema({
  title: { type: String, required: true },
  imageUrl: { type: String, required: true },
  description: { type: String, required: true },
});

const Onboarding = mongoose.model("Onboarding", OnboardingSchema);

module.exports = Onboarding;
