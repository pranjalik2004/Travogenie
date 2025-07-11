


import React, { useContext, useState } from 'react';
import axios from 'axios'; // Or use the fetch API
import './SecuritySettings.css'; // Create this CSS file for styling
import { StoreCon } from '../context/Store';

const SecuritySettings = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    // Message state can hold { text: '...', type: 'success' | 'error' }
    const [message, setMessage] = useState(null);
    const {token}=useContext(StoreCon)

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);

        // --- Client-side validation ---
        if (!currentPassword || !newPassword || !confirmPassword) {
            setMessage({ text: 'Please fill in all password fields.', type: 'error' });
            return;
        }
        if (newPassword !== confirmPassword) {
            setMessage({ text: 'New password and confirmation do not match.', type: 'error' });
            return;
        }
        if (newPassword.length < 8) {
            setMessage({ text: 'New password must be at least 8 characters long.', type: 'error' });
            return;
        }
        if (newPassword === currentPassword) {
            setMessage({ text: 'New password cannot be the same as the current password.', type: 'error' });
            return;
        }

        // --- API Call ---
        setIsLoading(true);
        try {
            const apiUrl = 'http://localhost:5000/api/user/change-password'; // ✅ Update if needed
            const token1 = token // ✅ Adjust if stored elsewhere
            const headers = {
                Authorization: `Bearer ${token1}`,
                'Content-Type': 'application/json'
            };

            const response = await axios.put(apiUrl, {
                currentPassword,
                newPassword
            }, { headers });

            setMessage({ text: response.data.message || 'Password updated successfully!', type: 'success' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            console.error("Password update error:", error);
            const errorMessage = error.response?.data?.message || 'Failed to update password. Please check your current password and try again.';
            setMessage({ text: errorMessage, type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <div className="security-settings-section">
            <h2>Security Settings</h2>
            <div className="password-change-form card"> {/* Optional: Wrap in a card style */}
                <h3>Change Your Password</h3>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="currentPassword">Current Password</label>
                        <input
                            type="password"
                            id="currentPassword"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="newPassword">New Password</label>
                        <input
                            type="password"
                            id="newPassword"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            minLength="8" // Basic HTML5 validation
                            disabled={isLoading}
                        />
                         {/* Optional: Add password strength indicator here */}
                    </div>
                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm New Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            minLength="8"
                            disabled={isLoading}
                        />
                    </div>

                    {message && (
                        <div className={`message ${message.type}`}>
                            {message.text}
                        </div>
                    )}

                    <button type="submit" className="submit-btn" disabled={isLoading}>
                        {isLoading ? 'Updating...' : 'Update Password'}
                    </button>
                </form>
            </div>

            {/* Placeholder for other security features */}
            {/* <div className="two-factor-section card">
                 <h3>Two-Factor Authentication (2FA)</h3>
                 <p>Status: Disabled</p>
                 <button disabled>Enable 2FA</button>
            </div> */}
             {/* <div className="active-sessions-section card">
                 <h3>Active Sessions</h3>
                 <p>You are logged in on 1 device.</p>
                 <button disabled>Manage Sessions</button>
            </div> */}
        </div>
    );
};

export default SecuritySettings