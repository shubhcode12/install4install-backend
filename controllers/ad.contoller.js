const Ad = require("../models/ad.schema");

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

module.exports = { getAllAds, createAd };
