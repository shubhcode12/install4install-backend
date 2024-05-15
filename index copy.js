require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const App = require("./modal/apps.schema");
const User = require("./modal/user.schema");

const app = express();

const url =
  "mongodb+srv://giantwheeltech:agz0ZBmiZXsAzts4@cluster0.x2zap4z.mongodb.net/install4install?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(url).then(() => console.log("DB Connected!"));

app.use(express.json());

async function addApp(newAppData) {
  try {
    const newApp = new App(newAppData);
    const savedApp = await newApp.save();
    console.log("New app added:", savedApp);
    return savedApp;
  } catch (error) {
    console.error("Error adding app:", error);
    throw error;
  }
}

async function addUser(userData) {
  try {
    const newUser = new User(userData);
    const savedUser = await newUser.save();
    console.log("New user added:", savedUser);
    return savedUser;
  } catch (error) {
    console.error("Error adding user:", error);
    throw error;
  }
}

//   const newAppData = {
//     appName: 'NewApp',
//     appUrl: 'https://example.com/newapp2',
//     appPackageName: 'com.example.newapp2',
//     appDesciption: 'Exciting new app',
//     appIconUrl: 'https://example.com/newappicon.png',
//   };

//   addApp(newAppData);

const userData = {
  uid: "123456789", // User ID
  email: "user@example.com", // User email
  name: "John Doe", // User name
  coins: "100", // User coins
  installedApps: ["com.example.app10", "com.example.app3", "com.example.app8"], // Array of installed app package names
  promotedApps: ["com.app3", "com.app4"], // Array of promoted app package names
};

//addUser(userData);

async function fetchApps() {
  try {
    const apps = await App.find({});
    console.log("All apps:", apps);
  } catch (error) {
    console.error("Error fetching apps:", error);
  }
}

//fetchApps();

async function printAppsNotInstalled(uid) {
  try {
    // Find the user by uid
    const user = await User.findOne({ uid });
    if (!user) {
      console.log("User not found");
      return;
    }

    // Find 10 apps that are not in the installedApps array of the user
    const apps = await App.find({
      appPackageName: { $nin: user.installedApps },
    }).limit(10);
    console.log("Apps not installed by user:", apps);
  } catch (error) {
    console.error("Error printing apps:", error);
  }
}

printAppsNotInstalled("123456789");

app.get("/", (req, res) => {
  res.send("working");
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
