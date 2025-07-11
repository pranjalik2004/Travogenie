import { NavLink } from "react-router-dom";
import "./Sidebar.css"; // Make sure this CSS file exists and is styled
import assets from "../assets/assets"; // Assuming this path is correct

const Sidebar = () => {
  return (
    <>
      <div className="sidebar">
        <div className="navbar">
          <img className="logo" src={assets.Logo} alt="Travogenie Admin Logo" />
          <h2>Admin Panel</h2>
        </div>

        <div className="sidebar-options">
          <NavLink
            to="/add"
            className={({ isActive }) =>
              isActive ? "sidebar-option active" : "sidebar-option"
            }
          >
            <img src={assets.add_icon} alt="Add Item Icon" />
            <p>Add Items</p>
          </NavLink>

          <NavLink
            to="/list"
            className={({ isActive }) =>
              isActive ? "sidebar-option active" : "sidebar-option"
            }
          >
            <img src={assets.order_icon} alt="List Item Icon" />
            <p>List Items</p>
          </NavLink>

          <NavLink
            to="/user"
            className={({ isActive }) =>
              isActive ? "sidebar-option active" : "sidebar-option"
            }
          >
            <img src={assets.order_icon} alt="Search User Icon" />
            <p>Search User</p>
          </NavLink>

          {/* ✅ New "Hotel Booking" Option */}
          <NavLink
            to="/hotel-booking"
            className={({ isActive }) =>
              isActive ? "sidebar-option active" : "sidebar-option"
            }
          >
            <img src={assets.order_icon} alt="Hotel Booking Icon" />
            <p>Hotel Booking</p>
          </NavLink>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
