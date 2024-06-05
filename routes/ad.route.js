const express = require('express');
const { getAllAds, createAd, watchAd, getAllOnboarding, addOnboarding } = require('../controllers/ad.contoller');

const router = express.Router();

router.get('/ads', getAllAds);
router.post('/ads/add', createAd);
router.post('/watchAd', watchAd)
router.get('/onboarding', getAllOnboarding)
router.post('/onboarding/add', addOnboarding)

module.exports = router;