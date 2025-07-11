const mongoose = require("mongoose");

const TripData = new mongoose.Schema({
  location: {
    name: String,
    description: String,
    
    image_url: String
  },
  hotels: [
    {
      name: String,
      address: String,
      price_range: String,
      image_url: String,
      geo_coordinates: {
        latitude: Number,
        longitude: Number
      },
      ratings: Number,
      description: String,
      amenities: [String]
    }
  ],
  nearby_attractions: [
    {
      name: String,
      details: String,
      image_url: String,
      geo_coordinates: {
        latitude: Number,
        longitude: Number
      },
      ticket_pricing: String,
      distance_from_mahabaleshwar: String,
      activities: [String]
    }
    
  ]
});

const Trip = mongoose.model("TripData", TripData);

module.exports = Trip;