import React, { useContext, useEffect, useState } from "react";
import { StoreCon } from "../context/Store";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import './TripHistory.css'

const TripHistory = ({ tripId1 }) => {
  const [trips, setTrips] = useState([]);
  const [error, setError] = useState(null);
  const { token } = useContext(StoreCon);
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    // Decode token to get userId
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const extractedId = decoded.userId || decoded.id || decoded.sub;
        setUserId(extractedId);
        console.log("✅ Decoded userId:", extractedId);
      } catch (err) {
        console.error("❌ Invalid token:", err);
        setError("Invalid token. Please log in again.");
        navigate('/login');
      }
    }
  }, [token, navigate]);

  useEffect(() => {
    const fetchPaidTrips = async () => {
      if (!token || !userId) return;

      try {
        setError(null);

        const res = await fetch(`http://localhost:5000/api/spot/trip-history/paid/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (res.ok) {
          setTrips(data.trips || []);
        } else {
          setError(data.message || "Failed to fetch trip history.");
        }
      } catch (err) {
        console.error("❌ Error fetching trip history:", err);
        setError("An error occurred while fetching your trip history.");
      }
    };

    fetchPaidTrips();
  }, [userId, token, tripId1]);

  return (
    <div className="trip-history-container">
      <h2 className="trip-history-heading">Your Paid Trip History</h2>
  
      {error && <p className="error-message">{error}</p>}
  
      {trips.length === 0 && !error ? (
        <p className="no-trip">No paid trip history found.</p>
      ) : (
        trips.map((trip, index) => (
          <div key={index} className="trip-card">
            <h3 className="trip-title">Trip to {trip.location}</h3>
            <p className="trip-detail"><strong>Booking Date:</strong> {trip.hotels?.[0]?.bookingDate || "N/A"}</p>
            <p className="trip-detail"><strong>Last Date:</strong> {trip.hotels?.[0]?.lastDate || "N/A"}</p>
            <p className="trip-detail"><strong>Amount:</strong> {trip.amount}</p>
            <p className="trip-detail"><strong>Payment Status:</strong> ✅ {trip.paymentStatus}</p>
            <p className="trip-detail"><strong>Booked On:</strong> {new Date(trip.createdAt).toLocaleDateString()}</p>
  
            {trip.hotels.length > 0 && (
              <div className="trip-detail">
                <p><strong>Hotel:</strong> {trip.hotels[0].name}</p>
                <p>
                  <strong>Hotel Price par day:</strong> {trip.hotels[0].price?.amount}{" "}
                  {trip.hotels[0].price?.currency}
                </p>
               
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
  
};

export default TripHistory;