import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./viewspots.css";
import { useNavigate } from "react-router-dom";

const List = ({ url }) => {
  const [list, setList] = useState([]);
  const navigate = useNavigate();

  // Fetch list of spots
  const fetchList = async () => {
    try {
      const response = await axios.get(`${url}/api/spot/list`);
      if (response.data.success) {
        console.log("Backend Response:", response.data.data); // Debugging Line

        const formattedData = response.data.data.map((item) => ({
          ...item,
          image: item.images && item.images.length > 0
              ? item.images[0].startsWith("http")
                  ? item.images[0]
                  : `${url}/${item.images[0]}`
              : "https://via.placeholder.com/150",
          name: item.location?.name || "No Name", // ✅ Fixed Name Issue
          category: item.category || "No Category",
          location: item.location?.description || "No Location", // ✅ Fixed Location
        }));

        setList(formattedData);
      } else {
        toast.error("Error: Unable to fetch list");
      }
    } catch (error) {
      console.error("API call failed:", error);
      toast.error("Error: API call failed");
    }
  };

  // Remove a spot by ID
  const removeSpot = async (spotId) => {
    try {
      const response = await axios.post(
        `${url}/api/spot/remove`,
        { id: spotId },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        fetchList(); // Refresh the list
      } else {
        toast.error("Error: Unable to remove spot");
      }
    } catch (error) {
      console.error("Error removing spot:", error);
      toast.error("Error: Failed to remove spot");
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <div className="list add flex-col">
      <p>All Spot List</p>
      <div className="list-table">
        <div className="list-table-format title">
          <b>Image</b>
          <b>Name</b>
          <b>Category</b>
          <b>Location</b>
          <b>Explore</b>
          <b>Action</b>
        </div>
        {list.length > 0 ? (
          list.map((item, index) => (
            <div key={index} className="list-table-format">
              <img src={item.image} alt={item.name} />
              <p>{item.name}</p>
              <p>{item.category}</p>
              <p>{item.location}</p>
              <button onClick={() => navigate(`/spots/${item._id}`)}>Explore</button>
              <p onClick={() => removeSpot(item._id)} className="cursor">X</p>
            </div>
          ))
        ) : (
          <p>Loading spots...</p>
        )}
      </div>
    </div>
  );
};

export default List;