const mongoose = require("mongoose");

const TripiternarySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  location: {
    name: { type: String, required: false },
    description: { type: String, required: false },
    image_url: { type: String, required: false },
  },

  hotels: [
    {
      name: String,
      address: String,
      price: {
        amount: Number,
        currency: String,
        perNight: Boolean
      },
      image_url: String,
      geoCoordinates: {
        latitude: Number,
        longitude: Number
      },
      rating: Number,
      description: String,
      bookingDate: String,
      lastDate: String
    }
  ],
  daily_itinerary: [
    {
      day: { type: Number, required: false },
      date: { type: String, required: false },
      theme: { type: String, required: false },
      dailyPlan: [
        {
          timeSlot: { type: String, required: false },
          activityType: { type: String, required: false },
          placeName: { type: String, required: false },
          placeDetails: { type: String, required: false },
          image_url: { type: String, required: true },
          geoCoordinates: {
            latitude: { type: Number, required: false },
            longitude: { type: Number, required: false },
          },
          ticketPricing: {
            amount: { type: Number, required: false },
            currency: { type: String, required: false },
            details: { type: String, required: false },
          },
          rating: { type: Number, required: false },
          estimatedDuration: { type: String, required: false },
          travelToNext: { type: String, required: false },
        },
      ],
    },
  ],

  trip_details: {
    location:{type:String, requried:false},
    duration: { type: String, required: false },
    targetAudience: { type: String, required: false },
    budgetType: { type: String, required: false },
    notes: { type: String, required: false },
  },

  raw_ai_response: { type: mongoose.Schema.Types.Mixed, required: false },
});

const TripiternaryModel = mongoose.model("TripDatas3", TripiternarySchema);
module.exports = TripiternaryModel;