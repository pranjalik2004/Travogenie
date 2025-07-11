// Frontend (SpotDetails.js)

import { useParams } from "react-router-dom";
import "./SpotDetails.css";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const SpotDetails = ({ url }) => {
  const { id } = useParams();
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    locationName: "",
    locationDescription: "",
    locationImageUrl: "",
    category: "",
    best_season: "",
    packages: [],
    hotels: [],
    nearby_attractions: [],
    //images: [], // Remove images array; the image URLs are inside hotels and attractions now
  });
  const [selectedImages, setSelectedImages] = useState([]);

  useEffect(() => {
    if (id) {
      const fetchSpotDetails = async () => {
        try {
          const response = await axios.get(
            `${url}/api/spot/spot/?_id=${id}`,
            {
              headers: { "Content-Type": "application/json" },
            }
          );

          if (response.data.success) {
            const spotData = response.data.data;
            console.log(spotData);

            setFormData({
              name: spotData.name || "",
              locationName: spotData.location?.name || "",
              locationDescription: spotData.location?.description || "",
              locationImageUrl: spotData.location?.image_url || "",
              category: spotData.category || "",
              best_season: spotData.best_season || "",
              packages: spotData.packages || [],
              hotels: spotData.hotels || [],
              nearby_attractions: spotData.nearby_attractions || [],
            });
          } else {
            setError("Spot not found");
          }
        } catch (error) {
          console.error("Error fetching spot details:", error);
          setError("Failed to fetch spot details.");
          toast.error("Error: Could not fetch spot details.");
        }
      };
      fetchSpotDetails();
    }
  }, [id, url]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleHotelsChange = (index, field, value) => {
    setFormData((prevData) => {
      const updatedHotels = [...prevData.hotels];
      updatedHotels[index] = { ...updatedHotels[index], [field]: value };
      return { ...prevData, hotels: updatedHotels };
    });
  };

  const handleAttractionsChange = (index, field, value) => {
    setFormData((prevData) => {
      const updatedAttractions = [...prevData.nearby_attractions];
      updatedAttractions[index] = {
        ...updatedAttractions[index],
        [field]: value,
      };
      return { ...prevData, nearby_attractions: updatedAttractions };
    });
  };

  const handlePackageChange = (index, field, value) => {
    setFormData((prevData) => {
      const updatedPackages = [...prevData.packages];
      updatedPackages[index] = { ...updatedPackages[index], [field]: value };
      return { ...prevData, packages: updatedPackages };
    });
  };

  const addHotel = () => {
    setFormData((prevData) => ({
      ...prevData,
      hotels: [
        ...prevData.hotels,
        {
          name: "",
          description: "",
          address: "",
          price_range: "",
          image_url: "",
          ratings: null,
          geo_coordinates: { latitude: null, longitude: null },
          amenities: [],
        },
      ],
    }));
  };

  const addAttraction = () => {
    setFormData((prevData) => ({
      ...prevData,
      nearby_attractions: [
        ...prevData.nearby_attractions,
        {
          name: "",
          details: "",
          image_url: "",
          geo_coordinates: { latitude: "", longitude: "" },
          ticket_pricing: "",
          activities: [],
        },
      ], //Added fields as you provided
    }));
  };

  const addPackage = () => {
    setFormData((prevData) => ({
      ...prevData,
      packages: [...prevData.packages, { name: "", price: "" }],
    }));
  };

  const handleAttractionActivityChange = (
    attractionIndex,
    activityIndex,
    value
  ) => {
    setFormData((prevData) => {
      const updatedAttractions = [...prevData.nearby_attractions];
      const updatedActivities = [
        ...updatedAttractions[attractionIndex].activities,
      ]; // Copy the array

      updatedActivities[activityIndex] = value;

      updatedAttractions[attractionIndex] = {
        ...updatedAttractions[attractionIndex],
        activities: updatedActivities,
      };
      return { ...prevData, nearby_attractions: updatedAttractions };
    });
  };
  const handleAttractionChange = (attractionIndex, field, value) => {
    setFormData((prevData) => {
      const updatedAttractions = [...prevData.nearby_attractions];
      updatedAttractions[attractionIndex] = {
        ...updatedAttractions[attractionIndex],
        [field]: value,
      };
      return { ...prevData, nearby_attractions: updatedAttractions };
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      toast.warning("You can upload a maximum of 5 images.");
      return;
    }
    setSelectedImages(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formDataToSend = new FormData();

      // Append data directly from formData
      formDataToSend.append("name", formData.name);
      formDataToSend.append("locationName", formData.locationName);
      formDataToSend.append("locationDescription", formData.locationDescription);
      formDataToSend.append("locationImageUrl", formData.locationImageUrl);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("best_season", formData.best_season);

      // Stringify and append complex data
      formDataToSend.append("packages", JSON.stringify(formData.packages));
      formDataToSend.append("hotels", JSON.stringify(formData.hotels));
      formDataToSend.append(
        "nearby_attractions",
        JSON.stringify(formData.nearby_attractions)
      );

      // Append images
      selectedImages.forEach((image) => {
        formDataToSend.append("images", image);
      });

      const response = await axios({
        method: "POST", // Always POST for image uploads
        url: `${url}/api/spot/spots`,
        data: formDataToSend,
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        toast.success("Spot added successfully!");
        resetForm();
      }
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
      toast.error(
        `Failed to add spot: ${error.response?.data?.error || error.message}`
      );
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      locationName: "",
      locationDescription: "",
      locationImageUrl: "",
      category: "",
      best_season: "",
      packages: [],
      hotels: [],
      nearby_attractions: [],
    });
    setSelectedImages([]);
  };

  const handleHotelChange = (index, field, value) => {
    setFormData((prevData) => {
      const updatedHotels = [...prevData.hotels];
      updatedHotels[index] = { ...updatedHotels[index], [field]: value };
      return { ...prevData, hotels: updatedHotels };
    });
  };

  const handleAttractionChangeWithinForm = (index, field, value) => {
    setFormData((prevData) => {
      const updatedAttractions = [...prevData.nearby_attractions];
      updatedAttractions[index] = {
        ...updatedAttractions[index],
        [field]: value,
      };
      return { ...prevData, nearby_attractions: updatedAttractions };
    });
  };

  return (
    <div className="container">
      <h2 className="title">Tourist Spot Details</h2>
      {error && <p className="error-message">{error}</p>}
      <form className="spot-details-form" onSubmit={(e) => handleSubmit(e)}>
        {/* Main Name */}
        <div className="form-group">
          <label htmlFor="name">Spot Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="form-control"
            placeholder="Spot Name"
          />
        </div>
        {/* Location Details */}
        <div className="form-group">
          <label htmlFor="locationName">Location Name</label>
          <input
            type="text"
            id="locationName"
            name="locationName"
            value={formData.locationName}
            onChange={handleChange}
            className="form-control"
            placeholder="Location Name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="locationDescription">Location Description</label>
          <textarea
            id="locationDescription"
            name="locationDescription"
            value={formData.locationDescription}
            onChange={handleChange}
            className="form-control"
            placeholder="Location Description"
          />
        </div>
        {/* Location Image URL */}
        <div className="form-group">
          <label htmlFor="locationImageUrl">Location Image URL</label>
          <input
            type="text"
            id="locationImageUrl"
            name="locationImageUrl"
            value={formData.locationImageUrl}
            onChange={handleChange}
            className="form-control"
            placeholder="Location Image URL"
          />
          {formData.locationImageUrl && (
            <img
              src={formData.locationImageUrl}
              alt="Location Preview"
              style={{ maxWidth: "100px", marginTop: "10px" }}
            />
          )}
        </div>

        {/* Category */}
        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="form-control"
          >
            <option value="">Select Category</option>
            <option value="Natural">Natural</option>
            <option value="Beach">Beach</option>
            <option value="Heritage">Heritage</option>
            <option value="Trekking">Trekking</option>
            <option value="Picnic">Picnic</option>
            <option value="Honeymoon">Honeymoon</option>
            <option value="Pilgrimage">Pilgrimage</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="best_season">Best Season</label>
          <input
            type="text"
            id="best_season"
            name="best_season"
            value={formData.best_season}
            onChange={handleChange}
            className="form-control"
            placeholder="Best Season"
          />
        </div>

        {/* Packages Section */}
        <div className="form-group">
          <label>Packages</label>
          {formData.packages.map((pkg, index) => (
            <div key={index} className="package-item">
              <input
                type="text"
                name="packageName"
                value={pkg.name}
                onChange={(e) =>
                  handlePackageChange(index, "name", e.target.value)
                }
                className="form-control"
                placeholder="Package Name"
              />
              <input
                type="text"
                name="packagePrice"
                value={pkg.price}
                onChange={(e) =>
                  handlePackageChange(index, "price", e.target.value)
                }
                className="form-control"
                placeholder="Package Price"
              />
            </div>
          ))}
          <button type="button" onClick={addPackage} className="add-button">
            Add Package
          </button>
        </div>
        {/* Hotels Section */}
        <div className="form-group">
          <label>Hotels</label>
          {formData.hotels.map((hotel, index) => (
            <div key={index} className="hotel-item">
              <label>Hotel {index + 1}</label>
              <input
                type="text"
                name="name"
                value={hotel.name || ""}
                onChange={(e) =>
                  handleHotelChange(index, "name", e.target.value)
                }
                className="form-control"
                placeholder="Hotel Name"
              />
              <input
                type="text"
                name="address"
                value={hotel.address || ""}
                onChange={(e) =>
                  handleHotelChange(index, "address", e.target.value)
                }
                className="form-control"
                placeholder="Hotel Address"
              />
              <input
                type="text"
                name="price_range"
                value={hotel.price_range || ""}
                onChange={(e) =>
                  handleHotelChange(index, "price_range", e.target.value)
                }
                className="form-control"
                placeholder="Price Range"
              />
              <textarea
                name="description"
                value={hotel.description || ""}
                onChange={(e) =>
                  handleHotelChange(index, "description", e.target.value)
                }
                className="form-control"
                placeholder="Hotel Description"
              />
              <input
                type="text"
                name="image_url"
                value={hotel.image_url || ""}
                onChange={(e) =>
                  handleHotelChange(index, "image_url", e.target.value)
                }
                className="form-control"
                placeholder="Image URL"
              />
              {hotel.image_url && (
                <img
                  src={hotel.image_url}
                  alt="Hotel Preview"
                  style={{ maxWidth: "100px", marginTop: "10px" }}
                />
              )}
              <input
                type="number"
                name="ratings"
                value={hotel.ratings || ""}
                onChange={(e) =>
                  handleHotelChange(index, "ratings", e.target.value)
                }
                className="form-control"
                placeholder="Ratings"
              />
              <input
                type="number"
                name="geo_coordinates.latitude"
                value={hotel.geo_coordinates?.latitude || ""}
                onChange={(e) =>
                  handleHotelChange(
                    index,
                    "geo_coordinates.latitude",
                    e.target.value
                  )
                }
                className="form-control"
                placeholder="latitude"
              />
              <input
                type="number"
                name="geo_coordinates.longitude"
                value={hotel.geo_coordinates?.longitude || ""}
                onChange={(e) =>
                  handleHotelChange(
                    index,
                    "geo_coordinates.longitude",
                    e.target.value
                  )
                }
                className="form-control"
                placeholder="longitude"
              />
              {/* Amenities -- Assuming amenities is an array */}
              <div>Amenities:</div>
              {hotel.amenities &&
                hotel.amenities.map((amenity, amenityIndex) => (
                  <input
                    key={amenityIndex}
                    type="text"
                    name={`amenity-${amenityIndex}`}
                    value={amenity}
                    onChange={(e) => {
                      const updatedAmenities = [...hotel.amenities];
                      updatedAmenities[amenityIndex] = e.target.value;
                      setFormData((prevData) => {
                        const updatedHotels = [...prevData.hotels];
                        updatedHotels[index] = {
                          ...updatedHotels[index],
                          amenities: updatedAmenities,
                        };
                        return { ...prevData, hotels: updatedHotels };
                      });
                    }}
                    className="form-control"
                    placeholder={`Amenity ${amenityIndex + 1}`}
                  />
                ))}
            </div>
          ))}
          <button type="button" onClick={addHotel} className="add-button">
            Add Hotel
          </button>
        </div>
        {/* Nearby Attractions Section */}
        <div className="form-group">
          <label>Nearby Attractions</label>
          {formData.nearby_attractions.map((attraction, index) => (
            <div key={index} className="attraction-item">
              <label>Attraction {index + 1}</label>
              <input
                type="text"
                name="name"
                value={attraction.name || ""}
                onChange={(e) =>
                  handleAttractionChangeWithinForm(
                    index,
                    "name",
                    e.target.value
                  )
                }
                className="form-control"
                placeholder="Attraction Name"
              />
              <textarea
                name="details"
                value={attraction.details || ""}
                onChange={(e) =>
                  handleAttractionChangeWithinForm(
                    index,
                    "details",
                    e.target.value
                  )
                }
                className="form-control"
                placeholder="Attraction Details"
              />
              <input
                type="text"
                name="image_url"
                value={attraction.image_url || ""}
                onChange={(e) =>
                  handleAttractionChangeWithinForm(
                    index,
                    "image_url",
                    e.target.value
                  )
                }
                className="form-control"
                placeholder="Image URL"
              />
              {attraction.image_url && (
                <img
                  src={attraction.image_url}
                  alt="Attraction Preview"
                  style={{ maxWidth: "100px", marginTop: "10px" }}
                />
              )}
              <input
                type="text"
                name="ticket_pricing"
                value={attraction.ticket_pricing || ""}
                onChange={(e) =>
                  handleAttractionChangeWithinForm(
                    index,
                    "ticket_pricing",
                    e.target.value
                  )
                }
                className="form-control"
                placeholder="Ticket Pricing"
              />
              {/* Activities */}
              <label>Activities</label>
              {attraction.activities?.map((activity, activityIndex) => (
                <input
                  key={activityIndex}
                  type="text"
                  name={`activity-${activityIndex}`}
                  value={activity || ""}
                  onChange={(e) =>
                    handleAttractionActivityChange(
                      index,
                      activityIndex,
                      e.target.value
                    )
                  }
                  className="form-control"
                  placeholder={`Activity ${activityIndex + 1}`}
                />
              ))}
              <button
                type="button"
                onClick={() => {
                  setFormData((prevData) => {
                    const updatedAttractions = [
                      ...prevData.nearby_attractions,
                    ];
                    updatedAttractions[index].activities = [
                      ...(updatedAttractions[index].activities || []),
                      "",
                    ]; //Ensure activities array exists
                    return {
                      ...prevData,
                      nearby_attractions: updatedAttractions,
                    };
                  });
                }}
                className="add-button"
              >
                Add Activity
              </button>
            </div>
          ))}
          <button type="button" onClick={addAttraction} className="add-button">
            Add Attraction
          </button>
        </div>
        {/* Upload New Images -- Removed.  No longer needed*/}
        {/* Submit Buttons */}
        <div className="button-group">
          <button type="submit" className="btn btn-primary">
            Add Spot
          </button>
        </div>
      </form>
    </div>
  );
};

export default SpotDetails;
