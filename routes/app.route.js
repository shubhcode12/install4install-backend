const express = require("express");
const {
  getAllApps,
  removeApp,
  registerApp,
  addToInstalledApps,
} = require("../controllers/app.controller");

const router = express.Router();

router.get("/apps", getAllApps);
router.delete("/apps/remove", removeApp);
router.put("/apps/register", registerApp);
router.put("/apps/addInstalledApp", addToInstalledApps);


module.exports = router;
