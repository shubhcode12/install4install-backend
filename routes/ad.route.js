const express = require('express');
const { getAllAds, createAd } = require('../controllers/ad.contoller');

const router = express.Router();

router.get('/ads', getAllAds);
router.post('/ads/add', createAd);

module.exports = router;