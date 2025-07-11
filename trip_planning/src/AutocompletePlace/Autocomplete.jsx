import React, { useState } from "react";
import axios from "axios";

const API_KEY = "AlzaSyGRk3sopjNil9irzmCL5suBnT4LoIaLjCi"; // Replace with your actual API key

const GoMapsAutocomplete = () => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [placeDetails, setPlaceDetails] = useState(null);

  // Fetch autocomplete suggestions
  const fetchSuggestions = async (input) => {
    if (input.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await axios.get(
        `https://maps.gomaps.pro/maps/api/place/queryautocomplete/json?input=${input}&key=${API_KEY}`
      );

      if (response.data && response.data.predictions) {
        setSuggestions(response.data.predictions);
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  };

  // Fetch place details
  const fetchPlaceDetails = async (place_id) => {
    try {
      const response = await axios.get(
        `https://maps.gomaps.pro/maps/api/place/details/json?place_id=${place_id}&key=${API_KEY}`
      );

      if (response.data && response.data.result) {
        setPlaceDetails(response.data.result);
      }
    } catch (error) {
      console.error("Error fetching place details:", error);
    }
  };

  // Handle input change
  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    fetchSuggestions(value);
  };

  // Handle selection
  const handleSelect = (suggestion) => {
    setQuery(suggestion.description);
    setSuggestions([]);
    fetchPlaceDetails(suggestion.place_id); // Fetch details after selection
  };

  return (
    <div style={{ width: "400px", margin: "50px auto", color: "black" }}>
      <h3>GoMaps Autocomplete with Place Details</h3>

      {/* Search Input */}
      <input
        type="text"
        placeholder="Enter location"
        value={query}
        onChange={handleChange}
        style={{
          width: "100%",
          padding: "8px",
          border: "1px solid #ccc",
          borderRadius: "4px",
        }}
      />

      {/* Suggestions Dropdown */}
      {suggestions.length > 0 && (
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            border: "1px solid #ccc",
            borderRadius: "4px",
            maxHeight: "200px",
            overflowY: "auto",
            background: "#fff",
          }}
        >
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              onClick={() => handleSelect(suggestion)}
              style={{
                padding: "8px",
                cursor: "pointer",
                borderBottom: "1px solid #ddd",
              }}
            >
              {suggestion.description}
            </li>
          ))}
        </ul>
      )}

      {/* Display Place Details */}
      {placeDetails && (
        <div
          style={{
            marginTop: "20px",
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "5px",
            background: "#f9f9f9",
          }}
        >
          <h4>{placeDetails.name}</h4>
          <p><strong>Address:</strong> {placeDetails.formatted_address}</p>

          {/* Display Place Image if available */}
          {placeDetails.photos && placeDetails.photos.length > 0 && (
            <img
              src={`https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${placeDetails.photos[0].photo_reference}&key=${API_KEY}`}
              alt="Place"
              style={{ width: "100%", borderRadius: "5px", marginTop: "10px" }}
            />
          )}

          {/* Nearby Attractions */}
          {placeDetails.types && (
            <p><strong>Nearby Attractions:</strong> {placeDetails.types.join(", ")}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default GoMapsAutocomplete;
