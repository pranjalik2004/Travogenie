// src/components/FlightBookingForm.js
import React from "react";
import "./FlightBookingForm.css";

const BusSearch = () => {
  return (
    <div className="booking-form">
      <h3>Book Domestic and International Flights</h3>
      <form>
        <div className="form-row">
          <div className="form-group">
            <label>From</label>
            <input type="text" placeholder="Enter city" />
          </div>
          <div className="form-group">
            <label>To</label>
            <input type="text" placeholder="Enter city" />
          </div>
          <div className="form-group">
            <label>Departure</label>
            <input type="date" />
          </div>
          <div className="form-group">
            <label>Return</label>
            <input type="date" />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Travellers & Class</label>
            <input type="text" placeholder="1 Traveller, Economy" />
          </div>
          <div className="form-group">
            <label>Special Fare</label>
            <select>
              <option>Regular</option>
              <option>Student</option>
              <option>Senior Citizen</option>
              <option>Armed Forces</option>
              <option>Doctor and Nurses</option>
            </select>
          </div>
        </div>

        <button type="submit" className="search-btn">
          Search
        </button>
      </form>
    </div>
  );
};

export default BusSearch;
