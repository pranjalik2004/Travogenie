import React from "react";
import { useNavigate } from "react-router-dom";
import "./Explore.css";  // Ensure this file exists
import assets from "../assets/assets";  // Adjust path if needed

const ViewPoint = () => {
  const navigate = useNavigate();

  const spots = [
    { label: "Natural Spots", icon: assets.Natural, path: "/explore-spots/natural" },
    { label: "Trekking", icon: assets.Treak, path: "/explore-spots/trekking" },
    { label: "Honeymoon", icon: assets.Honemoon, path: "/explore-spots/honeymoon" },
    { label: "Heritage", icon: assets.Hiratage, path: "/explore-spots/heritage" },
    { label: "Pilgrimage", icon: assets.pilgrimage, path: "/explore-spots/pilgrimage" }
  ];

  const handleSpotClick = (path) => {
    navigate('/destinations');
  };

  return (
    <div id="view-points" style={{ marginTop: "40px" }}>
      <h2>View Points</h2>
      <p>Explore popular destinations and hidden gems.</p>
      <section className="explore-spots">
        {spots.map((spot, index) => (
          <div
            className="spot"
            key={index}
            onClick={() => handleSpotClick(spot.path)}
            style={{ cursor: "pointer" }}
          >
            <div className="icon">
              <img 
                src={spot.icon} 
                alt={spot.label} 
                onError={(e) => {
                  console.error("Image Load Error:", e.target.src);
                  e.target.src = "/assets/default.jpg";  // Fallback image
                }} 
              />
            </div>
            <p>{spot.label}</p>
          </div>
        ))}
      </section>
    </div>
  );
};

export default ViewPoint;
