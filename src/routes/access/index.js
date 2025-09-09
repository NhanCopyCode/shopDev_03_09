"use strict";

const express = require("express");
const accessController = require("../../controllers/access.controller");
const router = express.Router();
const asyncHandler = require("../../helpers/asyncHandler.js");
const { authentication } = require("../../auth/authUtils.js");
// signin
router.post("/shop/signup", asyncHandler(accessController.signUp));
// login
router.post("/shop/login", asyncHandler(accessController.login));

//authentication
router.use(authentication);

router.post('/shop/logout', asyncHandler(accessController.logout));

module.exports = router;
