const mongoose = require("mongoose");
const User = require("../models/user.schema");
const CONSTANT = require("../utils/constants")


const getUserCoins = async (req, res) => {
  const { uid } = req.body;
  try {
    const currUser = await User.findOne({ uid });
    if (!currUser) {
      return res.status(404).send("User not found");
    }

    currUser.coins += CONSTANT.bonusSignupCoins;
    await currUser.save();

    res.send(`${CONSTANT.bonusSignupCoins} Coins added to user ${uid}`);
  } catch (error) {
    console.error("Error adding coins:", error);
    res.status(500).send("Internal Server Error");
  }
};

const getDailyCheckin = async (req, res) => {
  const { uid } = req.body;

  try {
    const currUser = await User.findOne({ uid });
    if (!currUser) {
      return res.status(404).send("User not found");
    }

    const today = new Date().setHours(0, 0, 0, 0);
    if (
      !currUser.lastRewardRecievedAt ||
      currUser.lastRewardRecievedAt < today
    ) {
      currUser.coins += CONSTANT.dailyCoinReward;
      currUser.lastRewardRecievedAt = Date.now();
      currUser.spinAvailable += 3;
      await currUser.save();
      res.send(`Daily coins and spins added to user ${uid}`);
    } else {
      res.send("Already earned daily coins, try next day");
    }
  } catch (error) {
    console.error("Error adding coins:", error);
    res.status(500).send("Internal Server Error");
  }
};

const getSpinnerValues = async (req, res) => {
  const { uid } = req.body;

  try {
    const currUser = await User.findOne({ uid });
    if (!currUser) {
      return res.status(404).send("User not found");
    }

    const valuesForTarget = CONSTANT.valuesForTarget;
    const spinTarget = getRandomSpinTarget(valuesForTarget);

    currUser.spinTarget = spinTarget;
    await currUser.save();

    const valuesToDisplay = CONSTANT.valuesForSpinner;
    res.json({ spinTarget, valuesToDisplay });
  } catch (error) {
    console.error("Error getting spinner values:", error);
    res.status(500).send("Internal Server Error");
  }
};

const spinTheWheel = async (req, res) => {
  const { uid } = req.body;

  try {
    const currUser = await User.findOne({ uid });
    if (!currUser) {
      return res.status(404).send("User not found");
    }

    if (currUser.spinAvailable > 0) {
      const coinTarget = currUser.spinTarget;

      currUser.coins += coinTarget;
      currUser.spinAvailable -= 1;
      await currUser.save();

      res.json({ extraCoins: coinTarget, totalCoins: currUser.coins });
    } else {
      res.json(
        "Insufficient spins, please try rewarded ads or after some time"
      );
    }
  } catch (error) {
    console.error("Error spinning the wheel:", error);
    res.status(500).send("Internal Server Error");
  }
};

function getRandomSpinTarget(arr) {
  const randomIndex = Math.floor(Math.random() * arr.length);
  return arr[randomIndex];
}

module.exports = {
  getUserCoins,
  getDailyCheckin,
  getSpinnerValues,
  spinTheWheel,
};
