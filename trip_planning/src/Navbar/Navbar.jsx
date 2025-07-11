import React, { useContext } from 'react'; // Import useContext
import { Link } from "react-router-dom";
import { StoreCon } from '../context/Store'; // Adjust the path if necessary
import './navbar.css'; // Make sure your CSS file is imported

const Navbard = () => {
    // Get the authentication token from the context
    const { token } = useContext(StoreCon);

    return (
        <header>
            <nav className="navbar">
                <div className="logo">Travogenie</div>
                <ul className="nav-links">
                    {/* Keep existing links - using <a> for external/placeholder might be okay, but Link is better for internal */}
              
                    <li><Link to="/destinations">Where2Go</Link></li>

                    {/* ✅ Conditional Rendering based on token */}
                    {token ? (
                        // --- User is Logged In ---
                        <li>
                            {/* Link wrapping the profile icon, points to dashboard */}
                            <Link to="/dashboard" className="profile-link" aria-label="View Dashboard">
                                {/* You can use an emoji or an <img> or SVG icon */}
                                <span className="profile-icon" role="img" aria-hidden="true">
                                    👤 {/* Simple profile emoji */}
                                </span>
                                {/* Example with an image/SVG:
                                <img src="/path/to/your/profile-icon.svg" alt="" className="profile-icon-img" />
                                */}
                            </Link>
                        </li>
                    ) : (
                        // --- User is Logged Out ---
                        <li>
                            {/* Use Link component for internal navigation */}
                            <Link to="/login">Login/Registration</Link>
                        </li>
                    )}
                </ul>
            </nav>
        </header>
    );
};

export default Navbard;