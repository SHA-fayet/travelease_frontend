import React from "react";
const googleMapsKey = import.meta.env.VITE_APP_GOOGLE_MAPS_KEY;
const MapModal = ({ location, onClose }) => {
  const mapSrc = `https://www.google.com/maps/embed/v1/place?key=${googleMapsKey}&q=${encodeURIComponent(
    location
  )}`;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white w-[90%] md:w-[600px] rounded-lg overflow-hidden shadow-xl">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">Map for {location}</h2>
          <button onClick={onClose} className="text-red-500 text-xl font-bold">
            &times;
          </button>
        </div>
        <iframe
          title="Google Map"
          width="100%"
          height="400"
          frameBorder="0"
          src={mapSrc}
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );
};

export default MapModal;
