import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "./HotelBooking.css"
const AdminBookingPage = () => {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    // Fetch all bookings from the backend
    axios.get('http://localhost:3000/api/bookings').then(response => {
      setBookings(response.data);
    });
  }, []);

  const confirmBooking = (bookingId) => {
    axios.post(`http://localhost:3000/api/confirm-booking/${bookingId}`).then(response => {
      alert('Booking confirmed');
      setBookings(prevBookings =>
        prevBookings.map(booking =>
          booking._id === bookingId ? { ...booking, status: 'confirmed' } : booking
        )
      );
    });
  };

  return (
    <div>
      <h1>Pending Hotel Bookings</h1>
      <ul>
        {bookings.map((booking) => (
          <li key={booking._id}>
            <div>User: {booking.user.name}</div>
            <div>Hotel: {booking.hotel.name}</div>
            <div>Payment Amount: ₹{booking.payment.amount}</div>
            <div>Status: {booking.status}</div>
            <button onClick={() => confirmBooking(booking._id)}>Confirm Booking</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminBookingPage;
