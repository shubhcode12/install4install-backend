const express = require("express");
const {
  getAllApps,
  removeApp,
  registerApp,
  addToInstalledApps,
  getAppDetails
} = require("../controllers/app.controller");

const router = express.Router();

router.post("/apps", getAllApps);
router.delete("/apps/remove", removeApp);
router.put("/apps/register", registerApp);
router.put("/apps/addInstalledApp", addToInstalledApps);
router.post("/getAppDetails", getAppDetails);


module.exports = router;
