const express = require('express');
const { getAllAds, createAd, watchAd } = require('../controllers/ad.contoller');

const router = express.Router();

router.get('/ads', getAllAds);
router.post('/ads/add', createAd);
router.post('/watchAd', watchAd)

module.exports = router;