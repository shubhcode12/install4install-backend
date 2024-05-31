const mongoose = require("mongoose");
const App = require("../models/apps.schema");
const User = require("../models/user.schema");
const CONSTANT = require("../utils/constants");
const axios = require("axios");
const cheerio = require("cheerio");

const getAllApps = async (req, res) => {
  try {
    const { uid, limit, page } = req.body;

    const user = await User.findOne({ uid });
    if (!user) {
      console.error("User not found");
      return res
        .status(404)
        .json({ error: error.message, message: "User not found" });
    }

    // Extract app package names from promotedApps
    const promotedAppPackageNames = user.promotedApps.map(
      (app) => app.appPackageName
    );

    // Combine installedApps and promotedAppPackageNames into one array
    const combinedExcludedApps = [
      ...user.installedApps,
      ...promotedAppPackageNames,
    ];

    // Find apps not in the combinedExcludedApps array
    let apps = await App.find({
      appPackageName: { $nin: combinedExcludedApps },
    });

    // Filter out apps where the developer does not have enough coins
    const filteredApps = [];
    for (const app of apps) {
      const developer = await User.findOne({ uid: app.developerUid });
      if (developer && developer.coins >= CONSTANT.appPromotionCost) {
        filteredApps.push(app);
      }
    }

    // Apply pagination
    const paginatedApps = filteredApps.slice((page - 1) * limit, page * limit);
    const isNextPageAvailable = filteredApps.length > page * limit;
    if (paginatedApps.length > 0) {
      res.json({ hasNextPage: isNextPageAvailable, data: paginatedApps });
    } else {
      res.status(404).json({ error: "No apps", message: "Apps not found" });
    }
  } catch (error) {
    console.error("Error fetching apps:", error);
    res
      .status(500)
      .json({ message: "Error fetching apps", error: error.message });
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
    res
      .status(500)
      .json({ error: "Error registering app", details: error.message });
  }
};

const addToInstalledApps = async (req, res) => {
  const { uid, appPackageName } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const currUser = await User.findOne({ uid: uid }).session(session);
    if (!currUser) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ error: "User not found" });
    }

    const alreadyInstalledApp = currUser.installedApps.includes(appPackageName);
    if (alreadyInstalledApp) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ error: "App already installed" });
    }

    currUser.installedApps.push(appPackageName);

    const currApp = await App.findOne({
      appPackageName: appPackageName,
    }).session(session);
    if (!currApp) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ error: "App not found" });
    }
    const developerUid = currApp.developerUid;

    const currDeveloper = await User.findOne({ uid: developerUid }).session(
      session
    );
    if (!currDeveloper) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ error: "Developer not found" });
    }

    const promotedApp = currDeveloper.promotedApps.find(
      (app) => app.appPackageName === appPackageName
    );
    if (!promotedApp) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ error: "Promoted app not found" });
    }

    promotedApp.totalAppInstalls++;
    currUser.coins += CONSTANT.appInstallRewardCoins;

    await currUser.save({ session });

    if (currDeveloper.coins <= CONSTANT.appPromotionCost) {
      currDeveloper.coins = 0;
    } else {
      currDeveloper.coins -= CONSTANT.appPromotionCost;
    }

    // Mark the promotedApp and coins as modified
    currDeveloper.markModified("promotedApps");
    currDeveloper.markModified("coins");

    await currDeveloper.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({
      message: "App is installed, you won 5 coins",
      coins: currUser.coins,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error({
      error: error.message,
      message: "Error adding installed app",
    });
    res
      .status(500)
      .json({ error: "Error adding installed app", details: error.message });
  }
};

const getAppDetails = async (req, res) => {
  const body = req.body;

  scrapAppDetails(body.packageId)
    .then((details) => res.json(details))
    .catch((error) => res.json({ error: error }));
};

async function scrapAppDetails(packageId) {
  const url = `https://play.google.com/store/apps/details?id=${packageId}`;

  try {
    // Fetch the HTML content of the page
    const { data } = await axios.get(url);

    // Load the HTML into cheerio
    const $ = cheerio.load(data);

    // Extract the application details
    const title = $('h1[itemprop="name"]').text();
    const developer = $("div.tv4jIf > div.Vbfug > a > span").text().trim();
    const description = $("div.bARER")
      .text()
      .replace(/<br\s*\/?>/gi, "\n")
      .trim();
    const rating = $("div.TT9eCd")
      .attr("aria-label")
      .match(/Rated ([\d.]+) stars/)[1];
    const reviewsCount = $("span.AYi5wd.TBRnV").text();
    const installs = $("div.wVqUob").first().find(".ClM7O").text();
    const contentRating = $('span[itemprop="contentRating"]').text();
    const icon = $('img[itemprop="image"]').attr("src");
    const screenshots = [];
    $("img.T75of.B5GQxf").each((i, element) => {
      const screenshotUrl = $(element).attr("src");
      screenshots.push(screenshotUrl);
    });

    // Return the extracted details
    return {
      title,
      developer,
      description,
      rating,
      reviewsCount,
      installs,
      contentRating,
      icon,
      screenshots,
    };
  } catch (error) {
    console.error("Error fetching app details:", error);
    return null;
  }
}

module.exports = {
  getAllApps,
  removeApp,
  registerApp,
  addToInstalledApps,
  getAppDetails,
};
