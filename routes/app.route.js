const express = require("express");
const {
  getAllApps,
  removeApp,
  registerApp,
  addToInstalledApps,
  getAppDetails,
  getMyRegistredApps
} = require("../controllers/app.controller");

const router = express.Router();

router.post("/apps", getAllApps);
router.delete("/apps/remove", removeApp);
router.put("/apps/register", registerApp);
router.put("/apps/addInstalledApp", addToInstalledApps);
router.post("/getAppDetails", getAppDetails);
router.post("/apps/getRegistredApps", getMyRegistredApps)


module.exports = router;
