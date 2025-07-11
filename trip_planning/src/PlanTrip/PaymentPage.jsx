import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import StripePayment from "./StripePayment";
import './PaymentPage.css'; // Importing CSS file

const PaymentPage = () => {
  const [searchParams] = useSearchParams();
  const tripId = searchParams.get("tripId");

  const [trip, setTrip] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [hotelTotal, setHotelTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/spot/get-trip/${tripId}`);
        const data = await response.json();

        if (!data.success) throw new Error("Failed to fetch trip data");

        const tripData = data.data;
        const itinerary = tripData.daily_itinerary || [];
        const days = itinerary.length;

        setTrip(tripData);

        const hotels = tripData.hotels || [];
        const hotelTotalPerDay = hotels.reduce((sum, hotel) => {
          const amount = Number(hotel?.price?.amount ?? 0);
          return sum + amount;
        }, 0);

        const fullHotelTotal = hotelTotalPerDay * days;

        const ticketTotal = itinerary.reduce((daySum, day) => {
          const dailyPlans = Array.isArray(day.dailyPlan) ? day.dailyPlan : [];
          return daySum + dailyPlans.reduce((planSum, plan) => {
            const amount = Number(plan?.ticketPricing?.amount ?? 0);
            return planSum + amount;
          }, 0);
        }, 0);

        setHotelTotal(fullHotelTotal);
        setTotalAmount(fullHotelTotal + ticketTotal);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching trip data:", error);
        setLoading(false);
      }
    };

    if (tripId) fetchTrip();
  }, [tripId]);

  // Callback for when payment is successful
  const handlePaymentSuccess = async (paymentDetails) => {
    // Assuming `paymentDetails` contains information from Stripe's success callback
    const userDetails = {
      name: "John Doe",  // Use actual user data
      email: "john@example.com",  // Use actual user data
      tripId: tripId,
      totalAmount: totalAmount,
      hotelTotal: hotelTotal,
      paymentDetails: paymentDetails, // Payment details from Stripe
      hotelDetails: trip.hotels,  // Assuming trip contains hotel details
    };

    // Send the booking request to the server
    try {
      const response = await fetch("http://localhost:5000/api/admin/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userDetails),
      });

      const data = await response.json();
      if (data.success) {
        alert("Booking request submitted successfully!");
      } else {
        alert("Failed to submit booking request!");
      }
    } catch (error) {
      console.error("Error submitting booking request:", error);
      alert("Error submitting booking request!");
    }
  };

  if (loading || !trip) {
    return (
      <div className="loading-container">
        <p className="loading-text">Loading trip data...</p>
      </div>
    );
  }

  const days = trip.daily_itinerary?.length || 1;

  return (
    <div className="payment-page-container">
      <div className="payment-card">
        <h2 className="payment-title">💳 Trip Payment Summary</h2>

        <div className="payment-details">
          <div className="payment-detail">
            <span>🏨 <strong>Hotel Total</strong> ({days} day{days > 1 ? "s" : ""})</span>
            <span>₹{hotelTotal}</span>
          </div>

          <div className="payment-detail">
            <span>🎟️ <strong>Ticket Total</strong></span>
            <span>₹{totalAmount - hotelTotal}</span>
          </div>

          <hr className="divider" />

          <div className="payment-total">
            <span>Total Amount</span>
            <span>₹{totalAmount}</span>
          </div>
        </div>

        <div className="payment-button-container">
          <StripePayment
            amount={totalAmount * 100} // Stripe uses amount in paise
            onSuccess={handlePaymentSuccess}  // Add the success callback
          />
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
