const express = require("express");
const router = express.Router();
const { submitHrRequest } = require("../controller/hrController");

router.post("/request-hr", submitHrRequest);

module.exports = router;
