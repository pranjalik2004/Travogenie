// Schema (if you need it for reference, but shouldn't require changes)

const mongoose = require("mongoose");

const tripdata1 = new mongoose.Schema({
    name: { type: String, required: true }, // Added name as required
    location: {
        name: { type: String, required: true },
        description: { type: String, required: true },
        image_url: String,
    },
    category: { type: String, required: false },
    best_season: { type: String, required: true },
    packages: [
        {
            name: String,
            price: String,
        },required=false
    ],
    hotels: [
        {
            name: String,
            address: String,
            price_range: String,
            image_url: String,
            geo_coordinates: {
                latitude: Number,
                longitude: Number,
            },
            ratings: {
                type: Number,
                min: 0,
                max: 5,
            },
            description: String,
            amenities: [String],
        },
    ],
    nearby_attractions: [
        {
            name: String,
            details: String,
            image_url: String,
            geo_coordinates: {
                latitude: Number,
                longitude: Number,
            },
            ticket_pricing: String,
            distance_from_mahabaleshwar: String,
            activities: [String],
        },
    ]

});

const SpotTrip = mongoose.model("Tripdata1", tripdata1);

module.exports = SpotTrip; // Changed model name