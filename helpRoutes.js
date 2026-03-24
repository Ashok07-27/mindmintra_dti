const express = require("express");
const { getEmergencyResources } = require("./helpController");

const router = express.Router();

router.get("/resources", getEmergencyResources);

module.exports = router;



