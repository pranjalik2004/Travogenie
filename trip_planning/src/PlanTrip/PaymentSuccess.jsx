// Verify.jsx
import React, { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import './PaymentSuccess.css'; // Importing the external CSS file

const Verify = () => {
  const [searchParams] = useSearchParams();
  const success = searchParams.get("success");
  const tripId = searchParams.get("tripId");

  const [statusUpdated, setStatusUpdated] = useState(false);
  const [tripDetails, setTripDetails] = useState(null);
  const printRef = useRef();

  useEffect(() => {
    const fetchTripDetails = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/spot/trip-history/${tripId}`);
        const data = await res.json();
        console.log("🎒 Trip History Response:", data);
        setTripDetails(data.trips?.[0]);
      } catch (error) {
        console.error("❌ Error fetching trip details:", error);
      }
    };

    if (tripId && success === "true") {
      fetchTripDetails();
    }
  }, [tripId, success]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="verify-container">
      {success === "true" && tripDetails && (
        <>
          <button className="print-button" onClick={handlePrint}>
            🖨️ Print Trip Summary
          </button>

          <div className="printable" ref={printRef}>
            <h4 className="subtitle">Trip Details 🧭</h4>
            <h2 className="title">Travogenie Travel Agency</h2>

            <div className="agency-info">
              <p><strong>Phone:</strong> +91-9876543210</p>
              <p><strong>Email:</strong> support@travogenie.com</p>
              <p><strong>Address:</strong> 123 Horizon Street, Mumbai, India</p>
            </div>

            <div className="trip-info">
              <p><strong>Location:</strong> {tripDetails.location || "N/A"}</p>
              <p><strong>From:</strong> {tripDetails.hotels?.[0]?.bookingDate || "N/A"}</p>
              <p><strong>To:</strong> {tripDetails.hotels?.[0]?.lastDate || "N/A"}</p>
            </div>

            {tripDetails.hotels?.length > 0 && (
              <div className="hotel-info">
                <p><strong>Hotel:</strong> {tripDetails.hotels[0].name}</p>
                <p><strong>Price:</strong> {tripDetails.hotels[0].price?.amount} {tripDetails.hotels[0].price?.currency}</p>
                {tripDetails.hotels[0].image_url && (
                  <img src={tripDetails.hotels[0].image_url} alt="Hotel" className="hotel-image" />
                )}
              </div>
            )}
          </div>
        </>
      )}

      {success === "false" && (
        <p className="error-text">❌ Please try again.</p>
      )}

      {statusUpdated && (
        <p className="update-status">Payment status updated in database.</p>
      )}
    </div>
  );
};

export default Verify;
