import React, { useState } from "react";
import axios from "axios";
import "./Registration.css"; // Import the CSS file

function Registration() {
  const [formData, setData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    c_password: "",
    dob: "",
    address: "",
    gender: ""
  });

  const [message, setMessage] = useState(""); // Success or error messages
  const [isSuccess, setIsSuccess] = useState(false); // To differentiate success from error
  const [errors, setErrors] = useState({}); // Store validation errors

  // Validate email format
  const validateEmail = (email) => {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
  };

  // Validate phone number (should be 10 digits and start with Indian valid digits)
  const validatePhone = (phone) => {
    return /^[6-9]\d{9}$/.test(phone);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setData((prevData) => ({ ...prevData, [name]: value }));

    let newErrors = { ...errors };

    // Real-time validation
    if (name === "email" && value && !validateEmail(value)) {
      newErrors.email = "Invalid email format (example: user@gmail.com)";
    } else {
      delete newErrors.email;
    }

    if (name === "phone" && value && !validatePhone(value)) {
      newErrors.phone = "Phone number must be 10 digits and start with 6-9";
    } else {
      delete newErrors.phone;
    }

    if (name === "password" && value.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else {
      delete newErrors.password;
    }

    if (name === "c_password" && value !== formData.password) {
      newErrors.c_password = "Passwords do not match";
    } else {
      delete newErrors.c_password;
    }

    setErrors(newErrors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Final validation before submission
    if (!validateEmail(formData.email)) {
      setErrors((prev) => ({ ...prev, email: "Invalid email format" }));
      return;
    }

    if (!validatePhone(formData.phone)) {
      setErrors((prev) => ({ ...prev, phone: "Phone number must be 10 digits and start with 6-9" }));
      return;
    }

    if (formData.password.length < 8) {
      setErrors((prev) => ({ ...prev, password: "Password must be at least 8 characters" }));
      return;
    }

    if (formData.password !== formData.c_password) {
      setErrors((prev) => ({ ...prev, c_password: "Passwords do not match" }));
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/user/register",
        formData
      );
      setMessage(response.data.message);
      setIsSuccess(true); // Mark success
      setErrors({}); // Clear errors
    } catch (error) {
      setMessage(error.response?.data?.message || "Registration failed.");
      setIsSuccess(false); // Mark error
    }
  };

  return (
    <div className="registration-form">
      <h2>Register</h2>

      {/* Success or Error Message */}
      {message && (
        <p className={isSuccess ? "success-message" : "error-message"}>
          {message}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <input type="text" name="name" placeholder="Full Name" onChange={handleChange} required />
        
        <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
        {errors.email && <p className="error-message">{errors.email}</p>}

        <input
          type="tel"
          name="phone"
          placeholder="Phone Number"
          onChange={handleChange}
          maxLength="10"
          required
        />
        {errors.phone && <p className="error-message">{errors.phone}</p>}

        <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
        {errors.password && <p className="error-message">{errors.password}</p>}

        <input type="password" name="c_password" placeholder="Confirm Password" onChange={handleChange} required />
        {errors.c_password && <p className="error-message">{errors.c_password}</p>}

        <input type="date" name="dob" placeholder="Date of Birth" onChange={handleChange} required />
        <input type="text" name="address" placeholder="Address" onChange={handleChange} required />

        <select name="gender" onChange={handleChange} required>
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>

        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default Registration;
