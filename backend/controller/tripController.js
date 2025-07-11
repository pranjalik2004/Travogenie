const TripiternaryModel = require("../model/TripiternaryModel"); // Adjust path
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET || 'yourSecretKey';
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const PaymentModel=require('../model/Payment')

// --- Helper Functions for Parsing/Transformation ---

const parseRating = (ratingInput) => {
    if (typeof ratingInput === 'number') return ratingInput;
    if (typeof ratingInput === 'string') {
        const match = ratingInput.match(/^(\d+(\.\d+)?)/);
        return match ? parseFloat(match[1]) : null;
    }
    return null;
};

const parsePrice = (priceString) => {
    const result = { amount: null, currency: null, details: priceString, perNight: null };
    if (typeof priceString !== 'string') return result;

    result.details = priceString; // Store original string
    const amountMatch = priceString.match(/(\d[\d,]\.?\d)/); // Match numbers, commas, decimals
    if (amountMatch) {
        result.amount = parseFloat(amountMatch[0].replace(/,/g, ''));
    }
    if (priceString.includes('₹') || priceString.toLowerCase().includes('inr')) result.currency = 'INR';
    else if (priceString.includes('$') || priceString.toLowerCase().includes('usd')) result.currency = 'USD';
    else if (priceString.includes('€') || priceString.toLowerCase().includes('eur')) result.currency = 'EUR';
    // Basic guess for perNight
    result.perNight = priceString.toLowerCase().includes('night') || priceString.toLowerCase().includes('dorm') || priceString.includes('-');

    return result;
};

const parseTicketPricing = (pricingInput) => {
    const result = { amount: null, currency: null, details: pricingInput };
     if (typeof pricingInput !== 'string') return result;

     result.details = pricingInput; // Store original string
     if (pricingInput.toLowerCase().trim() === 'free' || pricingInput.trim() === '0') {
         result.amount = 0;
         result.details = 'Free'; // Standardize detail for free entry
         return result;
     }

    const amountMatch = pricingInput.match(/(\d[\d,]\.?\d)/);
    if (amountMatch) {
        result.amount = parseFloat(amountMatch[0].replace(/,/g, ''));
    }
     if (pricingInput.includes('₹') || pricingInput.toLowerCase().includes('inr')) result.currency = 'INR';
    else if (pricingInput.includes('$') || pricingInput.toLowerCase().includes('usd')) result.currency = 'USD';
     else if (pricingInput.includes('€') || pricingInput.toLowerCase().includes('eur')) result.currency = 'EUR';

     return result;
};



// --- Controller function to save the itinerary ---
const saveiternary = async (req, res) => {
  console.log("Backend received raw request body:", JSON.stringify(req.body, null, 2));

  // ✅ Clean and extract numeric price
  const parsePrice = (value) => {
    if (typeof value === "string") {
      // Match full number including commas like 12,000 or 15000
      const match = value.replace(/,/g, "").match(/\d+/); // remove commas, then extract digits
 
      if (match && match[0]) {
        const amount = parseInt(match[0], 10);
        return {
          amount,
          currency: "INR",
        };
      }
    }
 
    // If already a number
    if (typeof value === "number") {
      return {
        amount: Math.round(value),
        currency: "INR",
      };
    }
 
    // Default fallback
    return {
      amount: 0,
      currency: "INR",
    };
  };
 
  // Optional: parse ticket price and rating
  const parseTicketPricing = (value) => {
    const amount = parseFloat(value);
    return isNaN(amount) ? 0 : amount;
  };

  const parseRating = (value) => {
    const rating = parseFloat(value);
    return isNaN(rating) ? 0 : rating;
  };

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized: Missing token" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const inputData = req.body;

    const transformedData = {
      userId,
      trip_details: inputData.trip_details || {},

      hotels: (inputData.hotels || []).map(hotel => ({
        name: hotel.name || '',
        address: hotel.address || '',
        price: parsePrice(hotel.price), // ✅ fixed here
        image_url: hotel.image_url || '',
        geoCoordinates: {
          latitude: parseFloat(hotel?.geoCoordinates?.latitude) || null,
          longitude: parseFloat(hotel?.geoCoordinates?.longitude) || null,
        },
        rating: parseFloat(hotel.rating) || 0,
        description: hotel.description || '',
        bookingDate: hotel.bookingDate || '',
        lastDate: hotel.lastDate || ''
      })),

      daily_itinerary: (inputData.daily_itinerary || []).map(day => ({
        day: day.day,
        theme: day.theme,
        date: day.date || "",
        dailyPlan: (day.plan || []).map(place => ({
          placeName: place.placeName,
          placeDetails: place.placeDetails,
          image_url: place.image_url,
          geoCoordinates: {
            latitude: parseFloat(place?.geoCoordinates?.latitude) || null,
            longitude: parseFloat(place?.geoCoordinates?.longitude) || null,
          },
          ticketPricing: parseTicketPricing(place.ticketPricing),
          rating: parseRating(place.rating),
          estimatedDuration: place.timeToSpend,
          travelToNext: place.travelNotes || null,
          timeSlot: place.timeSlot || null,
          activityType: place.activityType || null,
        }))
      }))
    };

    const savedTrip = await TripiternaryModel.create(transformedData);

    res.status(201).json({ success: true, message: "Trip saved successfully", data: savedTrip });
  } catch (error) {
    console.error("❌ Error saving trip:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error while saving trip.",
      error: error.message,
    });
  }
};

