const spotModel =require('../model/spotModel.js')

const Destination =require('../model/AddSpot.js')
const fs=require('fs')
const mongoose =require('mongoose')

const Trip = require('../model/AddSpot.js')
const SpotTrip = require('../model/touristSpotModel.js')
const TripiternaryModel = require('../model/TripiternaryModel.js')
const addSpot=async (req,res)=>{

    try{
        const image_filname= req.file? req.file.filename:null;

        if(image_filname){
            const spot= new spotModel({
                name:req.body.name,
                location:req.body.location,
                description:req.body.description,
                category:req.body.category,
                image:image_filname,


            })
            await spot.save();
            res.json({success:true, message:"spot added succfylly"})
        }
        else{
            res.json({success:false, messagwe:"No file upload  "})
        }
    }
    catch(error) {

        console.log("error adding spot ",error)

    }

}
//for frontend
const spotList1 = async (req, res) => {
    try {
        console.log("Reached");
        const category = req.query.category; // Extract the category from the query parameters
        let query = {};

        if (category && category !== 'All') {
            query.category = category; // Add the category filter if it's not 'All'
        }

        const spots = await SpotTrip.find(query).lean();

        if (!spots.length) {
            console.log("No Spots to load with parameters", category, query);
            return res.status(404).json(`{ success: false, message: "No spots found" }`);
        }

        const formattedSpots = spots.map(spot => {
            let imageUrl = spot.image;
            if (spot.image && !spot.image.startsWith("http")) {
                imageUrl = `${req.protocol}://${req.get("host")}/uploads/${spot.image}`;
            }

            return {
                ...spot,
                image: imageUrl
            };
        });

        console.log("Formatted data", formattedSpots);
        res.status(200).json({ success: true, data: formattedSpots });
    } catch (error) {
        console.error("Error fetching spots:", error);
        res.status(500).json({ success: false, message: "Server error while fetching spots" });
    }
};



//for admin
const spotList = async (req, res) => {
    try {
      console.log("Reached")
        const category = req.query.category; // Extract the category from the query parameters
        let query = {};

        if (category && category !== 'All') {
            query.category = category; // Add the category filter if it's not 'All'
        }

        const spots = await Trip.find(query).lean();

        if (!spots.length) {
            console.log("No Spots to load with parameters", category, query)
            return res.status(404).json({ success: false, message: "No spots found" });
        }

        const formattedSpots = spots.map(spot => ({
    ...spot,
    image: spot.images && spot.images.length > 0
        ? `http://localhost:5000/${spot.images[0].trim()}`
        : null,
}));
console.log("Formatted data", formattedSpots)
        res.status(200).json({ success: true, data: formattedSpots });
    } catch (error) {
        console.error("Error fetching spots:", error);
        res.status(500).json({ success: false, message: "Server error while fetching spots" });
    }
};

