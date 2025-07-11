import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios'; // Or use fetch API
import { StoreCon } from '../context/Store';
 // Reuse the same CSS as DestinationPage for consistency

// --- SIMULATED WISHLIST API RESPONSE DATA ---
// In a real app, this array would come from your backend API endpoint (e.g., /api/wishlist)
// It matches the structure you provided in the console log.

// --- END SIMULATED DATA ---


const WishlistPage = () => {
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const {token}=useContext(StoreCon)

    useEffect(() => {
        const fetchWishlist = async () => {
            if (!token) {
                alert("Please log in to view your wishlist.");
                navigate('/login');
                return;
            }

            try {
                setLoading(true);
                setError(null);

                const response = await axios.get('http://localhost:5000/api/wishlist/my', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.data.success) {
                    setWishlistItems(response.data.wishlist);
                    console.log("Wishlist fetched:", response.data.wishlist);
                } else {
                    setError(response.data.message || "Failed to load wishlist.");
                }
            } catch (err) {
                console.error("Error fetching wishlist:", err);
                setError(err.response?.data?.message || "An error occurred.");
            } finally {
                setLoading(false);
            }
        };

        fetchWishlist();
    }, [token, navigate]);
 // Empty dependency array means this runs once on component mount

    // --- Render States ---
    if (loading) {
        return <div className="loading-message">Loading your wishlist...</div>;
    }

    if (error) {
        return <div className="error-message">Error: {error}</div>;
    }

    return (
        <div>
            {/* Breadcrumb Section (Optional) */}
            <div className="breadcrumb-container">
                <div className="breadcrumb">
                    <Link to="/" className="breadcrumb-link">Home</Link>
                    <span className="breadcrumb-separator"> / </span>
                    <span className="breadcrumb-current">My Wishlist</span>
                </div>
                <div className="description-box">
                    <h4>Your Saved Destinations</h4>
                    <p>
                        Here are the spots you've saved for future adventures!
                    </p>
                </div>
            </div>

            {/* Wishlist Destinations */}
            <div className="destination-container"> {/* Reusing class from Destination.css */}
                <h1 className="destination-title">My Wishlist</h1> {/* Reusing class */}
                {wishlistItems.length === 0 ? (
                    <p style={{ textAlign: 'center', marginTop: '30px' }}>Your wishlist is empty. Start exploring and add some spots!</p>
                ) : (
                    <div className="destination-grid"> {/* Reusing class */}
                        {wishlistItems.map((item) => (
                            // Ensure item and item.spotId exist before trying to access properties
                            item && item.spotId && (
                                <div className="destination-card" key={item._id}> {/* Use wishlist item's _id as key */}
                                    {item.spotId.location?.image_url ? (
                                        <img
                                            src={item.spotId.location.image_url}
                                            alt={item.spotId.location?.name || "Wishlisted Destination"}
                                            className="destination-img" // Reusing class
                                        />
                                    ) : (
                                        <div className="placeholder-image">No Image Available</div> // Placeholder if no image
                                    )}
                                    <div className="destination-info"> {/* Reusing class */}
                                        {/* Use location.name as the title, or fallback */}
                                        <h2 className="destination-name">{item.spotId.location?.name || 'Unnamed Spot'}</h2>
                                        {/* Use location.description */}
                                        <p className="destination-location">{item.spotId.location?.description || 'No description available.'}</p>
                                        <button
                                            className="explore-btn" // Reusing class
                                            // Navigate to the detail page using the SPOT's ID (spotId._id)
                                            onClick={() => navigate(`/tourist-spot/${item.spotId._id}`)}
                                        >
                                            Explore More
                                        </button>
                                    </div>
                                </div>
                            )
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default WishlistPage;