import React, { useState, useEffect } from "react";
import "./Hero.css";
import assets from "../assets/assets";

const Hero = () => {
  const [slideIndex, setSlideIndex] = useState(0);

  const slides = [
    {
      backgroundImage: `url(${assets.front})`,
      content: (
        <div className="text-overlay">
          <a href="/destinations" className="button scroll-link">Plan Trip</a>
          <a href="/destinations" className="button scroll-link">View Points</a>
        </div>
      ),
    },
    {
      backgroundImage: `url(${assets.montan})`,
      content: (
        <div className="text-overlay">
          <p>Exclusive Offers for Prime Members</p>
          <a href="/destinations" className="button scroll-link">Plan Trip</a>
        </div>
      ),
    },
    {
      backgroundImage: `url(${assets.front3})`,
      content: (
        <div className="statistics">
          <p>
            <strong>Over 10,000 Users</strong>
            <br />
            Successfully Planned Trips
          </p>
        </div>
      ),
    },
    {
      backgroundImage: `url(${assets.front4})`,
      content: (
        <div className="functionalities">
          <p>
            Budget Planning, Easy Bookings,
            <br />
            Trip Suggestions & More...
          </p>
        </div>
      ),
    },
  ];

  const showSlide = (index) => {
    setSlideIndex(index);
  };

  const nextSlide = () => {
    setSlideIndex((prevIndex) => (prevIndex + 1) % slides.length);
  };

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="slideshow-container">
      <div className="slide-wrapper">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`slide ${index === slideIndex ? "active" : ""}`}
            style={{
              display: index === slideIndex ? "block" : "none",
              backgroundImage: slide.backgroundImage,
            }}
          >
            {slide.content}
          </div>
        ))}
      </div>

      <div className="dots-container">
        {slides.map((_, index) => (
          <span
            key={index}
            className={`dot ${index === slideIndex ? "active-dot" : ""}`}
            onClick={() => showSlide(index)}
          ></span>
        ))}
      </div>
    </div>
  );
};

export default Hero;
