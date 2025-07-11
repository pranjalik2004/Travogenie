const express = require("express");
const {getFlights}= require("../controller/TravelController.js")

const router = express.Router();

router.get("/flights", getFlights);

module.exports = router;
