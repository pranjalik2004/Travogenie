const axios = require("axios");
require("dotenv").config();
console.log("API Key:", process.env.AVIATIONSTACK_API_KEY);

const API_KEY = process.env.AVIATIONSTACK_API_KEY; // Use environment variables for security

// Function to fetch flight data
const getFlights = async (req, res) => {
  try {
    const response = await axios.get(
      `http://api.aviationstack.com/v1/flights?access_key=${API_KEY}`
    );

    res.json(response.data);
  } catch (error) {
    console.error("Error fetching flight data:", error);
    res.status(500).json({ error: "Failed to fetch flight data" });
  }
};

module.exports = { getFlights };
