const Ad = require("../models/ad.schema");
const User = require("../models/user.schema");
const CONSTANT = require("../utils/constants");


const getAllAds = async (req, res) => {
  try {
    const ads = await Ad.find({});
    res.json(ads);
  } catch (error) {
    res.status(500).json({ error: "Error fetching ads", details: error });
  }
};

const createAd = async (req, res) => {
  try {
    const { imageUrl, link } = req.body;
    const newAd = new Ad({ imageUrl, link });
    const savedAd = await newAd.save();
    res.json(savedAd);
  } catch (error) {
    res.status(500).json({ error: "Error adding ad", details: error });
  }
};

const watchAd = async (req, res) => {
  try {
    const { uid } = req.body;
    const user = await User.findOne({ uid });
    if (!user) {
      console.error("User not found");
      return res.status(404).json({ error: "User not found" });
    }
    user.spinAvailable += CONSTANT.watchAdRewardSpin;
    await user.save();
    res.json({message : `ad watched and earned ${CONSTANT.watchAdRewardSpin} spins`})
  } catch (error) {
    res.status(500).json({ error: "Error adding ad", details: error });
  }
}

module.exports = { getAllAds, createAd, watchAd };
