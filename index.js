require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const App = require("./modal/apps.schema");
const User = require("./modal/user.schema");
const Ad = require("./modal/ad.schema");

const app = express();

const url =
  "mongodb+srv://giantwheeltech:agz0ZBmiZXsAzts4@cluster0.x2zap4z.mongodb.net/install4install?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(url).then(() => console.log("DB Connected!"));

app.use(express.json());

app.get("/", (req, res) => {
  res.send("working");
});

app.get("/ads", async (req, res) => {
  try {
    const ads = await Ad.find({});
    res.json(ads);
  } catch (error) {
    res.json({ "Error fetching ads:": error });
  }
});

app.post("/ads/add", async (req, res) => {
  try {
    const { imageUrl, link } = req.body;

    const newAd = new Ad({ imageUrl, link });
    const savedAd = await newAd.save();
    res.json(savedAd);
  } catch (error) {
    res.json({ "Error adding ad:": error });
  }
});

app.get("/user", async (req, res) => {
  const userID = "123456789"; //this user ID is feched from auth token and then checked if user with this ID already exist or not,
  //if user eixst we return user else we reate and then return user

  try {
    const users = await User.find({ uid: userID });
    res.json(users);
  } catch (error) {
    res.json({ "Error fetching users:": error });
  }
});

app.post("/coin", async (req, res) => {
  const uid = req.body.uid;
  console.log(req.body.uid);

  try {
    const currUser = await User.findOne({ uid: uid });
    if (!currUser) {
      return res.status(404).send("User not found");
    }

    currUser.coins += 10;

    await currUser.save();

    res.send("Coins added to user " + uid);
  } catch (error) {
    console.error("Error adding coins:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/apps", async (req, res) => {
  try {
    const { uid, limit, page } = req.body;
    // Find the user by uid

    const user = await User.findOne({ uid });
    if (!user) {
      console.log("User not found");
      return;
    }

    // Find 10 apps that are not in the installedApps array of the user
    const apps = await App.find({
      appPackageName: { $nin: user.installedApps },
    })
      .limit(limit)
      .skip((page - 1) * limit);
    res.json(apps);
  } catch (error) {
    res.json({ "Error printing apps:": error });
  }
});

app.delete("/removeApp", async (req, res) => {
  const { uid, packageId } = req.body;

  try {
    // Find the user by uid
    const user = await User.findOne({ uid });
    if (!user) {
      console.log("User not found");
      return;
    }

    // Find the index of the app to remove
    const index = user.promotedApps.indexOf(packageId);
    if (index !== -1) {
      // Remove the app from the promotedApps array
      user.promotedApps.splice(index, 1);
      // Save the updated user document
      await user.save();
    }
    res.json({ "App removed from promotedApps:": user });
  } catch (error) {
    res.json({ "Error removing app from promotedApps:": error });
  }
});

app.put("/registerApp", async (req, res) => {
  const { uid, packageId } = req.body;

  try {
    // Find the user by uid
    const user = await User.findOne({ uid });
    if (!user) {
      console.log("User not found");
      return;
    }

    // Remove the app from the promotedApps array
    user.promotedApps.push(packageId);
    // Save the updated user document
    await user.save();

    res.json({ "App registered from promotedApps:": user });
  } catch (error) {
    res.json({ "Error registering app from promotedApps:": error });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
