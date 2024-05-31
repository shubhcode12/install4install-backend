const { OAuth2Client } = require("google-auth-library");
const User = require("../models/user.schema");
const admin = require("firebase-admin");

const initialCoins = 10;

const verifyToken = async (req, res, next) => {
  try {
    const authToken = req.headers.authorization.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(authToken);
    req.userData = decodedToken;
    console.log(decodedToken);
    next();
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

const authUser = async (req, res) => {
  const { sub, name, email } = req.userData;

  try {
    const user = await User.findOne({ uid: sub });

    if (user) {
      res.json({ message: "user authenticated", user: user });
    } else {
      console.log("User not found, creating new user");
      const newUser = new User({ uid: sub, name: name, email: email });
      newUser.coins = initialCoins;

      await newUser.save();

      res.json({ message: "new user created", user: newUser });
    }
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: error.message, message : "auth error" });
  }
};

module.exports = {
  verifyToken,
  authUser,
};
