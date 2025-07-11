import React, { useContext } from "react";
import { useSearchParams } from "react-router-dom";
import { StoreCon } from "../context/Store";
import { jwtDecode } from "jwt-decode";

const StripePayment = ({ amount }) => {
  const { token } = useContext(StoreCon); // Get token from context
  const [searchParams] = useSearchParams();
  const tripId = searchParams.get("tripId");

  const handlePayment = async () => {
    try {
      if (!token) {
        alert("❌ User is not authenticated.");
        return;
      }

      const decoded = jwtDecode(token);
      const userId = decoded?.id;

      if (!userId || !tripId) {
        alert("❌ Missing user ID or trip ID");
        return;
      }

      const response = await fetch("http://localhost:5000/api/spot/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ amount, tripId, userId })
      });

      const data = await response.json();

      if (data.sessionUrl) {
        window.location.href = data.sessionUrl;
      } else {
        alert("❌ Failed to create Stripe session");
      }
    } catch (error) {
      console.error("❌ Stripe error:", error);
      alert("Error while starting payment");
    }
  };

  return (
    <div style={{ marginTop: "20px" }}>
      <button
        onClick={handlePayment}
        style={{
          padding: "10px 20px",
          backgroundColor: "#635bff",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          fontSize: "16px"
        }}
      >
        Pay ₹{amount / 100} Now
      </button>
    </div>
  );
};

export default StripePayment;