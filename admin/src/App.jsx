import { Route, Routes } from "react-router-dom";
import Sidebar from "./Navbar/Sidebar";
import { ToastContainer } from 'react-toastify';
import Viewspots from "./ManagePackages/view/Viewspots";
import Add from "./ManagePackages/add/Addspots";
import Navbar from "./Navbar/NavBar";
import SpotDetails from "./SpotDetails/SpotDetails";
import AdminBookingPage from "./HotelBooking/HotelBooking"
import Searchuser from "./Searchuser/Searchuser";

function App() {
   const url = "http://localhost:5000";

  return (
      <>
          <ToastContainer />
          <Navbar />
          <hr />
          <div className="app-content">
              <Sidebar />
              <Routes>
                  <Route path="/add" element={<Add url={url} />} />
                  <Route path="/list" element={<Viewspots url={url} />} />
                  <Route path="/spots/:id" element={<SpotDetails url={url} />} />
                    {/*  ✅ url prop is being passed */}
                    <Route path="/user" element={<Searchuser></Searchuser>}></Route>
                    <Route path="/hotel-booking" element={<AdminBookingPage></AdminBookingPage>}></Route>
              </Routes>
          </div>
      </>
  );
}

export default App;