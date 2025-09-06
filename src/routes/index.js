"use strict";

const express = require("express");
const { apiKey } = require("../auth/checkAuth");
const router = express.Router();

// Check apiKey
router.use(apiKey);
// Check permission

router.use('/v1/api', require("./access"));


module.exports = router;
