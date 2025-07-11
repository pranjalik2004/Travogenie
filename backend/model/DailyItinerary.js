const mongoose = require("mongoose");
const { Schema } = mongoose;

// Sub-schema for individual items within a day's plan
const PlanItemSchema = new Schema({
    timeSlot: String, // e.g., "Morning", "9:00 AM - 11:00 AM"
    activityType: String, // e.g., "Sightseeing", "Dining", "Activity"
    placeName: String,
    placeDetails: String,
    image_url: String, // Standardized image URL key
    geoCoordinates: {
        latitude: Number,
        longitude: Number,
    },
    ticketPricing: { // Object structure for pricing
        amount: Number,
        currency: String,
        details: String, // e.g., "Per person", "Free entry", "Includes guide"
    },
    rating: Number, // Store as number
    estimatedDuration: String, // e.g., "2 Hours", "1.5-2 Hours"
    travelToNext: String, // Notes on traveling to the next spot
}, { _id: false }); // No separate ID for each plan item usually needed

// Sub-schema for a single day's itinerary
const DailyItinerarySchema = new Schema({
    day: Number,
    date: String, // Optional: Specific date (e.g., "2024-08-15")
    theme: String, // e.g., "Cultural Exploration", "Adventure Day"
    dailyPlan: [PlanItemSchema], // Array of plan items for the day
}, { _id: false });

// Sub-schema for hotel options
const HotelOptionSchema = new Schema({
    name: String,
    address: String,
    price: { // Object structure for price
        amount: Number, // Parsed primary amount
        currency: String, // e.g., "INR", "USD"
        details: String, // Store the original price string here (e.g., "₹400-₹1100 (Dorm/Private)")
        perNight: Boolean, // Indicate if price is likely per night
    },
    image_url: String, // Standardized image URL key
    geoCoordinates: {
        latitude: Number,
        longitude: Number,
    },
    rating: Number, // Store as number
    description: String,
}, { _id: false });

// Main Trip Itinerary Schema
const TripiternarySchema = new Schema({
    // Removed redundant fields from travelPlan root, relying on nested objects
    // If you need user association, add: userId: { type: Schema.Types.ObjectId, ref: 'User' }

    travelPlan: {
        // --- Trip Definition ---
         // Consider adding location object here if needed separate from tripDetails
         // location: {
         //    name: String,
         //    description: String,
         //    geo_coordinates: { latitude: Number, longitude: Number },
         //    image_url: String
         // },
        tripDetails: { // Details provided by AI/User about the trip itself
            location: String, // Name of the location (can be redundant if main location obj exists)
            duration: String, // e.g., "2 Days"
            targetAudience: String, // e.g., "Solo Traveler", "Family"
            budgetType: String, // e.g., "Cheap", "Moderate", "Luxury"
            notes: String, // General notes about the trip plan
        },

        // --- Options & Plans ---
        hotelOptions: [HotelOptionSchema], // Array of suggested hotels
        dailyItinerary: [DailyItinerarySchema], // Array of daily plans
    },
}, { timestamps: true }); // Add createdAt and updatedAt timestamps

// Create and export the model
// Using "TripDatas" as the collection name based on user's previous code
const TripiternaryModel = mongoose.model("TripDatas", TripiternarySchema);
module.exports = TripiternaryModel;