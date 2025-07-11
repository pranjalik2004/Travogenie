import React, { useState } from "react";
import axios from "axios";
import "./Addspots.css";
import { toast } from "react-toastify";
import { chatSession } from "./AiModel";

const API_KEY = import.meta.env.GOOGLE_PLACE; // Ensure correct Vite variable
const Gkey = import.meta.env.VITE_GOOGLE_GEMINI_AI_API_KEY;

const AI_PROMPT = `generate details of location: {Location}.
give me hotels option list with hotels name, address, price, image URL, geo-coordinates, ratings, descriptions,
and suggest nearby attractions including markets also with name, details, image URL, geo-coordinates, ticket pricing, and distance from the main location.
Ensure each hotel and attraction includes a valid image URL from a well-known CDN such as Unsplash or Pexels, or a direct link to a reputed website in JSON format.`;

const Add = ({ url }) => {
    const [data, setData] = useState({
        name: "",
        location: "",
        description: "",
        category: "Nature",
    });

    const [searchQuery, setSearchQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [placePhotoUrl, setPlacePhotoUrl] = useState("");

    // Fetch autocomplete suggestions
    const fetchSuggestions = async (input) => {
        if (input.length < 3) {
            setSuggestions([]);
            return;
        }
        try {
            const response = await axios.get(
                `https://maps.gomaps.pro/maps/api/place/autocomplete/json?input=${input}&key=AlzaSy_xCSyMcb1iN00zvwVmOH9DSjTkVua0ZOK`
            );
            if (response.data?.predictions) {
                setSuggestions(response.data.predictions);
            }
        } catch (error) {
            console.error("Error fetching suggestions:", error);
        }
    };

    // Fetch place details & photo
    const fetchPlacePhoto = async (placeName) => {
        try {
            console.log(`Fetching Place ID for: ${placeName}`);
   
            // Step 1: Find place_id
            const placeSearchResponse = await axios.get(
                `https://maps.gomaps.pro/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(placeName)}&inputtype=textquery&fields=place_id&key=AlzaSym6QWrrTRpHcQza7CgY2EF8OvlmCMiziSB`
            );
   
            if (!placeSearchResponse.data?.candidates?.length) {
                console.error(`No place_id found for: ${placeName}`);
   
                // Fallback: Try Geocoding API
                const geocodeResponse = await axios.get(
                    `https://maps.gomaps.pro/maps/api/geocode/json?address=${encodeURIComponent(placeName)}&key=AlzaSym6QWrrTRpHcQza7CgY2EF8OvlmCMiziSB`
                );
   
                if (geocodeResponse.data.status === "OK") {
                    const fallbackPlaceId = geocodeResponse.data.results[0].place_id;
                    console.log(`Using fallback Place ID for ${placeName}:, fallbackPlaceId`);
                    return fallbackPlaceId;
                }
   
                return "";
            }
   
            const placeId = placeSearchResponse.data.candidates[0].place_id;
   
            // Step 2: Fetch place details to get a photo reference
            const detailsResponse = await axios.get(
                `https://maps.gomaps.pro/maps/api/place/details/json?place_id=${placeId}&fields=photos&key=AlzaSym6QWrrTRpHcQza7CgY2EF8OvlmCMiziSB`
            );
   
            const photos = detailsResponse.data?.result?.photos;
            if (photos?.length > 0) {
                const photoReference = photos[0].photo_reference;
                return `https://maps.gomaps.pro/maps/api/place/photo?maxwidth=400&photo_reference=${photoReference}&key=AlzaSym6QWrrTRpHcQza7CgY2EF8OvlmCMiziSB`;
            } else {
                return "";
            }
        } catch (error) {
            console.error("Error fetching place photo:", error);
            return "";
        }
    };
   

    // Handle location selection
    const handleSelect = async (suggestion) => {
        const selectedLocation = suggestion.description;
        const placeId = suggestion.place_id;

        setSearchQuery(selectedLocation);
        setSuggestions([]);

        if (!placeId) {
            console.error("Error: No place_id found.");
            return;
        }

        console.log("Selected Place ID:", placeId);

        try {
            // Fetch place details
            const response = await axios.get(
                `https://maps.gomaps.pro/maps/api/place/details/json?place_id=${placeId}&fields=geometry,photos&key=AlzaSym6QWrrTRpHcQza7CgY2EF8OvlmCMiziSB`
            );

            if (!response.data || response.data.status !== "OK") {
                console.error("Error fetching place details:", response.data.status);
                return;
            }

            console.log("Google API Response:", response.data);
            const placeDetails = response.data.result;

            // Extract geo-coordinates
            const geoCoordinates = placeDetails.geometry?.location || { lat: 0, lng: 0 };

            // Extract image URL
            let imageUrl = "";
            if (placeDetails.photos?.length > 0) {
                const photoReference = placeDetails.photos[0].photo_reference;
                imageUrl = `https://maps.gomaps.pro/maps/api/place/photo?maxwidth=400&photo_reference=${photoReference}&key=AlzaSym6QWrrTRpHcQza7CgY2EF8OvlmCMiziSB`;
            }

            console.log("Final Location Data:", {
                name: selectedLocation,
                geoCoordinates,
                imageUrl,
            });

            // Generate AI Response for nearby attractions
            const FINAL_PROMPT = AI_PROMPT.replace("{Location}", selectedLocation);
            const result = await chatSession.sendMessage(FINAL_PROMPT);
            const responseText = await result?.response.text();

            try {
                const jsonData = JSON.parse(responseText);
                console.log("Parsed JSON Data:", jsonData);

                // Fetch photos for each nearby attraction
                const attractionsWithPhotos = await Promise.all(
                    jsonData.nearby_attractions.map(async (attraction) => {
                        const photoUrl = await fetchPlacePhoto(attraction.name);
                        return { ...attraction, image_url: photoUrl };
                    })
                );
               
                const hotelWithPhotos = await Promise.all(
                    jsonData.hotels.map(async (hotel) => {
                        const photoUrl = await fetchPlacePhoto(hotel.name);
                        return { ...hotel, image_url: photoUrl };
                    })
                );

                // Final structured data
                const requestData = {
                    location: {
                        name: jsonData.location?.name || selectedLocation,
                        description: jsonData.location?.description || "No description available",
                        geo_coordinates: jsonData.location?.geo_coordinates || { latitude: 0, longitude: 0 },
                        image_url:   imageUrl,
                    },
                    hotels:hotelWithPhotos,
                    nearby_attractions: attractionsWithPhotos,
                };

                console.log("Request Data:", requestData);

                // Send data to backend
                fetch(`${url}/api/spot/saveLocation`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(requestData),
                })
                    .then((response) => response.json())
                    .then((data) => console.log("Server Response:", data))
                    .catch((error) => console.error("Error sending data:", error));
            } catch (error) {
                console.error("Error parsing JSON:", error);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    return (
        <div className="add">
            <h3>Add a Travel Spot</h3>
            <form>
                <div>
                    <input
                        type="text"
                        placeholder="Search destinations..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            fetchSuggestions(e.target.value);
                        }}
                    />
                    {suggestions.length > 0 && (
                        <ul>
                            {suggestions.map((suggestion, index) => (
                                <li key={index} onClick={() => handleSelect(suggestion)}>
                                    {suggestion.description}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <label>Spot Location</label>
                <input
                    type="text"
                    name="location"
                    placeholder="Enter Spot Location"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    required
                />

                <label>Spot Category</label>
                <select name="category" value={data.category} onChange={(e) => setData({ ...data, category: e.target.value })}>
                    <option value="Natural">Natural</option>
                    <option value="Beach">Beach</option>
                    <option value="Heritage">Heritage</option>
                </select>

                <button type="submit">ADD</button>
            </form>
        </div>
    );
};

export default Add;