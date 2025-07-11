import React, { useState } from "react";
import "./TravelOption.css"
import assets from '../assets/assets'
import { Navigate } from "react-router-dom";
const TravelOption = () => {
    const [selectedOption, setSelectedOption] = useState("flight");

    // This function will be triggered when an option is clicked
    const handleOptionClick = (option) => {
        setSelectedOption(option); 
        console.log("Hello world"); // Update the selected option in state
    };

    const handleFlightClick = (path) => {
        Navigate('/flights');
      };
    const tables = {
        flight: (
            <table>
                <thead>
                    <tr>
                        <th><b>From</b></th>
                        <th>To</th>
                        <th>Date</th>
                        <th>Return Date</th>
                        <th>No. of Travelers</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><input type="text" placeholder="Enter Departure City" /></td>
                        <td><input type="text" placeholder="Enter Destination City" /></td>
                        <td><input type="date" /></td>
                        <td><input type="date" /></td>
                        <td>
                        <select id="adults">
                                <option value="1">1 Adult</option>
                                <option value="2">2 Adults</option>
                                <option value="3">3 Adults</option>
                                <option value="4">4 Adults</option>
                                <option value="5">5 Adults</option>
                                <option value="6">6 Adults</option>
                            </select>
                            <select id="children">
                                <option value="0">0 Children</option>
                                <option value="1">1 Child</option>
                                <option value="2">2 Children</option>
                                <option value="3">3 Children</option>
                                <option value="4 ">4 Children</option>
                                <option value="More">More Than 4 Children</option>
                            </select>
                        </td>
                    </tr>
                </tbody>
            </table>
        ),
        train: (
            <table>
                <thead>
                    <tr>
                        <th>From</th>
                        <th>To</th>
                        <th>Date</th>
                        <th>No. of Travelers</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><input type="text" placeholder="Enter Departure City" /></td>
                        <td><input type="text" placeholder="Enter Destination City" /></td>
                        <td><input type="date" /></td>
                        <td>
                        <select id="adults">
                                <option value="1">1 Adult</option>
                                <option value="2">2 Adults</option>
                                <option value="3">3 Adults</option>
                                <option value="4">4 Adults</option>
                                <option value="5">5 Adults</option>
                                <option value="6">6 Adults</option>
                            </select>
                            <select id="children">
                                <option value="0">0 Children</option>
                                <option value="1">1 Child</option>
                                <option value="2">2 Children</option>
                                <option value="3">3 Children</option>
                                <option value="4 ">4 Children</option>
                                <option value="More">More Than 4 Children</option>
                            </select>
                        </td>
                    </tr>
                </tbody>
            </table>
        ),
        bus: (
            <table>
                <thead>
                    <tr>
                        <th>From</th>
                        <th>To</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><input type="text" placeholder="Enter Departure City" /></td>
                        <td><input type="text" placeholder="Enter Destination City" /></td>
                        <td><input type="date" /></td>
                    </tr>
                </tbody>
            </table>
        ),
        cab: (
            <table>
                <thead>
                    <tr>
                        <th>From</th>
                        <th>To</th>
                        <th>Date</th>
                        <th>No. of Travelers</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><input type="text" placeholder="Enter Departure City" /></td>
                        <td><input type="text" placeholder="Enter Destination City" /></td>
                        <td><input type="date" /></td>
                        <td>
                        <select id="adults">
                                <option value="1">1 Adult</option>
                                <option value="2">2 Adults</option>
                                <option value="3">3 Adults</option>
                                <option value="4">4 Adults</option>
                                <option value="5">5 Adults</option>
                                <option value="6">6 Adults</option>
                            </select>
                            <select id="children">
                                <option value="0">0 Children</option>
                                <option value="1">1 Child</option>
                                <option value="2">2 Children</option>
                                <option value="3">3 Children</option>
                                <option value="4 ">4 Children</option>
                                <option value="More">More Than 4 Children</option>
                            </select>
                        </td>
                    </tr>
                </tbody>
            </table>
        ),
        hotels: (
            <table>
                <thead>
                    <tr>
                        <th>City, Property name or Location</th>
                        <th>Check In</th>
                        <th>Check Out</th>
                        <th>Room & Guests</th>
                        <th>Price Per Night</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><input type="text" placeholder="Enter Destination City" /></td>
                        <td><input type="date" /></td>
                        <td><input type="date" /></td>
                        <td>
                            <select id="adults">
                                <option value="1">1 Adult</option>
                                <option value="2">2 Adults</option>
                                <option value="3">3 Adults</option>
                                <option value="4">4 Adults</option>
                                <option value="5">5 Adults</option>
                                <option value="6">6 Adults</option>
                            </select>
                            <select id="children">
                                <option value="0">0 Children</option>
                                <option value="1">1 Child</option>
                                <option value="2">2 Children</option>
                                <option value="3">3 Children</option>
                                <option value="4 ">4 Children</option>
                                <option value="More">More Than 4 Children</option>
                            </select>
                            <select id="Rooms">
                                <option value="1">1 Room</option>
                                <option value="2">2 Rooms</option>
                                <option value="3">3 Rooms</option>
                                <option value="4">4 Rooms</option>
                            </select>
                        </td>
                        <td>
                            <select id="Price">
                                <option value="1">₹0-₹1500</option>
                                <option value="2">₹1500-₹2500</option>
                                <option value="3">₹2500-₹5000</option>
                                <option value="4">₹5000+</option>
                            </select>
                        </td>
                    </tr>
                </tbody>
            </table>
        ),
        homestayVillas: (
            <table>
                <thead>
                    <tr>
                        <th>City, Property name or Location</th>
                        <th>Check In</th>
                        <th>Check Out</th>
                        <th>Room & Guests</th>
                        <th>Price Per Night</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><input type="text" placeholder="Enter Destination City" /></td>
                        <td><input type="date" /></td>
                        <td><input type="date" /></td>
                        <td>
                            <select id="adults">
                                <option value="1">1 Adult</option>
                                <option value="2">2 Adults</option>
                                <option value="3">3 Adults</option>
                                <option value="4">4 Adults</option>
                                <option value="5">5 Adults</option>
                                <option value="6">6 Adults</option>
                            </select>
                            <select id="children">
                                <option value="0">0 Children</option>
                                <option value="1">1 Child</option>
                                <option value="2">2 Children</option>
                                <option value="3">3 Children</option>
                                <option value="4">4 Children</option>
                                <option value="More">More Than 4 Children</option>
                            </select>
                            <select id="Rooms">
                                <option value="1">1 Room</option>
                                <option value="2">2 Rooms</option>
                                <option value="3">3 Rooms</option>
                                <option value="4">4 Rooms</option>
                            </select>
                        </td>
                        <td>
                            <select id="Price">
                                <option value="1">₹0-₹1500</option>
                                <option value="2">₹1500-₹2500</option>
                                <option value="3">₹2500-₹5000</option>
                                <option value="4">₹5000+</option>
                            </select>
                        </td>
                    </tr>
                </tbody>
            </table>
        ),
    };

    return (
      <>
        <section className="travel-options">
            <div className="option" onClick={() => handleFlightClick("/flights")}>
                <div className="icon">
                    <img
                        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcShofOjK8HmsKBFl9fF_1YdPI-iZ_QEV-GNZg&s"
                        alt="Flight"
                    />
                </div>
                <p>Flights</p>
            </div>
            <div className="option" onClick={() => handleOptionClick("train")}>
                <div className="icon">
                    <img
                        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6LgefI98pCIc1lwqLlg_V4lwQXcZz1h676w&s"
                        alt="Train"
                    />
                </div>
                <p>Trains</p>
            </div>
            <div className="option" onClick={() => handleOptionClick("bus")}>
                <div className="icon">
                    <img
                        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQCr4D38CUDCKz9SblBiOF_ATolFvFlCSb3Dg&s"
                        alt="Bus"
                    />
                </div>
                <p>Buses</p>
            </div>
            <div className="option" onClick={() => handleOptionClick("cab")}>
                <div className="icon">
                    <img
                        src={assets.cab_icon}
                        alt="Cab"
                    />
                </div>
                <p>Cabs</p>
            </div>
            <div className="option" onClick={() => handleOptionClick("hotels")}>
                <div className="icon">
                    <img
                        src={assets.hotels_icon}
                        alt="Hotels"
                    />
                </div>
                <p>Hotels</p>
            </div>

          
        </section>
        <div className="table-container">
        <div id="table-content">
                {selectedOption && tables[selectedOption]}
                <div className="radio-buttons">
                    <label><input type="radio" name="fare" value="regular" defaultChecked /> Regular</label>
                    <label><input type="radio" name="fare" value="student" /> Student</label>
                    <label><input type="radio" name="fare" value="senior" /> Senior Citizen</label>
                    <label><input type="radio" name="fare" value="armed" /> Armed Forces</label>
                    <label><input type="radio" name="fare" value="doctor" /> Doctor and Nurses</label>
                </div>
                
            </div>
            <div className="search-container">
                    <button className="search-button">Search</button>
                </div>
            </div>
        </>
    );
};

export default TravelOption;