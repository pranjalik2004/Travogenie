import axios from "axios";
import { createContext, useEffect, useState, useCallback } from "react"; // Import React if not already (though often implicit)

// --- Constants ---
// Use consistent keys for localStorage
const USER_TOKEN_KEY = 'authToken';
const USER_INFO_KEY = 'userInfo';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"; // Use env var for backend URL

export const StoreCon = createContext(null);

const StoreContextProvider = (props) => {
    // Existing state and constants
    // const url = "http://localhost:5000"; // Replaced by BACKEND_URL constant
    const [spot_list, setSpotList] = useState([]);
    const categories = ["Nature", "Beach", "Heritage", "Trekking", "Picnic", "Adventure", "Pilgrimage", "Honeymoon"];

    // --- NEW: User and Token State Management ---

    // Initialize token from localStorage using the consistent key
    const [token, setToken] = useState(localStorage.getItem(USER_TOKEN_KEY) || null); // Use null or "" as initial based on preference

    // Initialize user state from localStorage using the consistent key
    const [user, setUser] = useState(() => { // Use function form for complex initial state
        const storedUser = localStorage.getItem(USER_INFO_KEY);
        if (storedUser) {
            try {
                // Attempt to parse the stored JSON string
                return JSON.parse(storedUser);
            } catch (e) {
                console.error("StoreContext: Failed to parse stored user info on initial load:", e);
                // If parsing fails, remove the invalid item
                localStorage.removeItem(USER_INFO_KEY);
                return null; // Start with null if parsing failed
            }
        }
        return null; // Start with null if nothing was stored
    });

    // --- Existing Spot List Fetching ---
    // Use useCallback to memoize fetchSpotList
    const fetchSpotList = useCallback(async () => {
        try {
            // Use the BACKEND_URL constant
            const response = await axios.get(`${BACKEND_URL}/api/spot/list1`);

            // Ensure response.data and response.data.data exist before mapping
            if (response.data && Array.isArray(response.data.data)) {
                 // Safely access the data and handle potentially missing images
                const formattedData = response.data.data.map(spot => ({
                    ...spot,
                     // Keep existing logic, ensure 'image' field is accessed correctly
                    image: spot.image || spot.imageUrl || null // Check common variations or use null
                }));
                setSpotList(formattedData);
                console.log("StoreContext: Spot list fetched and formatted:", formattedData);
            } else {
                console.warn("StoreContext: Spot list response format unexpected:", response.data);
                setSpotList([]); // Set to empty array on unexpected format
            }

        } catch (error) {
            console.error("StoreContext: Error fetching spot list:", error);
            // Optionally set spot_list to empty array or handle error state
             setSpotList([]);
        }
    }, []); // Removed url dependency as it's now a constant defined outside

    // --- Effects for Persistence and Initial Load ---

    // Effect to load token on initial mount (already present, just updated key)
    // This effect might be redundant now since useState initializes directly from localStorage,
    // but it doesn't hurt. Could be removed if useState initialization is sufficient.
    useEffect(() => {
        const storedToken = localStorage.getItem(USER_TOKEN_KEY);
        if (storedToken && storedToken !== token) { // Only set if different from initial state
             console.log("StoreContext: Found token in localStorage on mount, updating state.");
             setToken(storedToken);
        }
        // No need for loadData function wrapper
    }, []); // Empty dependency array ensures this runs only once on mount

    // NEW: Effect to update localStorage when token state changes
    useEffect(() => {
        if (token) {
            // Only update localStorage if token has a value
            localStorage.setItem(USER_TOKEN_KEY, token);
             console.log("StoreContext: Token updated in localStorage.");
        } else {
            // If token becomes null/empty, remove it from localStorage
            localStorage.removeItem(USER_TOKEN_KEY);
             console.log("StoreContext: Token removed from localStorage.");
        }
    }, [token]); // Run this effect whenever the token state changes

    // NEW: Effect to update localStorage when user state changes
    useEffect(() => {
        if (user && typeof user === 'object') {
            // Only update localStorage if user is a valid object
            try {
                 localStorage.setItem(USER_INFO_KEY, JSON.stringify(user));
                 console.log("StoreContext: User info updated in localStorage.");
            } catch(e) {
                console.error("StoreContext: Failed to stringify user data for localStorage:", e);
            }

        } else {
            // If user becomes null or invalid, remove it from localStorage
            localStorage.removeItem(USER_INFO_KEY);
             console.log("StoreContext: User info removed from localStorage.");
        }
    }, [user]); // Run this effect whenever the user state changes


    // --- Context Value ---
    // Combine existing and new values
    const contextValue = {
        token,
        setToken,
        user,           // <-- ADDED user state
        setUser,        // <-- ADDED setUser function
        fetchSpotList,  // Kept existing
        spot_list,      // Kept existing
        categories,     // Kept existing
        url: BACKEND_URL // Expose the URL constant if needed by consumers
    };

    return (
        <StoreCon.Provider value={contextValue}>
            {props.children}
        </StoreCon.Provider>
    );
};

export default StoreContextProvider;