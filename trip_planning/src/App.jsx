import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Navbard from "./Navbar/Navbar";
import Hero from "./Hero/Hero";
import TravelOption from "./TravelOption/TravelOption";
import ViewPoint from "./Explore/Explore";
import ExploreSpots from "./Explore-spots/ExploreSpots";
import AboutUs from "./About/Aboutus";
import Download from "./Downolad/Download";
import Footer from "./Footer/Footer";
import Login from "./Usersmodule/Login"
import Registration from "./Usersmodule/Registration";
import UserDashboard from "./Usersmodule/userDashboard";
import DestinationPage from "../Destination/Destination";
import ExploreSpots1 from "./Explore-spots/ExploreSpots";
import Flights from "./TravelOption/FlightBooking";
import GoMapsAutocomplete from "./AutocompletePlace/Autocomplete";
import TravelPreferences from "./PlanTrip/TravelPreferences";
import ConfirmTripPage from "./PlanTrip/ConfirmTripPage";
import axios from "axios";
import WishlistPage from "./Usersmodule/WishlistPage";
import SecuritySettings from "./Usersmodule/SecuritySettings";
import PaymentPage from './PlanTrip/PaymentPage'
import PaymentSuccess from "./PlanTrip/PaymentSuccess";
import TripHistory from "./Usersmodule/TripHistory";

function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [autocompleteResults, setAutocompleteResults] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await axios.get(
          `http://localhost:5000/places?input=${searchQuery}`
        );
        setAutocompleteResults(result.data);
      } catch (error) {
        console.log(error);
      }
    };

    if (searchQuery) {
      fetchData();
    } else {
      setAutocompleteResults([]);
    }
  }, [searchQuery]);

  const handleInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

  return (
    <>
      <Navbard />
      <Routes>
        {/* Home Page */}
        <Route
          path="/"
          element={
            <>
              <Hero />
             
              <ViewPoint />

             

              <AboutUs />
             
              <Footer />
            </>
          }
        />

        {/* Other Routes */}
        <Route path="/tourist-spot/:id" element={<ExploreSpots />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/destinations" element={<DestinationPage />} />
        <Route path="/explore-spots/:category" element={<DestinationPage />} />
        <Route path="/spots/:id" element={<ExploreSpots1 />} />
        <Route path="/flight" element={<Flights />} />
        <Route path="/autocomplete" element={<GoMapsAutocomplete />} />
        <Route path="/preferences/:id" element={<TravelPreferences />} />
        <Route path="/confirm-trip" element={<ConfirmTripPage />} />
        <Route path="/wishlist" element={<WishlistPage></WishlistPage>}></Route>
        <Route path="/SecuritySettings" element={<SecuritySettings></SecuritySettings>}></Route>
        <Route path="/payment" element={<PaymentPage></PaymentPage>} />
        <Route path="/verify" element={<PaymentSuccess></PaymentSuccess>} />
        <Route path="/history" element={<TripHistory></TripHistory>}></Route>
        
      </Routes>
    </>
  );
}

export default App;