const Ad = require("../models/ad.schema");
const User = require("../models/user.schema");
const CONSTANT = require("../utils/constants");
const Onboarding = require("../models/onboarding.schema")


const getAllAds = async (req, res) => {
  try {
    const ads = await Ad.find({});
    res.json(ads);
  } catch (error) {
    res.status(500).json({ message: "Error fetching ads", error: error.message });
  }
};

const createAd = async (req, res) => {
  try {
    const { imageUrl, link } = req.body;
    const newAd = new Ad({ imageUrl, link });
    const savedAd = await newAd.save();
    res.json(savedAd);
  } catch (error) {
    res.status(500).json({ message: "Error adding ad", error: error.message });
  }
};

const watchAd = async (req, res) => {
  try {
    const { uid } = req.body;
    const user = await User.findOne({ uid });
    if (!user) {
      console.error("User not found");
      return res.status(404).json({error : "unable to fetch user", message: "User not found" });
    }
    user.spinAvailable += CONSTANT.watchAdRewardSpin;
    await user.save();
    res.json({message : `ad watched and earned ${CONSTANT.watchAdRewardSpin} spins`})
  } catch (error) {
    res.status(500).json({ message: "Error adding ad", error: error.message });
  }
}

const getAllOnboarding = async (req, res) => {
  try {
    const data = await Onboarding.find({});
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Error onboarding screens", error: error.message });
  }
};

const addOnboarding = async (req, res) => {
  try {
    const { title , imageUrl, description } = req.body;
    const newOnboarding = new Onboarding({ title, imageUrl, description });
    const savedOnBoard = await newOnboarding.save();
    res.json(savedOnBoard);
  } catch (error) {
    res.status(500).json({ message: "Error adding onborading sscreen", error: error.message });
  }
};



module.exports = { getAllAds, createAd, watchAd, getAllOnboarding, addOnboarding };
