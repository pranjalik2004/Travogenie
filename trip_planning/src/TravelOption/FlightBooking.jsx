import React, { useEffect, useState } from "react";
import axios from "axios";

const Flights = () => {
  const [flights, setFlights] = useState([]);
  const [filteredFlights, setFilteredFlights] = useState([]);
  const [searchParams, setSearchParams] = useState({
    from: "",
    to: "",
    date: "",
    returnDate: "",
    travelers: "1",
  });

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/flights")
      .then((res) => {
        setFlights(res.data.data);
        setFilteredFlights(res.data.data);
      })
      .catch((err) => console.error("Error fetching flights:", err));
  }, []);

  const handleSearch = () => {
    const filtered = flights.filter(
      (flight) =>
        flight.departure.city.toLowerCase().includes(searchParams.from.toLowerCase()) &&
        flight.arrival.city.toLowerCase().includes(searchParams.to.toLowerCase())
    );
    setFilteredFlights(filtered);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Search Form */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Search Flights</h2>
        <div className="grid grid-cols-5 gap-4">
          <input
            type="text"
            placeholder="Enter Departure City"
            className="p-3 border rounded-lg"
            onChange={(e) => setSearchParams({ ...searchParams, from: e.target.value })}
          />
          <input
            type="text"
            placeholder="Enter Destination City"
            className="p-3 border rounded-lg"
            onChange={(e) => setSearchParams({ ...searchParams, to: e.target.value })}
          />
          <input
            type="date"
            className="p-3 border rounded-lg"
            onChange={(e) => setSearchParams({ ...searchParams, date: e.target.value })}
          />
          <input
            type="date"
            className="p-3 border rounded-lg"
            onChange={(e) => setSearchParams({ ...searchParams, returnDate: e.target.value })}
          />
          <select
            className="p-3 border rounded-lg"
            onChange={(e) => setSearchParams({ ...searchParams, travelers: e.target.value })}
          >
            <option value="1">1 Traveler</option>
            <option value="2">2 Travelers</option>
            <option value="3">3 Travelers</option>
            <option value="4">4 Travelers</option>
          </select>
        </div>
        <button
          onClick={handleSearch}
          className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Search Flights
        </button>
      </div>

      {/* Flight Results */}
      <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Available Flights</h2>
        {filteredFlights.length > 0 ? (
          <table className="flight-table">
          <thead>
            <tr>
              <th>Flight</th>
              <th>From (City)</th>
              <th>To (City)</th>
              <th>Departure Time</th>
              <th>Arrival Time</th>
              <th>Cost</th>
              <th>Availability</th>
              <th>Book</th>
            </tr>
          </thead>
          <tbody>
            {flights.map((flight, index) => (
              <tr key={index}>
                <td>{flight?.airline?.name || "N/A"}</td>
                <td>{flight?.departure?.airport?.city || "N/A"}</td>
                <td>{flight?.arrival?.airport?.city || "N/A"}</td>
                <td>{flight?.departure?.scheduled || flight?.departure?.datetime || "N/A"}</td>
                <td>{flight?.arrival?.scheduled || flight?.arrival?.datetime || "N/A"}</td>
                <td>{flight?.price?.amount ? `$${flight.price.amount}` : "Not Available"}</td>
                <td className={flight?.available ? "available" : "sold-out"}>
                  {flight?.available ? "Available" : "Sold Out"}
                </td>
                <td>
                  <a
                    href={`https://www.${flight?.airline?.iata}.com`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="book-btn"
                  >
                    Book Now
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        ) : (
          <p className="text-gray-600">No flights found. Try searching again.</p>
        )}
      </div>
    </div>
  );
};

export default Flights;
