import axios from "axios";
const apiKey = import.meta.env.VITE_OPENCAGE_API_KEY;

// Function to get latitude and longitude for a given location name
export const getLatLng = async (location) => {
  try {
    const response = await axios.get(
      `https://api.opencagedata.com/geocode/v1/json?q=${location}&key=${apiKey}&language=en`
    );
    const data = response.data;

    // Check if we have results
    if (data.results.length > 0) {
      const lat = data.results[0].geometry.lat;
      const lng = data.results[0].geometry.lng;
      return { lat, lng };
    } else {
      console.error("No results found for this location.");
      return null;
    }
  } catch (error) {
    console.error("Error fetching geolocation data:", error);
    return null;
  }
};