const getTouristSpotById = async (req, res) => {
    try {
        const { id } = req.params;

        const spot = await SpotTrip.findById(id);
        if (!spot) {
            return res.status(404).json({ success: false, message: "Tourist spot not found" });
        }

        const spotObj = spot.toObject(); // Convert to plain object
        let imageUrl = spotObj.image;

        // Handle local image
        if (imageUrl && !imageUrl.startsWith("http")) {
            imageUrl = `${req.protocol}://${req.get("host")}/uploads/${imageUrl}`;
        }

        // Handle Google photo reference
        if (imageUrl && imageUrl.length > 50 && !imageUrl.includes("/uploads/")) {
            const apiKey = process.env.GOOGLE_MAPS_API_KEY; // Use env variable
            imageUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${spotObj.image}&key=${apiKey}`;
        }

        spotObj.image = imageUrl;

        res.status(200).json({ success: true, data: spotObj });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};



const explore = async (req, res) => {
    try {
        const { _id } = req.query; // Extracting ID from query parameters

        if (!_id) {
            return res.status(400).json({ success: false, message: "Spot ID is required" });
        }

        // Validate ID format
        if (!mongoose.Types.ObjectId.isValid(_id)) {
            return res.status(400).json({ success: false, message: "Invalid Spot ID format" });
        }

        // Find the spot by ID
        const spot = await Trip.findById(_id);

        if (!spot) {
            return res.status(404).json({ success: false, message: "Spot not found" });
        }

        // Construct the image URL
        let imageUrl = spot.image;
        if (spot.image && !spot.image.startsWith("http")) {
            imageUrl = `${req.protocol}://${req.get("host")}/uploads/${spot.image}`;
        }

        // Return the found spot with the correct image URL
        return res.json({
            success: true,
            data: {
                ...spot.toObject(),
                image: imageUrl, // Updated image URL
            }
        });
    } catch (error) {
        console.error("Error in explore function:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// Backend (addTouristSpot function)
const addTouristSpot = async (req, res) => {
    try {
      // Log the entire request body for inspection
      console.log("req.body:", req.body);


      const {
        name,
        locationName,
        locationDescription,
        locationImageUrl,
        category,
        best_season,
      } = req.body;

      let parsedPackages;
      let parsedHotels;
      let parsedNearbyAttractions;

      try {
        parsedPackages = req.body.packages ? JSON.parse(req.body.packages) : [];
        parsedHotels = req.body.hotels ? JSON.parse(req.body.hotels) : [];
        parsedNearbyAttractions = req.body.nearby_attractions ? JSON.parse(req.body.nearby_attractions) : [];
      } catch (error) {
        console.error("Error parsing JSON data:", error);
        return res.status(400).json({
          success: false,
          message: "Invalid JSON format in packages, hotels, or nearbyAttractions",
        });
      }

      // Handle multiple image uploads (paths)


      // Validate required fields (moved to simplify and ensure all are checked)
      if (!name || !locationName || !locationDescription || !category || !best_season || !locationImageUrl) {
        console.log("Missing required fields"); // Log if this condition is met
        return res.status(400).json({ success: false, message: "Missing required fields" });
      }

      // Construct the new spot object, including the location details
      const newSpot = new SpotTrip({
        name: name,
        location: {
          name: locationName,
          description: locationDescription,
          image_url: locationImageUrl,
        },
        category: category,
        best_season: best_season,
        packages: parsedPackages,
        hotels: parsedHotels,
        nearby_attractions: parsedNearbyAttractions

      });

      await newSpot.save();
      console.log("Spot saved successfully:", newSpot); // Log successful save
      res.status(201).json({
        success: true,
        message: "Tourist spot added successfully",
        spot: newSpot,
      });
    } catch (error) {
      console.error("Error adding tourist spot:", error);
      res.status(500).json({
        success: false,
        message: "Error adding tourist spot",
        error: error.message,
      });
    }
  };

const removeSpot = async (req, res) => {
    try {
        console.log("req.body:", req.body); // ADD THIS LINE

        const { id } = req.body; // Ensure req.body is parsed correctly

        if (!id) {
            return res.status(400).json({ success: false, message: "Spot ID is required" });
        }

         if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid ID format' });
        }


        const spot = await Trip.findById(id);

        if (!spot) {
            return res.status(404).json({ success: false, message: "Spot not found" });
        }

        // Remove associated image files
        if (spot.images && Array.isArray(spot.images)) {
            for (const imagePath of spot.images) {
                // Check if it's a local file
                if (imagePath && !imagePath.startsWith("http")) {
                    const filePath = `uploads/${imagePath}`; // Adjust based on your actual path
       
                    if (fs.existsSync(filePath)) {
                        try {
                            await fs.promises.unlink(filePath);
                            console.log(`Deleted file: ${filePath}`);
                        } catch (unlinkError) {
                            console.error(`Error deleting file ${filePath}:, unlinkError`);
                        }
                    } else {
                        console.warn(`File not found: ${filePath}`);
                    }
                }
            }
        }

        // Delete spot from database
        await Trip.findByIdAndDelete(id);

        res.json({ success: true, message: "Spot removed successfully" });

    } catch (error) {
        console.error("Error removing spot:", error);
        res.status(500).json({ success: false, message: "Server error while removing spot", error: error.message });
    }
};


const saveLocation = async (req, res) => {
    try {
        const destination = new Destination(req.body);
        await destination.save();
        res.status(201).json({ message: "Destination saved successfully", data: destination });
    } catch (error) {
        console.error("Error saving destination:", error);
        res.status(500).json({ error: error.message });  // Send error message in response
    }

  };

 

// Save AI-generated trip data
const saveiternary = async (req, res) => {
  try {
    const tripData1 = req.body;

    const savedTrip = await TripiternaryModel.create(tripData1);
    res.status(201).json({ message: "Trip saved successfully", data: savedTrip });
  } catch (error) {
    console.error("❌ Error saving trip:", error.message);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};



 
// Add this route in your Express app
module.exports=
{addSpot,
    spotList,
    removeSpot,
    spotList1,
    explore,
    addTouristSpot,
    getTouristSpotById,
    saveiternary,
    saveLocation,
 
   

}