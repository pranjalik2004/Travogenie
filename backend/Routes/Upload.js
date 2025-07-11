const express = require("express");
const mongoose = require("mongoose");
const spotRouter= express.Router()
const Payment = require("../model/Payment.js");
const multer = require("multer");
const {addSpot,spotList ,removeSpot, explore,addTouristSpot,getTouristSpotById,saveLocation,spotList1} =require("../controller/SpotController.js");
const {saveiternary,getTripById,createCheckoutSession,getPaidTripHistory,getPaidTripHistoryAll,getTransaction} = require("../controller/tripController.js")
// ✅ Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); // Ensure "uploads/" directory exists
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname); // Unique filename
    }
});

const upload = multer({ storage :storage});

// ✅ File Upload Route (Profile Image)
spotRouter.post('/upload',upload.single('file'),addSpot)
// ✅ User Profile Update Route
spotRouter.post('/remove',removeSpot)
spotRouter.get('/list',spotList)
spotRouter.get('/list1',spotList1)
spotRouter.get("/explore", explore);
spotRouter.get("/spot", explore);
spotRouter.post("/spots", upload.array("images", 5), addTouristSpot);
spotRouter.post("/saveiternary", saveiternary);
spotRouter.get("/get-trip/:tripId", getTripById);
spotRouter.get('/tourist-spot/:id',getTouristSpotById)
spotRouter.post("/saveLocation", saveLocation);
spotRouter.get("/trip-history/:userId",getPaidTripHistory)
spotRouter.get("/trip-history/paid/:userId", getPaidTripHistoryAll);
spotRouter.get('/transactions/:userId', getTransaction);

spotRouter.post("/create-checkout-session", async (req, res) => {
  const { amount, tripId, userId } = req.body;

  try {
    const sessionUrl = await createCheckoutSession(amount, tripId);

    // Convert paise to rupees
    const amountInRupees = amount / 100;

    // Save the payment record with status: success
    await Payment.create({
      userId: new mongoose.Types.ObjectId(userId),
      tripId: new mongoose.Types.ObjectId(tripId),
      amount: amountInRupees, // Now stored in ₹
      status: "success",
      createdAt: new Date()
    });

    res.json({ sessionUrl });
  } catch (error) {
    console.error("Stripe session creation failed:", error.message);
    res.status(500).json({ error: "Failed to create Stripe session" });
  }
});
spotRouter.put("/payment-status", async (req, res) => {
  console.log("🔥 PUT /payment-status HIT"); // Make sure you see this

  const { tripId, userId, success } = req.body;
  console.log("📦 Payload:", { tripId, userId, success });

  if (!tripId || !userId) {
    return res.status(400).json({ error: "tripId and userId are required." });
  }

  try {
    const updatedPayment = await Payment.findOneAndUpdate(
      {
        tripId: new mongoose.Types.ObjectId(tripId),
        userId: new mongoose.Types.ObjectId(userId),
        status: "pending",
      },
      {
        status: success === "true" ? "success" : "failed",
      },
      { new: true }
    );

    if (!updatedPayment) {
      console.log("❌ Payment not found for update");
      return res.status(404).json({ error: "Payment not found." });
    }

    console.log("✅ Payment updated:", updatedPayment);
    res.json({ message: "Payment status updated successfully", payment: updatedPayment });
  } catch (err) {
    console.error("❌ Payment update error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


module.exports = spotRouter;
