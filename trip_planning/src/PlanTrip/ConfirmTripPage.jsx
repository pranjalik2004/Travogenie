import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { StoreCon } from '../context/Store';
import './ConfirmTripPage.css';
import axios from 'axios';

const LOCAL_STORAGE_KEY = 'pendingTripPlan';
const BACKEND_URL = "http://localhost:5000";
const DEFAULT_HOTEL_IMG = "/images/default-hotel.jpg";
const DEFAULT_PLACE_IMG = "/images/default-place.jpg";
const DEFAULT_ACTIVITY_IMG = "/images/default-activity.png";
const DEFAULT_LOCATION_IMG = "/images/default-location.jpg";

function ConfirmTripPage() {
  const [tripPlan, setTripPlan] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [lastDate, setLastDate] = useState('');
  const navigate = useNavigate();
  const { token } = useContext(StoreCon);

  useEffect(() => {
    setError(null);
    try {
      const storedTrip = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedTrip) {
        const parsedTrip = JSON.parse(storedTrip);
        if (!parsedTrip || !parsedTrip.trip_details || !parsedTrip.location) {
          throw new Error("Incomplete trip data.");
        }
        setTripPlan(parsedTrip);
      } else {
        setError("No trip plan found. Please generate one.");
      }
    } catch (err) {
      console.error("Error parsing trip plan:", err);
      setError("Failed to load trip data.");
    }
  }, []);

  useEffect(() => {
    if (bookingDate && tripPlan?.trip_details?.duration) {
      const start = new Date(bookingDate);
      const durationDays = parseInt(tripPlan.trip_details.duration, 10);
      if (!isNaN(durationDays)) {
        const end = new Date(start);
        end.setDate(start.getDate() + durationDays - 1);
        setLastDate(end.toISOString().split('T')[0]);
      }
    }
  }, [bookingDate, tripPlan]);

  const handleImgError = (e, fallback = DEFAULT_PLACE_IMG) => {
    e.target.onerror = null;
    e.target.src = fallback;
  };

  const openInGoogleMaps = (name, address = '') => {
    if (!name) return;
    const query = address ? `${name}, ${address}` : name;
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
    window.open(googleMapsUrl, "_blank", "noopener,noreferrer");
  };

  const validateTripPlan = () => {
    if (!tripPlan) return "Trip data not loaded.";
    if (!tripPlan.location?.name) return "Location is missing.";
    if (!tripPlan.trip_details?.duration) return "Duration is missing.";
    if (!selectedHotel) return "Please select a hotel.";
    if (!bookingDate || !lastDate) return "Please select a valid booking date.";
    return null;
  };

  const handleConfirmAndSave = async () => {
    const validationError = validateTripPlan();
    if (validationError) {
      alert(validationError);
      return;
    }

    if (!token) {
      alert("Please login to save the trip.");
      return navigate('/login');
    }

    setIsSaving(true);
    setError(null);

    const finalTripPlan = {
      ...tripPlan,
      hotels: [{
        ...selectedHotel,
        bookingDate,
        lastDate
      }]
    };

    try {
      const response = await axios.post(`${BACKEND_URL}/api/spot/saveiternary`, finalTripPlan, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      alert("Trip saved successfully!");
      navigate(`/payment?tripId=${response.data.data._id}`);
    } catch (err) {
      console.error("Save failed:", err.response?.data || err.message);
      setError("Failed to save trip. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    if (window.confirm("Are you sure you want to discard the trip plan?")) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      navigate('/');
    }
  };
  console.log("Selected Hotel:", selectedHotel);
  console.log("Hotel Price Amount:", selectedHotel?.price);
  console.log("Trip Duration:", tripPlan?.trip_details?.duration);

  const getDisplayValue = (value) => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'object' && value.details) return value.details;
    if (typeof value === 'string' && value.trim() !== '') return value;
    if (typeof value === 'object') return value.amount ? `${value.currency || ''}${value.amount}` : 'Info unavailable';
    return value.toString ? value.toString() : 'N/A';
  };

  const formatRating = (rating) => {
    if (rating === null || rating === undefined) return 'N/A';
    const parsed = parseFloat(rating);
    return isNaN(parsed) ? 'N/A' : `${parsed.toFixed(1)}/5`;
  };

  if (!tripPlan && !error) return <p>Loading trip details...</p>;
  if (error && !tripPlan) return <p>Error: {error}</p>;

  return (
    <div className="confirm-trip-page">
      <div className="left-panel-confirm">
        <h1>Review Your Trip</h1>
        <h2 onClick={() => openInGoogleMaps(tripPlan.location?.name)} className="clickable-location">
          {tripPlan.location?.name || "Destination"}
        </h2>
        <img
          src={tripPlan.location?.image_url || DEFAULT_LOCATION_IMG}
          alt={tripPlan.location?.name}
          onError={(e) => handleImgError(e, DEFAULT_LOCATION_IMG)}
          className="location-image-confirm"
        />
        <div className="trip-meta">
          <p><strong>Duration:</strong> {tripPlan.trip_details?.duration || 'N/A'}</p>
          <p><strong>Budget:</strong> {tripPlan.trip_details?.budgetType || 'N/A'}</p>
          <p><strong>Travelers:</strong> {tripPlan.trip_details?.targetAudience || 'N/A'}</p>
        </div>
        <h3>Description / Notes</h3>
        <p className="description-notes">{tripPlan.trip_details?.notes || tripPlan.location?.description || "No notes provided."}</p>
        <div className="confirmation-buttons top-buttons">
          <button onClick={handleConfirmAndSave} disabled={isSaving} className="save-button">
            {isSaving ? "Saving..." : "Confirm and Save Trip"}
          </button>
          <button onClick={handleDiscard} className="discard-button">Discard Plan</button>
          {error && <p className="save-error-message">{error}</p>}
        </div>
      </div>

      <div className="main-content-confirm">
        <section className="hotels-section">
          <h2>Hotel Selection</h2>
          <div className="card-grid hotel-grid">
            {tripPlan.hotels?.length ? tripPlan.hotels.map((hotel, idx) => (
              <div
                key={`hotel-${idx}`}
                className={`card hotel-card clickable-card ${selectedHotel?.name === hotel.name ? 'selected-hotel' : ''}`}
                onClick={() => setSelectedHotel(hotel)}
              >
                <img
                  src={hotel.image_url || DEFAULT_HOTEL_IMG}
                  alt={hotel.name}
                  onError={(e) => handleImgError(e, DEFAULT_HOTEL_IMG)}
                  className="card-image"
                />
                <div className="card-content">
                  <h4>{hotel.name}</h4>
                  <p>Location: {hotel.address || 'N/A'}</p>
                  <p>Price per Night: {getDisplayValue(hotel.price)}</p>
                  <p>Rating: {formatRating(hotel.rating)}</p>
                </div>
              </div>
            )) : <p>No hotel suggestions available.</p>}
          </div>

          {selectedHotel && (
            <div className="selected-hotel-info">
              <h3>Selected Hotel Details</h3>
              <p><strong>Name:</strong> {selectedHotel.name}</p>
              <p><strong>Location:</strong> {selectedHotel.address}</p>
              <p><strong>Price per Night:</strong> {getDisplayValue(selectedHotel.price)}</p>
              <p><strong>Total Days:</strong> {tripPlan.trip_details?.duration || 'N/A'}</p>
              <p><strong>Total Price:</strong> {
        selectedHotel.price?.amount !== undefined && tripPlan.trip_details?.duration
          ? `${selectedHotel.price.currency || ''} ${(selectedHotel.price.amount * tripPlan.trip_details.duration).toLocaleString()}`
          : 'N/A'
      }</p>

              <div className="date-selection">
                <label>Booking Start Date:</label>
                <input
                  type="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                />
                <label>End Date:</label>
                <input
                  type="date"
                  value={lastDate}
                  readOnly
                />
              </div>
            </div>
          )}
        </section>

        <section className="itinerary-section">
          <h2>Daily Itinerary</h2>
          {tripPlan.daily_itinerary?.length ? tripPlan.daily_itinerary.map((day, dIndex) => (
            <div key={`day-${dIndex}`} className="day-plan">
              <h3>Day {day.day}: {day.theme || "Plan"}</h3>
              <div className="card-grid plan-items-grid">
                {day.plan?.length ? day.plan.map((item, idx) => (
                  <div key={`item-${idx}`} className="card plan-item-card clickable-card" onClick={() => openInGoogleMaps(item.placeName)}>
                    <img
                      src={item.image_url}
                      alt={item.placeName}
                      className="card-image"
                      onError={(e) =>
                        handleImgError(e, /activity|travel|check-in|departure/i.test(item.placeName || '') ? DEFAULT_ACTIVITY_IMG : DEFAULT_PLACE_IMG)
                      }
                    />
                    <div className="card-content">
                      <h4>{item.placeName}</h4>
                      <p>{item.placeDetails}</p>
                      <p>Duration: {item.timeToSpend || item.estimatedDuration || 'N/A'}</p>
                      <p>Tickets: {getDisplayValue(item.ticketPricing)}</p>
                      <p>Rating: {formatRating(item.rating)}</p>
                      {item.travelNotes && <p>Notes: {item.travelNotes}</p>}
                    </div>
                  </div>
                )) : <p>No activities for this day.</p>}
              </div>
            </div>
          )) : <p>No daily itinerary available.</p>}
        </section>

        <div className="confirmation-buttons bottom-buttons">
          <button onClick={handleConfirmAndSave} disabled={isSaving} className="save-button">
            {isSaving ? 'Saving...' : 'Confirm and Save Trip'}
          </button>
          <button onClick={handleDiscard} disabled={isSaving} className="discard-button">Discard Plan</button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmTripPage;