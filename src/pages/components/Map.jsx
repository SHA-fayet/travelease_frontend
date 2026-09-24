import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { getLatLng } from "../../utils/geoCode";
import { calculateDistance } from "../../utils/distanceCalc";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
const Map = ({ destinationName }) => {
  const [latLng, setLatLng] = useState(null); // destination location
  const [userLocation, setUserLocation] = useState(null); // user location
  const [distance, setDistance] = useState(null); // distance

  // Get destination coordinates
  useEffect(() => {
    const fetchDestinationLatLng = async () => {
      const coordinates = await getLatLng(destinationName);
      setLatLng(coordinates);
    };

    if (destinationName) {
      fetchDestinationLatLng();
    }
  }, [destinationName]);

  // Get user location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log("User position:", position);
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        console.error("Error getting user location:", error);
        alert(`Location error: ${error.message}`);
      }
    );
  }, []);

  // Calculate distance only when both are available
  useEffect(() => {
    if (latLng && userLocation) {
      const dist = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        latLng.lat,
        latLng.lng
      );
      setDistance(dist);
    }
  }, [latLng, userLocation]);

  const customIcon = L.icon({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });
  return (
    <div className="w-full h-[400px]">
      {latLng && userLocation ? (
        <>
          <MapContainer
            center={[latLng.lat, latLng.lng]}
            zoom={10}
            scrollWheelZoom={false}
            className="h-full"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />

            <Marker position={[latLng.lat, latLng.lng]} icon={customIcon}>
              <Popup>
                <b>{destinationName}</b>
              </Popup>
            </Marker>

            <Marker position={[userLocation.lat, userLocation.lng]}>
              <Popup>
                <b>Your Location</b>
              </Popup>
            </Marker>
          </MapContainer>

          <div className="mt-2 text-sm text-gray-700">
            🧭 You are <strong>{distance} km</strong> away from{" "}
            <strong>{destinationName}</strong>
          </div>
        </>
      ) : (
        <p>Loading map and location...</p>
      )}
    </div>
  );
};

export default Map;
