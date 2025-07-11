import React, { useEffect, useState, useContext } from "react";
import "./TravelPreferences.css"; // Make sure you have this CSS file
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { chatSession } from "./AIModel"; // Your Gemini AI setup
import { StoreCon } from "../context/Store"; // Your context for token

// --- Constants ---
const GOOGLE_PLACES_API_KEY = "AlzaSy_xCSyMcb1iN00zvwVmOH9DSjTkVua0ZOK"; // Use your actual key
const DEFAULT_HOTEL_IMG = "/images/default-hotel.jpg";
const DEFAULT_PLACE_IMG = "/images/default-place.jpg";
const DEFAULT_ACTIVITY_IMG = "/images/default-activity.png"; // Optional: Add a generic activity icon
const BACKEND_URL = "http://localhost:5000"; // Your backend base URL
const LOCAL_STORAGE_KEY = 'pendingTripPlan'; // Define key for localStorage

const AI_Prompt = `generate travel plan for {location}.
for {totalDays} days for {traveler} with a {budget} budget.
give me hotels options list with address, price, hotel images url, geo coordinates, rating, description.
also suggest itinerary with placeName, placeDetails, place image url, geo coordinates, ticket pricing, rating, and time to travel each location.
Structure the itinerary as dailyItinerary with daily plan and also provide tripDetails including duration, targetAudience, budgetType, and notes.
For each placeName in the itinerary plan, provide the most specific, searchable name of the actual location (e.g., 'Tata Tea Museum, Munnar', 'Alleppey Finishing Point', 'Specific Spice Garden Name if known') rather than generic activity descriptions like 'Hotel Check-in' or 'Travel to'. If it's purely a travel leg without a specific landmark, indicate that clearly.
Respond STRICTLY in JSON format.`; // Added prompt guidance


// --- Google Places Photo Fetching Function ---
// (Keep the fetchPlacePhoto function exactly as provided before)
const fetchPlacePhoto = async (placeName, context = "") => {
    if (!placeName) return "";

    try {
        const searchInput = context ? `${placeName}, ${context}` : placeName;
        console.log(`Fetching Place ID for: ${searchInput}`);

        const placeSearchResponse = await axios.get(
            `https://maps.gomaps.pro/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(searchInput)}&inputtype=textquery&fields=place_id&key=${GOOGLE_PLACES_API_KEY}`
        );

        let placeId = placeSearchResponse.data?.candidates?.[0]?.place_id;

        if (!placeId) {
            console.warn(`No candidate from findplacefromtext for ${searchInput}. Trying geocode.`);
            const geocodeResponse = await axios.get(
                `https://maps.gomaps.pro/maps/api/geocode/json?address=${encodeURIComponent(searchInput)}&key=${GOOGLE_PLACES_API_KEY}`
            );

            if (geocodeResponse.data.status === "OK" && geocodeResponse.data.results?.[0]?.place_id) {
                placeId = geocodeResponse.data.results[0].place_id;
                console.log(`Using fallback Place ID from geocode: ${placeId}`);
            } else {
                console.error(`Geocoding failed or returned no place_id for: ${searchInput}`);
                return "";
            }
        }

        const detailsResponse = await axios.get(
            `https://maps.gomaps.pro/maps/api/place/details/json?place_id=${placeId}&fields=photos&key=${GOOGLE_PLACES_API_KEY}`
        );

        const photos = detailsResponse.data?.result?.photos;

        if (photos?.length > 0) {
            const photoReference = photos[0].photo_reference;
            const imageUrl = `https://maps.gomaps.pro/maps/api/place/photo?maxwidth=400&photo_reference=${photoReference}&key=${GOOGLE_PLACES_API_KEY}`;
            console.log(`Photo URL found: ${imageUrl}`);
            return imageUrl;
        } else {
            console.log(`No photos found for place: ${placeName} (Place ID: ${placeId})`);
            return "";
        }

    } catch (error) {
        const errorDetails = error.response ? JSON.stringify(error.response.data) : error.message;
        console.error(`Error fetching place photo for "${placeName}": ${errorDetails}`);
        return "";
    }
};

// --- End of fetchPlacePhoto ---

