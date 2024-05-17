const { OAuth2Client } = require("google-auth-library");
const User = require("../models/user.schema");

const CLIENT_ID = process.env.GOOGLE_AUTH_CLIENT_ID;
const client = new OAuth2Client(CLIENT_ID);

const verifyToken = async (req, res, next) => {
  try {
    const authToken = req.headers.authorization.split("Bearer ")[1];
    const ticket = await client.verifyIdToken({
      idToken: authToken,
      audience: CLIENT_ID,
    });
    const payload = ticket.getPayload();
    req.userData = payload;
    console.log(payload);
    next();
  } catch (error) {
    res.status(401).json({ error: "Error verifying token" });
  }
};

const authUser = async (req, res) => {
  const { sub, name, email } = req.userData;

  try {
    const user = await User.findOne({ uid: sub });

    if (user) {
      res.json({ "user authenticated: ": user });
    } else {
      console.log("User not found, creating new user");
      const newUser = new User({ uid: sub, name: name, email: email });
      await newUser.save();

      res.json({ "new user created": newUser });
    }
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ "Error fetching users": error.message });
  }
};

module.exports = {
  verifyToken,
  authUser,
};
