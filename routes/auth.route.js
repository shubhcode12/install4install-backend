const express = require("express");
const { verifyToken, authUser } = require("../controllers/auth.controller");

const router = express.Router();

router.post('/auth', verifyToken, authUser);

module.exports = router;
