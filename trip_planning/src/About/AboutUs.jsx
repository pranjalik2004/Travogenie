import React, { useState, useEffect } from 'react'; // Import useState and useEffect
import './AboutUs.css'; // Link the new CSS file

const AboutUs = () => {
  // State to hold the traveler count
  const [travelerCount, setTravelerCount] = useState(0);

  // Simulate fetching the count when the component mounts
  useEffect(() => {
    // In a real app, you would fetch this from your backend API:
    // fetch('/api/stats/traveler-count')
    //   .then(res => res.json())
    //   .then(data => setTravelerCount(data.count))
    //   .catch(err => console.error("Failed to fetch traveler count:", err));

    // --- Simulation for demonstration ---
    const simulatedCount = 12345; // Replace with your actual or fetched count
    // Animate the count up (optional nice touch)
    let currentCount = 0;
    const step = Math.ceil(simulatedCount / 100); // Adjust speed by changing 100
    const timer = setInterval(() => {
      currentCount += step;
      if (currentCount >= simulatedCount) {
        setTravelerCount(simulatedCount);
        clearInterval(timer);
      } else {
        setTravelerCount(currentCount);
      }
    }, 20); // Interval speed

    return () => clearInterval(timer); // Cleanup interval on unmount
    // --- End Simulation ---

  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <div className="about-us-container">
      {/* Header */}
      <header className="about-us-hero">
        <div className="hero-content">
          <h1>About Travogenie</h1>
          <p className="subtitle">Simplifying Your Journey with AI-Powered Travel Planning</p>
        </div>
      </header>

      {/* Purpose Section */}
      <section className="about-section purpose-section">
        <h2>Our Purpose</h2>
        <p>
          Travel planning should be exciting, not exhausting. Travogenie was created to revolutionize how you plan your trips
          by harnessing the power of Artificial Intelligence. We aim to eliminate the hours spent searching and comparing,
          providing you with personalized, detailed itineraries tailored to your unique budget, interests, and travel style.
          Our mission is to make dream vacations accessible and stress-free for everyone.
        </p>
      </section>

      {/* Flow Section */}
      <section className="about-section flow-section">
        <h2>How Travogenie Works</h2>
        <div className="flow-steps-container">
          <div className="flow-step">
            <div className="step-icon">1</div>
            <h3>Explore & Choose</h3>
            <p>Discover curated destinations or pick your desired location.</p>
          </div>
          <div className="flow-step">
            <div className="step-icon">2</div>
            <h3>Define Preferences</h3>
            <p>Tell our AI your budget, travel dates, companions, and interests.</p>
          </div>
          <div className="flow-step">
            <div className="step-icon">3</div>
            <h3>Generate Your Plan</h3>
            <p>Receive a custom AI-generated itinerary in moments.</p>
          </div>
          <div className="flow-step">
            <div className="step-icon">4</div>
            <h3>Review & Save</h3>
            <p>Check your detailed plan, including hotels and activities, then confirm.</p>
          </div>
        </div>
      </section>

      {/* Impact/Stats Section */}
      <section className="about-section stats-section">
        <h2>Our Impact So Far</h2>
        <div className="stats-box">
          <div className="stat-item">
            {/* Display the traveler count dynamically */}
            <span className="stat-number">{travelerCount.toLocaleString()}</span>
            <span className="stat-label">Successful Trips Planned</span>
          </div>
          {/* You can add more stats here later */}
          {/* <div className="stat-item">
            <span className="stat-number">500+</span>
            <span className="stat-label">Destinations Covered</span>
          </div> */}
        </div>
        <p className="stats-note">Join thousands of happy travelers who planned their perfect getaway with Travogenie!</p>
      </section>

      {/* Contact Section - Kept similar */}
      <section className="about-section contact-section">
        <h2>Get in Touch</h2>
        <p>Have questions, feedback, or ideas? We'd love to connect!</p>
        <a href="mailto:contact@travogenie.com" className="contact-button">Contact Us</a> {/* Update email */}
      </section>
    </div>
  );
};

export default AboutUs;