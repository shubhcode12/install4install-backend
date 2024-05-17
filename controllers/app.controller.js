const mongoose = require("mongoose");
const App = require("../models/apps.schema");
const User = require("../models/user.schema");
const CONSTANT = require("../utils/constants")


const getAllApps = async (req, res) => {
  try {
    const { uid, limit, page } = req.body;

    const user = await User.findOne({ uid });
    if (!user) {
      console.error("User not found");
      return res.status(404).json({ error: "User not found" });
    }

    const apps = await App.find({
      appPackageName: { $nin: user.installedApps },
    })
      .limit(limit)
      .skip((page - 1) * limit);
      
    res.json(apps);
  } catch (error) {
    console.error("Error fetching apps:", error);
    res.status(500).json({ error: "Error fetching apps", details: error.message });
  }
};

const removeApp = async (req, res) => {
  const { uid, packageId } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findOne({ uid }).session(session);
    if (!user) {
      console.error("User not found");
      return res.status(404).json({ error: "User not found" });
    }

    const index = user.promotedApps.findIndex(
      (app) => app.appPackageName === packageId
    );
    if (index !== -1) {
      user.promotedApps.splice(index, 1);

      await App.deleteOne({ appPackageName: packageId }).session(session);

      await user.save();

      await session.commitTransaction();
      session.endSession();

      return res.json({
        message: "App removed from promotedApps and app collection",
        user: user,
      });
    } else {
      return res.status(404).json({ error: "App not found in promotedApps" });
    }
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error removing app:", error);
    res.status(500).json({
      error: "Error removing app from promotedApps",
      details: error.message,
    });
  }
};

const registerApp = async (req, res) => {
  const {
    developerUid,
    appName,
    appUrl,
    appPackageName,
    appDescription,
    appIconUrl,
  } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findOne({ uid: developerUid });
    if (!user) {
      console.error("User not found");
      return res.status(404).json({ error: "User not found" });
    }

    const newApp = new App({
      developerUid,
      appName,
      appUrl,
      appPackageName,
      appDescription,
      appIconUrl,
    });

    user.promotedApps.push(newApp);

    await newApp.save({ session });

    await user.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json([
      { message: "App registered from promotedApps:", user },
      { message: "App added in App Collection: ", newApp },
    ]);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error registering app:", error);
    res.status(500).json({ error: "Error registering app", details: error.message });
  }
};

const addToInstalledApps = async (req, res) => {
  const { uid, appPackageName } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const currUser = await User.findOne({ uid: uid }).session(session);
    if (!currUser) {
      throw new Error("User not found");
    }

    currUser.installedApps.push(appPackageName);

    const currApp = await App.findOne({
      appPackageName: appPackageName,
    }).session(session);
    const developerUid = currApp.developerUid;

    const currDeveloper = await User.findOne({ uid: developerUid }).session(
      session
    );

    const promotedApp = currDeveloper.promotedApps.find(
      (app) => app.appPackageName === appPackageName
    );

    promotedApp.totalAppInstalls++;
    currUser.coins += CONSTANT.appInstallRewardCoins;

    await currUser.save({ session });
    currDeveloper.markModified("promotedApps");
    await currDeveloper.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({ message: "App is installed, you won 5 coins", coins: currUser.coins });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error adding installed app:", error);
    res.status(500).json({ error: "Error adding installed app", details: error.message });
  }
};

module.exports = { getAllApps, removeApp, registerApp, addToInstalledApps };
