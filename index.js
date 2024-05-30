require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const adRouter = require("./routes/ad.route");
const authRouter = require("./routes/auth.route");
const appRouter = require("./routes/app.route");
const rewardRouter = require("./routes/rewards.route");
const initializeFirebase = require("./config/firebase");
const playstore = require("playstore-scraper");

const app = express();

initializeFirebase();
connectDB();

playstore
  .search("whatsapp")
  .then((res) => {
    console.log(res);
  })
  .catch((err) => console.log(err));

app.use(express.json());
app.use(adRouter);
app.use(authRouter);
app.use(appRouter);
app.use(rewardRouter);

app.get("/", (req, res) => {
  res.send("working");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
