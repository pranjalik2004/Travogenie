import React, { useState } from 'react';
import './Searchuser.css';
import axios from 'axios';

// Utility to format date
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: 'numeric', minute: '2-digit'
        });
    } catch (e) {
        return dateString;
    }
};

function Searchuser() {
    const [searchEmail, setSearchEmail] = useState('');
    const [userData, setUserData] = useState(null);
    const [trips, setTrips] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isTripsOpen, setIsTripsOpen] = useState(false);
    const [isTransactionsOpen, setIsTransactionsOpen] = useState(false);

    const fetchUserDataByEmail = async (email) => {
        try {
            const response = await axios.post('http://localhost:5000/api/user/find', {
                email: email.trim(),
            });
            return response.data.success ? response.data.user : null;
        } catch (error) {
            console.error('API error:', error);
            return null;
        }
    };

    const fetchTripHistoryByUserId = async (userId) => {
        try {
            const res = await axios.get(`http://localhost:5000/api/spot/trip-history/paid/${userId}`);
            return res.data.trips || [];
        } catch (error) {
            console.error('Trip history error:', error);
            return [];
        }
    };

    const fetchTransactionsByUserId = async (userId) => {
        try {
            const res = await axios.get(`http://localhost:5000/api/spot/transactions/${userId}`);
            return res.data.transactions || [];
        } catch (error) {
            console.error('Transaction history error:', error);
            return [];
        }
    };
   
    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchEmail.trim()) {
            setError('Please enter an email address.');
            return;
        }

        setIsLoading(true);
        setError('');
        setUserData(null);
        setTrips([]);
        setTransactions([]);
        setIsTripsOpen(false);
        setIsTransactionsOpen(false);

        try {
            const data = await fetchUserDataByEmail(searchEmail);
            if (data) {
                setUserData(data);
                const fetchedTrips = await fetchTripHistoryByUserId(data._id);
                const fetchedTransactions = await fetchTransactionsByUserId(data._id);
                setTrips(fetchedTrips);
                setTransactions(fetchedTransactions);
            } else {
                setError(`User with email "${searchEmail}" not found.`);
            }
        } catch (err) {
            console.error("Search error:", err);
            setError('An error occurred while searching. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="user-search-page">
            <h1>Search User</h1>

            {isLoading && <div className="loading-indicator">Loading...</div>}
            {error && <div className="error-message">{error}</div>}

            <div className="search-page-layout">
                <div className="content-area">
                    {userData && !isLoading && (
                        <div className="user-data-results">
                            <section className="profile-section">
                                <div className="profile-header">
                                    {userData.profilePhotoUrl ? (
                                        <img src={userData.profilePhotoUrl} alt="Profile" className="profile-photo" />
                                    ) : (
                                        <div className="profile-photo placeholder-photo">
                                            <i className="fas fa-user"></i>
                                        </div>
                                    )}
                                </div>
                                <div className="profile-details">
                                    <div className="detail-item"><span className="detail-label">User ID:</span><span className="detail-value">{userData._id || 'N/A'}</span></div>
                                    <div className="detail-item"><span className="detail-label">Name:</span><span className="detail-value">{userData.name || 'N/A'}</span></div>
                                    <div className="detail-item"><span className="detail-label">Email:</span><span className="detail-value">{userData.email || 'N/A'}</span></div>
                                    <div className="detail-item"><span className="detail-label">Phone:</span><span className="detail-value">{userData.phone || 'N/A'}</span></div>
                                    <div className="detail-item"><span className="detail-label">Address:</span><span className="detail-value">{userData.address || 'N/A'}</span></div>
                                </div>
                            </section>

                            <div className="history-container">
                                <div className="collapsible-section">
                                    <button className="collapsible-header" onClick={() => setIsTripsOpen(!isTripsOpen)} aria-expanded={isTripsOpen}>
                                        Trip History <span className={`collapse-icon ${isTripsOpen ? 'open' : ''}`}>▼</span>
                                    </button>
                                    <div className={`collapsible-content ${isTripsOpen ? 'content-open' : ''}`}>
                                        {trips.length > 0 ? (
                                            <table className="history-table">
                                                <thead>
                                                    <tr>
                                                        <th>Date</th>
                                                        <th>Origin</th>
                                                        <th>Destination</th>
                                                        <th>Status</th>
                                                        <th>Fare</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {trips.map(trip => (
                                                        <tr key={trip._id}>
                                                            <td>{(trip.amount)}</td>
                                                           
                                                            <td>{trip.destination}</td>
                                                            <td>{trip.location}</td>
                                                            <td>{trip.paymentStatus}</td>
                                                            <td>{trip.fare ? `$${trip.fare.toFixed(2)}` : 'N/A'}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        ) : (
                                            <p className="no-data-message">No trip history found.</p>
                                        )}
                                    </div>
                                </div>

                                <div className="collapsible-section">
                                    <button className="collapsible-header" onClick={() => setIsTransactionsOpen(!isTransactionsOpen)} aria-expanded={isTransactionsOpen}>
                                        Transaction History <span className={`collapse-icon ${isTransactionsOpen ? 'open' : ''}`}>▼</span>
                                    </button>
                                    <div className={`collapsible-content ${isTransactionsOpen ? 'content-open' : ''}`}>
                                        {transactions.length > 0 ? (
                                            <table className="history-table">
                                                <thead>
                                                    <tr>
                                                        <th>Date</th>
                                                        <th>Type</th>
                                                        <th>Amount</th>
                                                        <th>Status</th>
                                                        <th>Details</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {transactions.map(txn => (
                                                        <tr key={txn.id || txn._id}>
                                                            <td>{formatDate(txn.createdAt)}</td>
                                                            <td>{txn.type}</td>
                                                            <td>{txn.amount ? `${txn.amount.toFixed(2)}INR` : 'N/A'}</td>
                                                            <td>{txn.status}</td>
                                                            <td>{txn.details}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        ) : (
                                            <p className="no-data-message">No transaction history found.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {!userData && !isLoading && !error && (
                        <div className="initial-placeholder">Enter an email and click Search to view user details.</div>
                    )}
                </div>

                <aside className="search-sidebar">
                    <form className="search-bar-form" onSubmit={handleSearch}>
                        <label htmlFor="user-email-search" className="search-label">Find User by Email</label>
                        <input
                            type="email"
                            id="user-email-search"
                            value={searchEmail}
                            onChange={(e) => setSearchEmail(e.target.value)}
                            placeholder="user@example.com"
                            className="search-input"
                            aria-label="Search user by email"
                            required
                        />
                        <button type="submit" className="search-button" disabled={isLoading}>
                            {isLoading ? 'Searching...' : 'Search'}
                        </button>
                    </form>
                </aside>
            </div>
        </div>
    );
}

export default Searchuser;