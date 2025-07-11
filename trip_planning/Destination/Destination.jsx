import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Destination.css";
import { StoreCon } from "../src/context/Store";

const API_KEY = "AlzaSyD7IHI3DMdCV4ag08VP7JfC2FR7fO4d_YI"; // Replace with your actual API key

const DestinationPage = () => {
    const { spot_list, fetchSpotList, categories } = useContext(StoreCon);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchSpotList();
    }, [fetchSpotList]);

    const fetchSuggestions = async (input) => {
        if (input.length < 3) {
            setSuggestions([]);
            return;
        }

        try {
            const response = await axios.get(
                `https://maps.gomaps.pro/maps/api/place/queryautocomplete/json?input=${input}&key=${API_KEY}`
            );
            if (response.data?.predictions) {
                setSuggestions(response.data.predictions);
            }
        } catch (error) {
            console.error("Error fetching location suggestions:", error);
        }
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchQuery(value);
        fetchSuggestions(value);
    };

    const handleSelect = (suggestion) => {
        setSearchQuery(suggestion.description);
        setSuggestions([]);
    };

    const filteredSpots = spot_list.filter((place) => {
        const matchesCategory =
            selectedCategory === "All" ||
            (place.category &&
                place.category.toLowerCase() === selectedCategory.toLowerCase());

        const matchesSearch =
            searchQuery === "" ||
            (place.location?.name &&
                place.location.name.toLowerCase().includes(searchQuery.toLowerCase()));

        return matchesCategory && matchesSearch;
    });

    return (
        <div>
            {/* Breadcrumb Section */}
            <div className="breadcrumb-container">
                <div className="breadcrumb">
                    <Link to="/" className="breadcrumb-link">Home</Link>
                    <span className="breadcrumb-separator"> / </span>
                    <span className="breadcrumb-current">{selectedCategory} Destinations</span>
                </div>

                <div className="description-box">
                    <h4>Explore {selectedCategory} Destinations!</h4>
                    <p>
                        Find the best places for {selectedCategory.toLowerCase()} experiences. Click a category to refine your search!
                    </p>
                </div>
            </div>

            {/* Search Input with Suggestions */}
            <div style={{ width: "300px", margin: "20px auto" }}>
                <input
                    type="text"
                    placeholder="Search destinations..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
                />
                {suggestions.length > 0 && (
                    <ul style={{
                        listStyle: "none",
                        padding: 0,
                        margin: 0,
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        maxHeight: "200px",
                        overflowY: "auto",
                        background: "#fff",
                        color: "black",
                    }}>
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
            </div>

            {/* Categories */}
            <div className="category-container">
                <div
                    className={`category ${selectedCategory === "All" ? "active-category" : ""}`}
                    onClick={() => { setSelectedCategory("All"); setSearchQuery(""); }}
                >
                    All
                </div>
                {categories.map((category, index) => (
                    <div
                        key={index}
                        className={`category ${selectedCategory === category ? "active-category" : ""}`}
                        onClick={() => { setSelectedCategory(category); setSearchQuery(""); }}
                    >
                        {category}
                    </div>
                ))}
            </div>

            {/* Destinations */}
            <div className="destination-container">
                <h1 className="destination-title">{selectedCategory} Destinations</h1>
                {filteredSpots.length === 0 ? (
                    <p>No destinations available for {selectedCategory}.</p>
                ) : (
                    <div className="destination-grid">
                        {filteredSpots.map((place, index) => (
                            <div className="destination-card" key={index}>
                                {place.location?.image_url ? (
                                    <img
                                        src={place.location.image_url}
                                        alt={place.location?.name || "Destination"}
                                        className="destination-img"
                                       
                                       
                                    />
                                ) : (
                                    <div className="placeholder-image">No Image Available</div>
                                )}
                                <div className="destination-info">
                                    <h2 className="destination-name">{place.name}</h2>
                                    <p className="destination-location">{place.location?.description}</p>
                                    <button
                                        className="explore-btn"
                                        onClick={() => navigate(`/tourist-spot/${place._id}`)}
                                    >
                                        Explore More
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DestinationPage;