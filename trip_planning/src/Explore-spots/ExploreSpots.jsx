import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { StoreCon } from '../context/Store'; // <<< ADAPT PATH
import "./ExploreSpots.css"; // Your existing CSS
import { jwtDecode } from "jwt-decode";

// --- Constants ---
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
const USER_TOKEN_KEY = 'authToken'; // <<< USE YOUR ACTUAL TOKEN KEY
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""; // <<< ADD KEY

// Base API path for wishlist actions (Corrected for separate router)
const API_BASE_PATH_WISHLIST = '/api/wishlist'; // <<< CORRECTED: Use /api/wishlist

function ExploreSpots() {
    const { id: spotId } = useParams();
    const [spotDetails, setSpotDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    // --- Wishlist State ---
    const { token } = useContext(StoreCon);
    const [isInWishlist, setIsInWishlist] = useState(false);
    const [isWishlistLoading, setIsWishlistLoading] = useState(false);
    const [wishlistError, setWishlistError] = useState(null);

    // Effect to fetch main spot details
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            setWishlistError(null);

            try {
                // Fetch spot details (path remains the same)
                const response = await axios.get(`${BACKEND_URL}/api/spot/tourist-spot/${spotId}`);
                if (response.data.success && response.data.data) {
                    setSpotDetails(response.data.data);
                } else {
                    setError(response.data.message || "Spot not found");
                    setSpotDetails(null);
                }
            } catch (err) {
                console.error("Error fetching spot details:", err);
                setError(err.response?.data?.message || "Failed to fetch spot details.");
                setSpotDetails(null);
            } finally {
                setLoading(false);
            }
        };
        if (spotId) {
            fetchData();
        } else {
            setError("No Spot ID provided.");
            setLoading(false);
        }
    }, [spotId]);

    // --- Effect to check wishlist status ---
    useEffect(() => {
        if (spotDetails && spotId && token) {
            const checkWishlist = async () => {
                setWishlistError(null);
                try {
                    // --- API CALL 1: Check Wishlist Status (Using CORRECTED PATH) ---
                    const checkUrl = `${BACKEND_URL}${API_BASE_PATH_WISHLIST}/check/${spotId}`; // Uses /api/wishlist
                    console.log("Checking wishlist at:", checkUrl); // Verify URL
                    const response = await axios.get(checkUrl, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (response.data.success) {
                        setIsInWishlist(response.data.isInWishlist);
                    } else {
                        setWishlistError("Could not verify wishlist status.");
                    }
                } catch (err) {
                    console.error("Error checking wishlist status:", err);
                    setWishlistError("Could not check wishlist status.");
                }
            };
            checkWishlist();
        } else {
            setIsInWishlist(false);
        }
    }, [spotDetails, spotId, token]);

    // --- Handler for Toggling Wishlist ---





    const handleToggleWishlist = async () => {
        if (!token) {
          alert("Please log in to manage your wishlist.");
          navigate('/login', { state: { from: location.pathname } });
          return;
        }
      
        if (!spotId) {
          alert("Missing spot ID.");
          return;
        }
      
        setIsWishlistLoading(true);
        setWishlistError(null);
      
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
      
        try {
          let response;
          if (isInWishlist) {
            // Remove from wishlist
            const removeUrl = `${BACKEND_URL}${API_BASE_PATH_WISHLIST}/remove/${spotId}`;
            response = await axios.delete(removeUrl, config);
          } else {
            // Add to wishlist
            const addUrl = `${BACKEND_URL}${API_BASE_PATH_WISHLIST}/add`;
            response = await axios.post(
              addUrl,
              { spotId }, // ✅ only spotId needed — userId comes from token
              config
            );
          }
      
          if (response.data.success) {
            setIsInWishlist(!isInWishlist);
          } else {
            setWishlistError(response.data.message || "Failed to update wishlist.");
          }
        } catch (err) {
          console.error("Error updating wishlist:", err);
          setWishlistError(err.response?.data?.message || "An error occurred.");
        } finally {
          setIsWishlistLoading(false);
        }
      };

    // --- Other existing functions (openInGoogleMaps, handleImgError) ---
    const openInGoogleMaps = (name) => {
        const query = name || spotDetails?.location?.name;
        if (!query) return;
        const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
        window.open(googleMapsUrl, "_blank");
    };

    const handleImgError = (e, defaultSrc = "/images/default-placeholder.png") => {
        e.target.onerror = null;
        e.target.src = defaultSrc;
    };

    // --- Render Logic ---
    if (loading) {
        return <div className="explore-spots-container full-screen loading">Loading spot details...</div>;
    }
    if (error) {
        return <div className="explore-spots-container full-screen error">Error: {error}</div>;
    }
    if (!spotDetails) {
        return <div className="explore-spots-container full-screen no-data">No spot details available.</div>;
    }

    // --- Safely access data ---
    const locationName = spotDetails.location?.name || "Location Name";
    const locationDesc = spotDetails.location?.description || "No description available.";
    const locationImage = spotDetails.location?.image_url;
    const hotels = spotDetails.hotels || [];
    const attractions = spotDetails.nearby_attractions || [];

    return (
        <div className="explore-spots-container full-screen">

             {/* Main Image */}
            {locationImage ? (
                 <div className="location-image-container">
                    <img
                        src={locationImage}
                        alt={`${locationName} main image`}
                        className="location-image"
                        onError={(e) => handleImgError(e, "/images/default-location.png")}
                    />
                 </div>
            ) : (
                 <div className="location-image-container placeholder">No Image Available</div>
            )}

            {/* Spot Details Section */}
            <div className="spot-details">
                <div className="spot-title-wishlist-wrapper">
                    <h2 className="spot-name">{locationName}</h2>
                    {/* --- Wishlist Button --- */}
                    {token && (
                         <button
                            className={`wishlist-toggle-button ${isInWishlist ? 'active' : ''}`}
                            onClick={handleToggleWishlist}
                            disabled={isWishlistLoading || !spotId}
                            aria-label={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
                         >
                            {isWishlistLoading ? (
                                <div className="wishlist-spinner"></div>
                            ) : isInWishlist ? (
                                <FaHeart />
                            ) : (
                                <FaRegHeart />
                            )}
                        </button>
                    )}
                </div>
                 {wishlistError && <p className="wishlist-action-error">{wishlistError}</p>}

                {locationDesc !== "No description available." && (
                    <p className="spot-description">{locationDesc}</p>
                )}
            </div>

             {/* Sections for Hotels and Attractions */}
             <section className="hotels-section">
                <h3>Hotel Recommendations</h3>
                <div className="hotel-grid">
                    {hotels.length > 0 ? (
                        hotels.map((hotel, index) => (
                            <div key={`hotel-${index}-${hotel.name}`} className="hotel-card" onClick={() => openInGoogleMaps(hotel.name)}>
                                <img
                                    src={hotel.image_url || "/images/default-hotel.jpg"}
                                    alt={hotel.name || 'Hotel'}
                                    className="hotel-image"
                                    onError={(e) => handleImgError(e, "/images/default-hotel.jpg")}
                                />
                                <h4 className="hotel-name">{hotel.name || 'Hotel Name'}</h4>
                                <p className="hotel-address">{hotel.address || 'Address not available'}</p>
                            </div>
                        ))
                    ) : (
                        <p>No recommended hotels found.</p>
                    )}
                </div>
            </section>

            <section className="attractions-section">
                <h3>Nearby Attractions</h3>
                 <div className="attraction-grid">
                    {attractions.length > 0 ? (
                        attractions.map((attraction, index) => (
                            <div key={`attraction-${index}-${attraction.name}`} className="attraction-card" onClick={() => openInGoogleMaps(attraction.name)}>
                                <img
                                    src={attraction.image_url || "/images/default-place.jpg"}
                                    alt={attraction.name || 'Attraction'}
                                    className="attraction-image"
                                    onError={(e) => handleImgError(e, "/images/default-place.jpg")}
                                />
                                <h4 className="attraction-name">{attraction.name || 'Attraction Name'}</h4>
                                <p className="hotel-address">{attraction.details || ''}</p>
                            </div>
                        ))
                    ) : (
                        <p>No nearby attractions listed.</p>
                    )}
                </div>
            </section>

            {/* Google Map */}
            <div className="map-container">
                 <h3>Location Map</h3>
                 {locationName !== "Location Name" ? (
                    <iframe
                        src={`https://www.google.com/maps?q=${encodeURIComponent(locationName)}&output=embed`}
                        // Or Embed API: src={`https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(locationName)}`}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        className="google-map"
                        title={`${locationName} Map`}
                    ></iframe>
                 ) : (
                    <p>Map requires a location name.</p>
                 )}
            </div>

            {/* Plan Trip Button */}
            <div className="plan-trip-container">
                 <button
                    className="plan-trip-button"
                    onClick={() => spotDetails?._id && navigate(`/preferences/${spotDetails._id}`)}
                    disabled={!spotDetails?._id}
                >
                    Plan Trip
                </button>
            </div>
        </div>
    );
}

export default ExploreSpots;