// --- React Component ---
export default function TravelPreferencesForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token } = useContext(StoreCon);

    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState(null);
    const [spotDetails, setSpotDetails] = useState(null);

    const [formData, setFormData] = useState({
        destination: "",
        days: "",
        budget: "",
        travelWith: "",
    });

    // Fetch initial spot details
    useEffect(() => {
        // (Keep useEffect as it was)
        if (!id) {
            setError("Invalid spot ID provided.");
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        const fetchData = async () => {
            try {
                const response = await axios.get(`${BACKEND_URL}/api/spot/tourist-spot/${id}`);
                if (response.data.success && response.data.data) {
                    setSpotDetails(response.data.data);
                    setFormData((prev) => ({
                        ...prev,
                        destination: response.data.data?.location?.name || "",
                    }));
                } else {
                    setError(response.data.message || "Spot not found");
                    setSpotDetails(null);
                }
            } catch (err) {
                console.error("Error fetching spot details:", err);
                setError(`Failed to fetch spot details: ${err.message}`);
                setSpotDetails(null);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    // Handle form field changes
    const handleChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    // Generate trip, check login, fetch images (selectively), store in localStorage
    const OnGenrateTrip = async () => {
        // ***** LOGIN CHECK *****
        if (!token) {
            alert("Please log in to generate a trip plan.");
            navigate("/login");
            return;
        }
console.log(token)
        // 1. Validations
        if (!formData.destination || !formData.days || !formData.budget || !formData.travelWith) {
            alert("Please fill in all travel preferences.");
            return;
        }

        setGenerating(true);
        setError(null);

        try {
            localStorage.removeItem(LOCAL_STORAGE_KEY); // Clear previous plan
            console.log("User is logged in, proceeding with generation...");

            // 2. Get AI Response
            const FINAL_PROMPT = AI_Prompt
                .replace("{location}", formData.destination)
                .replace("{totalDays}", formData.days)
                .replace("{traveler}", formData.travelWith)
                .replace("{budget}", formData.budget);
            console.log("Sending Prompt to AI:", FINAL_PROMPT);

            // ... (AI call and parsing) ...
            const result = await chatSession.sendMessage(FINAL_PROMPT);
            const responseText = await result?.response?.text();
            const cleanedResponseText = responseText.replace(/^json\s*|$/g, '').trim();
            let jsonData;
            try { jsonData = JSON.parse(cleanedResponseText); } catch (e) { throw new Error("AI invalid format"); }
            console.log("🤖 AI Response (Parsed JSON):", jsonData);
            const { tripDetails, hotelOptions = [], dailyItinerary = [] } = jsonData;
            if (!tripDetails || !Array.isArray(hotelOptions) || !Array.isArray(dailyItinerary)) { throw new Error("AI invalid structure"); }


            // 3. Fetch Images (Selectively)
            console.log("⏳ Processing images...");

            // Fetch Hotel Images (usually specific enough)
            const processedHotelsPromises = hotelOptions.map(async (hotel) => {
                const googleImageUrl = await fetchPlacePhoto(hotel.name, formData.destination);
                return {
                    ...hotel,
                    image_url: googleImageUrl || hotel.imageUrl || hotel.hotelImagesUrl?.[0] || DEFAULT_HOTEL_IMG
                };
            });

            // const processedItineraryPromises=dailyItinerary.map(async(day)=>{
            //     const googleImageUrl=await fetchPlacePhoto(day.)
            // })
            const isAIPlaceholder = (url) => url && url.startsWith("[") && url.endsWith("]");

const processedItineraryPromises = dailyItinerary.map(async (day) => {
    const planItems = Array.isArray(day.plan) ? day.plan : [];

    const updatedPlanItemsPromises = planItems.map(async (place) => {
        let finalImageUrl = DEFAULT_PLACE_IMG;
        const placeNameLower = (place.placeName || "").toLowerCase();
        const aiImageUrlIsPlaceholder = isAIPlaceholder(place.placeImageUrl);


        if ( place.placeName) {
            console.log(`Attempting Google Image fetch for specific item: ${place.placeName}`);
            const googleImageUrl = await fetchPlacePhoto(place.placeName, formData.destination);
            finalImageUrl = googleImageUrl || (!aiImageUrlIsPlaceholder && place.placeImageUrl) || DEFAULT_PLACE_IMG;
        } else {
            console.log(`Skipping Google Image fetch for generic/unnamed item: ${place.placeName || 'Unnamed'}`);
            finalImageUrl = (!aiImageUrlIsPlaceholder && place.placeImageUrl) || DEFAULT_ACTIVITY_IMG || DEFAULT_PLACE_IMG;
        }

        return {
            ...place,
            image_url: finalImageUrl
        };
    });

    const updatedPlanItems = await Promise.all(updatedPlanItemsPromises);
    return { ...day, plan: updatedPlanItems };
});

const processedHotels = await Promise.all(processedHotelsPromises);
const processedItinerary = await Promise.all(processedItineraryPromises);

console.log("✅ Images processed.");

            // 4. Prepare Data Object for localStorage
            const destinationImage = spotDetails?.location?.image_url || DEFAULT_PLACE_IMG;
            const tripDataToStore = {
                location: {
                    name: formData.destination,
                    description: tripDetails?.notes || `AI-generated trip plan for ${formData.destination}`,
                    geo_coordinates: spotDetails?.location?.geo_coordinates || null,
                    image_url: destinationImage,
                },
                hotels: processedHotels,
                daily_itinerary: processedItinerary,
                trip_details: tripDetails,
            };

            console.log("💾 Prepared trip data object for localStorage:", tripDataToStore);

            // 5. Store in LocalStorage
            try {
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tripDataToStore));
                console.log("✅ Trip data saved temporarily to localStorage.");
                navigate('/confirm-trip'); // Navigate after successful storage
            } catch (storageError) {
                console.error("❌ Error saving data to localStorage:", storageError);
                if (storageError.name === 'QuotaExceededError') { throw new Error("Could not store trip plan. Browser storage might be full."); }
                else { throw new Error("Failed to temporarily store trip plan in browser."); }
            }

        } catch (error) {
            console.error("❌ Error during trip generation or temporary storage:", error);
            setError(`Error: ${error.message}`);
            alert(`An error occurred: ${error.message}`);
        } finally {
            setGenerating(false);
        }
    };

    // --- JSX Rendering ---
    // (Keep JSX return block exactly as it was)
        if (loading) return <div className="travel-form full-screen"><p>Loading destination details...</p></div>;
    if (error && !spotDetails && !generating && !formData.destination) {
        return <div className="travel-form full-screen"><p style={{ color: 'red' }}>Error loading destination: {error}. Cannot proceed.</p></div>;
    }
    return (
        <div className="travel-form">
        <h2>Tell us your travel preferences 🌋🏝</h2>
        <p>
            Plan your trip for:{" "}
            <strong>{formData.destination || "your destination"}</strong>
        </p>

        {error && !generating && (
            <p style={{ color: "red", fontWeight: "bold", marginTop: "10px" }}>
                Error: {error}
            </p>
        )}

        <div className="form-section">
            <label htmlFor="destination-input">Destination</label>
            <input
                id="destination-input"
                type="text"
                value={formData.destination}
                readOnly
                style={{ backgroundColor: "#eee", cursor: "not-allowed" }}
                aria-label="Selected Destination"
            />
            {error && generating && (
                <p style={{ color: "red", fontWeight: "bold", marginTop: "10px" }}>
                    Error: {error}
                </p>
            )}
        </div>

        <div className="form-section">
            <label htmlFor="days-input">Number of Days</label>
            <input
                id="days-input"
                type="number"
                placeholder="Ex. 3"
                min="1"
                value={formData.days}
                onChange={(e) => handleChange("days", e.target.value)}
                disabled={generating}
                required
            />
        </div>

        <div className="form-section">
            <h2>Budget</h2>
            <div className="options-grid options-3">
                {["Cheap", "Moderate", "Luxury"].map((label) => (
                    <div
                        key={label}
                        role="button"
                        tabIndex={generating ? -1 : 0}
                        className={`option-box ${formData.budget === label ? "selected" : ""} ${
                            generating ? "disabled" : ""
                        }`}
                        onClick={() => !generating && handleChange("budget", label)}
                        onKeyPress={(e) =>
                            !generating &&
                            (e.key === "Enter" || e.key === " ") &&
                            handleChange("budget", label)
                        }
                        aria-pressed={formData.budget === label}
                    >
                        <span role="img" aria-label="budget-icon">
                            💰
                        </span>
                        <h3>{label}</h3>
                    </div>
                ))}
            </div>
        </div>

        <div className="form-section">
            <h2>Traveling With</h2>
            <div className="options-grid options-4">
                {["Just Me", "A Couple", "Friends", "Family"].map((label) => (
                    <div
                        key={label}
                        role="button"
                        tabIndex={generating ? -1 : 0}
                        className={`option-box ${formData.travelWith === label ? "selected" : ""} ${
                            generating ? "disabled" : ""
                        }`}
                        onClick={() => !generating && handleChange("travelWith", label)}
                        onKeyPress={(e) =>
                            !generating &&
                            (e.key === "Enter" || e.key === " ") &&
                            handleChange("travelWith", label)
                        }
                        aria-pressed={formData.travelWith === label}
                    >
                        <span role="img" aria-label="traveler-icon">
                            🧳
                        </span>
                        <h3>{label}</h3>
                    </div>
                ))}
            </div>
        </div>

        <button
            className="submit-btn"
            disabled={
                !formData.destination ||
                !formData.days ||
                !formData.budget ||
                !formData.travelWith ||
                generating
            }
            onClick={OnGenrateTrip}
            aria-live="polite"
        >
            {generating ? "Generating Plan..." : "Generate & Preview Plan"}
        </button>
    </div>

    );
}