import React, { useEffect, useState, useContext } from "react"; // Import useContext
import axios from "axios";
import "./UserDashboard.css";
import { Link, useNavigate } from "react-router-dom";
import { FaEdit, FaBell, FaUserShield, FaQuestionCircle } from "react-icons/fa";
// Removed CgProfile import as it wasn't used
import { StoreCon } from '../context/Store'; // Import context - ADJUST PATH

// --- Constants ---
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
const USER_TOKEN_KEY = 'authToken'; // *** USE THE SAME KEY AS IN LOGIN/STORE ***
const USER_INFO_KEY = 'userInfo';   // *** USE THE SAME KEY AS IN LOGIN/STORE ***

const UserDashboard = () => {
    const navigate = useNavigate();
    const { user: contextUser, setUser: setContextUser, setToken: setContextToken } = useContext(StoreCon); // Get context state/setters
const {token}=useContext(StoreCon)
    // Component state
    const [componentUser, setComponentUser] = useState(null); // Local copy for display/edit
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(false);

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",   // Ensure backend supports these
        address: "", // Ensure backend supports these
        gender: ""   // Ensure backend supports these
    });

    // Initial data fetch
    useEffect(() => {
        const fetchUser = async () => {
            setIsLoading(true);
            setError(null);
            const token = localStorage.getItem(USER_TOKEN_KEY); // *** FIX 1: Use correct key ***

            if (!token) {
                setError("Not authenticated. Redirecting to login...");
                setTimeout(() => navigate("/login"), 1500);
                setIsLoading(false);
                return;
            }

            try {
                console.log("Dashboard: Fetching user data with token.");
                const response = await axios.get(`${BACKEND_URL}/api/user/me`, {
                    headers: {
                        // *** FIX 2: Use Bearer scheme (adjust if backend differs) ***
                        'Authorization': `Bearer ${token}`
                    }
                });

                console.log("Dashboard: API response /api/user/me:", response.data);

                // *** FIX 3: Check response structure (IMPORTANT!) ***
                // Adjust this based on your ACTUAL backend response for /api/user/me
                const fetchedUserData = response.data.user || response.data; // Common patterns: { user: {...} } or just { ... }

                if (fetchedUserData && typeof fetchedUserData === 'object') {
                    setComponentUser(fetchedUserData);
                    // Initialize form data only with fields present in fetched data
                    setFormData({
                        name: fetchedUserData.name || "",
                        email: fetchedUserData.email || "",
                        phone: fetchedUserData.phone || "",
                        address: fetchedUserData.address || "",
                        gender: fetchedUserData.gender || "",
                        // Add other fields if necessary, ensuring they exist
                    });
                     // Optionally update context if needed (e.g., if context was null)
                    if (setContextUser && (!contextUser || contextUser.id !== fetchedUserData.id)) {
                        setContextUser(fetchedUserData);
                    }
                } else {
                     throw new Error("User data not found in response.");
                }

            } catch (err) {
                console.error("Error fetching user data:", err);
                if (err.response && err.response.status === 401) {
                    setError("Session expired or invalid. Please log in again.");
                    // Clean up on auth error
                    localStorage.removeItem(USER_TOKEN_KEY);
                    localStorage.removeItem(USER_INFO_KEY);
                    if (setContextToken) setContextToken(null);
                    if (setContextUser) setContextUser(null);
                    setTimeout(() => navigate("/login"), 2000);
                } else {
                    setError(err.response?.data?.message || err.message || "Failed to load user details.");
                }
                 setComponentUser(null); // Clear local user state on error
            } finally {
                setIsLoading(false);
            }
        };

        fetchUser();
    // Add dependencies like navigate, setContextUser, setContextToken if needed,
    // though usually fetching once on mount is sufficient.
    }, [navigate, setContextUser, setContextToken]); // Dependency array

    const handleEditClick = () => {
        if (!componentUser) return; // Don't allow edit if user data isn't loaded
        // Ensure form starts with the latest user data when edit begins
        setFormData({
            name: componentUser.name || "",
            email: componentUser.email || "",
            phone: componentUser.phone || "",
            address: componentUser.address || "",
            gender: componentUser.gender || "",
        });
        setIsEditing(true);
        setError(null); // Clear previous errors
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    const handleClick = () => {
        navigate('/history'); // Replace with your actual route
    };

    const handleSave = async () => {
        setError(null); // Clear previous save errors
        const token = localStorage.getItem(USER_TOKEN_KEY); // *** FIX 1: Use correct key ***
        if (!token) {
             setError("Authentication error. Please log in again.");
             return;
        }

        try {
             console.log("Dashboard: Attempting to update user with data:", formData);
            // Assuming your update endpoint expects the full user object (or relevant fields)
            const response = await axios.put(`${BACKEND_URL}/api/user/update`, formData, { // <-- Adjust endpoint if needed
                headers: {
                     // *** FIX 2: Use Bearer scheme ***
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log("Dashboard: Update response:", response.data);

            // *** Adjust based on your update endpoint's response ***
            const updatedUserData = response.data.user || response.data; // Example: get updated user data back

            if (updatedUserData && typeof updatedUserData === 'object') {
                setComponentUser(updatedUserData); // Update local UI state
                if (setContextUser) {
                    setContextUser(updatedUserData); // Update context state
                }
                localStorage.setItem(USER_INFO_KEY, JSON.stringify(updatedUserData)); // Update localStorage user info
                setIsEditing(false); // Exit edit mode
                alert("Profile updated successfully!"); // Provide user feedback
            } else {
                 throw new Error("Update successful, but no user data returned.")
            }


        } catch (err) {
            console.error("Error updating user details:", err);
             // *** FIX 4: Show save error to user ***
             setError(err.response?.data?.message || err.message || "Failed to save profile.");
        }
    };

    // --- FIX 5: Improved Logout ---
    const handleLogout = () => {
        console.log("Logging out...");
        // 1. Clear local storage (using correct keys)
        localStorage.removeItem(USER_TOKEN_KEY);
        localStorage.removeItem(USER_INFO_KEY);

        // 2. Clear context state
        if (setContextToken) setContextToken(null);
        if (setContextUser) setContextUser(null);

        // 3. Navigate to login page
        navigate("/login");

        // Optional: Call backend /api/logout if it performs necessary server-side actions
        // like blacklisting the token. If it needs the token, use axios.
        /*
        const token = localStorage.getItem(USER_TOKEN_KEY); // Get it *before* removing
        if (token) {
             axios.post(`${BACKEND_URL}/api/logout`, {}, { // Send empty body if needed
                 headers: { 'Authorization': `Bearer ${token}` }
             })
             .then(response => console.log("Backend logout successful:", response.data))
             .catch(error => console.error("Backend logout failed:", error)); // Log error, but proceed with frontend logout regardless
        }
        */
    };

   
   
     // Or however you store the token

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
                setWishlist(response.data.wishlist);
                navigate('/wishlist', { state: { wishlist: response.data.wishlist } });
                console.log(response.data.wishlist)
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

    // --- Render Logic ---
    if (isLoading) return <div className="dashboard-container loading"><h2>Loading dashboard...</h2></div>;

    // Display error prominently if loading failed
    if (error && !componentUser) {
         return (
             <div className="dashboard-container error-container">
                <h2>Error Loading Dashboard</h2>
                <p style={{ color: 'red' }}>{error}</p>
                <button onClick={() => window.location.reload()}>Retry</button>
                <button onClick={handleLogout}>Logout</button>
             </div>
         );
    }

    // Should ideally not happen if error handling is correct, but as a fallback
    if (!componentUser) return <div className="dashboard-container"><h2>Could not load user details.</h2></div>;


    // --- Main Render ---
    return (
        <div className="dashboard-container">
            {/* Sidebar Profile */}
            <div className="sidebar">
                <div className="profile-section">
                    <img
                        src={componentUser.avatar || "https://cdn-icons-png.flaticon.com/512/6522/6522516.png"} // Use user avatar if available
                        alt="User Avatar"
                        className="user-avatar"
                    />
                     {/* Only show edit icon if not already editing */}
                     {!isEditing && (
                          <FaEdit className="edit-icon" title="Edit Profile" onClick={handleEditClick} />
                     )}
                </div>

                {/* Profile Information & Edit Form */}
                <div className="profile-info">
                    {isEditing ? (
                        <div className="edit-form">
                             {error && <p style={{ color: 'red', fontWeight: 'bold' }}>Error: {error}</p>} {/* Show save errors */}
                            <label>Name: <input type="text" name="name" value={formData.name} onChange={handleChange} /></label>
                            <label>Email: <input type="email" name="email" value={formData.email} onChange={handleChange} disabled /></label> {/* Usually email is not editable */}
                            <label>Phone: <input type="text" name="phone" placeholder="Add phone number" value={formData.phone} onChange={handleChange} /></label>
                            <label>Address: <input type="text" name="address" placeholder="Add address" value={formData.address} onChange={handleChange} /></label>
                            <label>Gender: <input type="text" name="gender" placeholder="Specify gender" value={formData.gender} onChange={handleChange} /></label>
                             {/* Add other editable fields */}
                            <div className="edit-buttons">
                                <button className="save-btn" onClick={handleSave}>Save Changes</button>
                                <button className="cancel-btn" onClick={() => { setIsEditing(false); setError(null); }}>Cancel</button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <h3>{componentUser.name || 'N/A'}</h3>
                            <p>{componentUser.email || 'N/A'}</p>
                            <p>Phone: {componentUser.phone || 'Not Set'}</p>
                            <p>Address: {componentUser.address || 'Not Set'}</p>
                            <p>Gender: {componentUser.gender || 'Not Set'}</p>
                             {/* Display other non-editable fields */}
                        </>
                    )}
                </div>

                <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </div>

            {/* Main Dashboard Content */}
            <div className="dashboard-content">
                 {/* Use componentUser here as well */}
                <h1>Welcome, {componentUser.name || 'User'}!</h1>
                <p>Manage your travel plans easily from here.</p>

                {/* Static sections - these are fine */}
                <div className="dashboard-sections">
                    {/* ... your sections ... */}
                    <div className="section" onClick={fetchWishlist} style={{ cursor: 'pointer' }}>
                        <h2>Wishlist</h2>
                        <p>Check your favorite destinations and hotels.</p>
                    </div>
                    <div className="section cursor-pointer" onClick={handleClick}>
            <h2>Trip History</h2>
            <p>View your past bookings and travel plans.</p>
        </div>
                    <div className="section">
                        <FaBell className="icon" />
                        <h2>Notifications</h2>
                        <p>Stay updated with the latest offers.</p>
                    </div>
                    <Link to="/SecuritySettings" className="dashboard-link-wrapper"> {/* CHANGE "/dashboard/security" to your actual route */}
    <div className="section security-section"> {/* Added 'security-section' for specific hover styling */}
        <FaUserShield className="icon" />
        <div className="section-text"> {/* Optional: Wrap text for better layout control */}
            <h2>Security Settings</h2>
            <p>Update your password & login preferences.</p>
        </div>
    </div>
</Link>
                    <div className="section">
                        <FaQuestionCircle className="icon" />
                        <h2>Help & Support</h2>
                        <p>Need assistance? Get help here.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;