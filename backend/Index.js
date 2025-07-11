require('dotenv').config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const spotRouter = require("./Routes/Upload.js");
const connectDb = require("./config/db.js");

const wishlistRoutes = require("./Routes/wishlistRoutes.js");
const userRouter = require("./Routes/userRoute.js");
const { isTokenBlacklisted } = require("./controller/userController.js");
const axios = require("axios");

const app = express();
connectDb();

app.use(bodyParser.json());
app.use("/uploads", express.static("uploads"));

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: "GET, POST, PUT, DELETE",
    allowedHeaders: "Content-Type, Authorization",
  })
);

// Routes
app.use("/api/spot", spotRouter);
app.use(express.json());
app.use(isTokenBlacklisted);
app.use("/api/user", userRouter);
app.use('/api/wishlist', wishlistRoutes); 

// Test Route
app.get("/api/test/:id", (req, res) => {
  console.log("Test route received ID:", req.params.id);
  res.json({ message: "Test route working!", id: req.params.id });
});

// Places Route - Autocomplete search
app.get("/places", async (req, res) => {
  try {
    const { input } = req.query;
    if (!input) {
      return res.status(400).json({ error: "Missing input query parameter" });
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY; // ✅ Use env variable

    if (!apiKey) {
      return res.status(500).json({ error: "Google Maps API key not set in environment variables" });
    }

    const apiUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${input}&key=${apiKey}`;

    const response = await axios.get(apiUrl);
    res.json(response.data);
  } catch (error) {
    console.error("Google API Error:", error.response ? error.response.data : error.message);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

// Get Hotel Image from Google Maps API
const API_KEY = process.env.GOOGLE_MAPS_API_KEY; 
app.get("/getHotelImage", async (req, res) => {
  try {
    const placeId = req.query.place_id; // Get Place ID from request

    if (!placeId) return res.status(400).json({ error: "Missing place_id" });

    const detailsUrl = `https://maps.gomaps.pro/maps/api/place/details/json?place_id=${placeId}&key=${API_KEY}`;
    const detailsResponse = await axios.get(detailsUrl);

    const photos = detailsResponse.data.result?.photos;
    if (!photos || photos.length === 0) return res.json({ error: "No images found" });

    const photoReference = photos[0].photo_reference;
    const imageUrl = `https://maps.gomaps.pro/maps/api/place/photo?photo_reference=${photoReference}&maxwidth=400&key=${API_KEY}`;

    res.json({ imageUrl });
  } catch (error) {
    console.error("Error fetching hotel image:", error);
    res.status(500).json({ error: "Failed to fetch hotel image", details: error.message });
  }
});

// Get Place Details Route
app.get("/api/getPlaceDetails", async (req, res) => {
  const { place_id } = req.query;

  if (!place_id) {
      return res.status(400).json({ error: "Missing place_id parameter" });
  }

  try {
      const response = await axios.get(
          `https://maps.gomaps.pro/maps/api/place/details/json`,
          {
              params: {
                  place_id: place_id,
                  key: API_KEY, // Use backend API key
              },
          }
      );

      res.json(response.data);
  } catch (error) {
      console.error("Error fetching place details:", error);
      res.status(500).json({ error: "Failed to fetch place details", details: error.message });
  }
});

// Server Setup
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
