import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom"; // Use Link for navigation
import "./Login.css"; // Import the provided CSS file
import axios from "axios";
import { StoreCon } from "../context/Store";

// --- Constants ---
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
const USER_TOKEN_KEY = 'authToken';
const USER_INFO_KEY = 'userInfo';

// --- Asset Import (Optional but recommended for build tools) ---
// If you have the close icon locally:
// import closeIcon from './assets/close_icon.svg'; // Adjust path as needed
// Otherwise, keep the Wikimedia URL

const Login = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [credentials, setCredentials] = useState({
        email: "",
        password: "",
    });
    // Assume the popup should be visible when this component mounts via routing
    const [isVisible, setIsVisible] = useState(true);

    const { setToken, setUser } = useContext(StoreCon);

    const onChangeHandler = (event) => {
        const { name, value } = event.target;
        setCredentials((prevCredentials) => ({ ...prevCredentials, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        setIsLoading(true);

        if (!credentials.email || !credentials.password) {
            setMessage({ type: 'error', text: '❌ Please enter both email and password.' });
            setIsLoading(false);
            return;
        }

        try {
            const loginUrl = `${BACKEND_URL}/api/user/login`;
            console.log(`Attempting login for ${credentials.email} to ${loginUrl}`);
            const response = await axios.post(loginUrl, credentials);
            console.log("API Login Response Data:", response.data);

            if (response.data?.success && response.data?.token) {
                const receivedToken = response.data.token;
                const userData = response.data.user;

                localStorage.setItem(USER_TOKEN_KEY, receivedToken);
                console.log('Token saved to localStorage:', receivedToken);

                if (userData && typeof userData === 'object') {
                    localStorage.setItem(USER_INFO_KEY, JSON.stringify(userData));
                    console.log('User info saved to localStorage:', userData);
                } else {
                    localStorage.removeItem(USER_INFO_KEY);
                    console.log('No user info received or invalid format.');
                }

                setToken(receivedToken);
                if (setUser && userData) {
                   setUser(userData);
                   console.log('User context updated.');
                } else if (setUser) {
                   setUser(null);
                   console.log('User context cleared (no user data received).');
                }

                setMessage({ type: 'success', text: '✅ Login successful! Redirecting...' });
                setTimeout(() => {
                   setIsVisible(false); // Hide popup before navigating
                   // *** REDIRECT TO HOME PAGE ***
                   navigate('/'); // Corrected redirection path to home
                }, 1000); // Keep the delay to show the success message

            } else {
                setMessage({ type: 'error', text: response.data?.message || '❌ Invalid credentials. Please try again.' });
                setIsLoading(false); // Stop loading on failure
            }
        } catch (error) {
            console.error("Login failed:", error);
            let errorMsg = "⚠️ An error occurred. Please try again later.";
            if (error.response) {
                console.error("Error Response Data:", error.response.data);
                errorMsg = error.response.data?.message || `❌ Server Error: ${error.response.status}`;
            } else if (error.request) {
                console.error("Error Request:", error.request);
                errorMsg = "⚠️ Network Error: Could not reach the server.";
            } else {
                console.error('Error Message:', error.message);
                errorMsg = `⚠️ Request Setup Error: ${error.message}`;
            }
            setMessage({ type: 'error', text: errorMsg });
            setIsLoading(false); // Stop loading on error
        }
        // Removed finally block to control isLoading more precisely
    };

    // Handler to close the popup/navigate away
    const handleClose = () => {
        setIsVisible(false);
        // Add a small delay to allow the fade-out animation before navigating
        setTimeout(() => {
             navigate(-1); // Go back to the previous page
        }, 300); // Should match the transition duration in CSS
    };

    return (
        // Use the CSS classes directly for the popup structure
        <div className={`login-popup ${isVisible ? "show" : ""}`}>
            {/* The white container holding the form */}
            <form className="login-popup-container" onSubmit={handleSubmit}>
                {/* Title section */}
                <div className="login-popup-title">
                    <h2>Login</h2>
                    {/* Close Icon */}
                    <img
                        // src={closeIcon || "https://upload.wikimedia.org/wikipedia/commons/6/66/Close_icon.svg"} // Use local or remote
                        src={"https://upload.wikimedia.org/wikipedia/commons/6/66/Close_icon.svg"}
                        alt="Close" // Important for accessibility
                        onClick={handleClose}
                    />
                </div>

                {/* Display messages - place it logically, e.g., below title */}
                {message.text && (
                    <p
                       className={`login-message ${message.type}`} // Keep custom message styling if needed, or integrate with CSS
                       style={{ textAlign: 'center', margin: '10px 0', fontWeight: 'bold', color: message.type === 'error' ? 'red' : 'green' }} // Example inline style or use classes
                       aria-live="assertive"
                    >
                        {message.text}
                    </p>
                )}

                {/* Input fields section */}
                <div className="login-popup-inputs">
                    {/* Email Input - Keeping label for accessibility, CSS might hide it */}
                    <label htmlFor="email" style={{ display: 'none' }}>Email</label> {/* Hide label visually if needed */}
                    <input
                        id="email"
                        name="email"
                        type="email"
                        onChange={onChangeHandler}
                        value={credentials.email}
                        placeholder="Your Email"
                        required
                        disabled={isLoading}
                        aria-required="true"
                    />
                    {/* Password Input - Keeping label for accessibility */}
                     <label htmlFor="password" style={{ display: 'none' }}>Password</label> {/* Hide label visually if needed */}
                    <input
                        id="password"
                        name="password"
                        type="password"
                        onChange={onChangeHandler}
                        value={credentials.password}
                        placeholder="Password"
                        required
                        disabled={isLoading}
                        aria-required="true"
                    />
                </div>

                {/* Terms and conditions section */}
                <div className="login-popup-condition">
                    <input
                       id="terms" // Keep id for potential label association if re-added
                       type="checkbox"
                       required
                       disabled={isLoading}
                     />
                    {/* Use <p> as styled by the CSS */}
                    <p>By continuing, I agree to the terms of use & Privacy Policy</p>
                </div>

                {/* Submit button - uses the .button class */}
                <button className="button" type="submit" disabled={isLoading}>
                    {isLoading ? "Logging In..." : "Login"}
                </button>

                {/* Switch to Register section */}
                {/* Use <p> and <span> as styled by the CSS */}
                <p>
                    Don't have an account?{" "}
                    {/* Use Link component inside the span for correct navigation */}
                    <Link to="/register">
                        <span>Click Here</span>
                    </Link>
                </p>

            </form>
        </div>
    );
};

export default Login;