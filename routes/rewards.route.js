const express = require("express");
const {
  getUserCoins,
  getDailyCheckin,
  getSpinnerValues,
  spinTheWheel,
} = require("../controllers/reward.controller");

const router = express.Router();

router.post("/coins", getUserCoins);
router.get("/dailycoin", getDailyCheckin);
router.post("/getSpinnerValues", getSpinnerValues);
router.post("/spinTheWheel", spinTheWheel);

module.exports = router;