const getTripById = async (req, res) => {

    const { tripId } = req.params;
 
    try {
      const trip = await TripiternaryModel.findById(tripId);
 
      if (!trip) {
        return res.status(404).json({ success: false, message: "Trip not found" });
      }
 
      res.status(200).json({ success: true, data: trip });
    } catch (error) {
      console.error("❌ Error fetching trip:", error);
      res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  };

 
  const createCheckoutSession = async (amount, tripId) => {
    const frontend_url = "http://localhost:5173";
 
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: { name: "Trip Payment" },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      success_url: `${frontend_url}/verify?success=true&tripId=${tripId}`,
      cancel_url: `${frontend_url}/verify?success=false&tripId=${tripId}`,
    });
 
    return session.url;
  };

  const getPaidTripHistory = async (req, res) => {
    const { userId, tripId1 } = req.params; // Get userId and tripId1 from the request parameters
 
    try {
      // Find all payments with status "success" for the given tripId1 and userId
      const payments = await PaymentModel.find({  tripId1, status: "success" }).populate("tripId");
      console.log("Payments fetched:", payments); // Log fetched payments
 
      if (payments.length === 0) {
        return res.status(404).json({ message: "No paid trip history found." });
      }
 
      // Filter payments to ensure the tripId exists and map them to the desired format
      const tripHistory = payments
        .filter(payment => payment.tripId) // Ensure tripId exists
        .map(payment => ({
          tripId: payment.tripId._id, // Trip ID
          location: payment.tripId.trip_details?.location || "N/A", // Ensure trip_details exists and add location
          bookingDate: payment.tripId.bookingDate,
          lastDate: payment.tripId.lastDate,
          hotels: payment.tripId.hotels || [], // Include hotels or an empty array if not present
          amount: payment.amount,
          paymentStatus: payment.status,
          createdAt: payment.createdAt
        }));
 
      console.log("Trip history:", tripHistory); // Log the resulting trip history
 
      // Send the filtered trip history as the response
      res.json({ trips: tripHistory });
    } catch (error) {
      console.error("Error fetching paid trip history:", error);
      res.status(500).json({ error: "Failed to fetch paid trip history" });
    }
  };
 
  const getPaidTripHistoryAll = async (req, res) => {
    const { userId } = req.params; // Only userId needed now
 
    try {
      // Fetch all successful payments by userId
      const payments = await PaymentModel.find({ userId, status: "success" }).populate("tripId");
 
      if (!payments.length) {
        return res.status(404).json({ message: "No paid trip history found for this user." });
      }
 
      // Prepare clean history format
      const tripHistory = payments
        .filter(payment => payment.tripId)
        .map(payment => ({
          tripId: payment.tripId._id,
          location: payment.tripId.trip_details?.location || "N/A",
          bookingDate: payment.tripId.bookingDate,
          lastDate: payment.tripId.lastDate,
          hotels: payment.tripId.hotels || [],
          amount: payment.amount,
          paymentStatus: payment.status,
          createdAt: payment.createdAt,
        }));
 
      res.json({ trips: tripHistory });
    } catch (error) {
      console.error("❌ Error fetching trip history:", error);
      res.status(500).json({ error: "Failed to fetch trip history" });
    }
  };
  const getTransaction = async (req, res) => {
    const userId = req.params.userId;
    try {
        const transactions = await PaymentModel.find({ userId });
        res.json({ success: true, transactions });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

 

// Export the controller function (adjust based on your routing setup)
module.exports = {
    saveiternary,
    getTripById,
    createCheckoutSession,
    getPaidTripHistory,
    getPaidTripHistoryAll,
    getTransaction
    // other controller functions...
};