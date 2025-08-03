import React, { useContext, useState, useEffect } from 'react';
import { AdvancedMarker, APIProvider, Map, Marker } from '@vis.gl/react-google-maps';
import GPSWebSocketContext from './GPSWebSocketContext';

const API_Key = 'AIzaSyCYBmTARagWHZnlzn4wcSgYzMkC4nmW1e4';

function GPSMap() {
  // Fix: Destructure the context properly
  const { location, error, isConnected } = useContext(GPSWebSocketContext);
  
  const [mlat, setMlat] = useState('');
  const [mlng, setMlng] = useState('');
  const [manualMarkers, setManualMarkers] = useState([]); // Array of manual markers
  const [roverLocation, setRoverLocation] = useState({ lat: 40, lng: -80 });
  const [followMode, setFollowMode] = useState(true); // Add follow mode toggle
  const [mapKey, setMapKey] = useState(0); // Key to force map re-render

  useEffect(() => {
    console.log('Location updated:', location); // Debug log
    
    if (location && location.latitude !== null && location.longitude !== null) {
      const newLocation = { lat: location.latitude, lng: location.longitude };
      setRoverLocation(newLocation);
      // Don't force re-render on every GPS update - just update the rover location
    }
  }, [location]);

  const handleLatChange = (event) => setMlat(event.target.value);
  const handleLngChange = (event) => setMlng(event.target.value);

  const handleLocationChange = () => {
    const lat = parseFloat(mlat);
    const lng = parseFloat(mlng);
    
    if (!isNaN(lat) && !isNaN(lng)) {
      const newMarker = { 
        id: Date.now(), // Simple unique ID
        lat, 
        lng,
        title: `Marker ${manualMarkers.length + 1}`
      };
      setManualMarkers(prev => [...prev, newMarker]);
      setMlat(''); // Clear inputs
      setMlng('');
    }
  };

  const removeAllMarkers = () => {
    setManualMarkers([]);
  };

  const centerOnRover = () => {
    setFollowMode(true);
    setMapKey(prev => prev + 1);
  };

  const mapCenter = followMode ? roverLocation : { lat: 40, lng: -80 };

  return (
    <div className="w-full">
      <div className="relative bg-slate-200 border-4 border-solid border-purple-700 w-full h-[600px] rounded-lg overflow-hidden">
        <APIProvider apiKey={API_Key}>
          <div style={{ height: '100%', width: '100%' }}>
            <Map 
              key={followMode ? undefined : mapKey}
              center={followMode ? roverLocation : undefined}
              defaultCenter={mapCenter}
              defaultZoom={14}
            >
              {roverLocation.lat !== null && roverLocation.lng !== null && (
                <Marker 
                  position={roverLocation}
                  title="GPS Rover Location"
                />
              )}

              {manualMarkers.map((marker) => (
                <Marker 
                  key={marker.id}
                  position={{ lat: marker.lat, lng: marker.lng }}
                  title={marker.title}
                />
              ))}
            </Map>
          </div>
        </APIProvider>

        <div className="absolute top-2 right-2 bg-white p-2 rounded shadow z-10">
          <div className={`text-sm ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
            {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
          </div>
          {location && (
            <div className="text-xs text-gray-600">
              Lat: {location.latitude?.toFixed(6)}<br/>
              Lng: {location.longitude?.toFixed(6)}
            </div>
          )}
        </div>

        <div className="absolute top-2 left-2 bg-white p-2 rounded shadow z-10">
          <div className="flex gap-2">
            <button
              onClick={() => setFollowMode(!followMode)}
              className={`text-sm px-3 py-1 rounded ${
                followMode 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {followMode ? 'Following' : 'Free Pan'}
            </button>
            <button
              onClick={removeAllMarkers}
              className="text-sm px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600"
              disabled={manualMarkers.length === 0}
            >
              Clear Markers ({manualMarkers.length})
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-4 items-center">
        <input
          className="p-2 rounded-md border-purple-700 border-solid border-2 shadow-md"
          type="number"
          step="any"
          value={mlat}
          onChange={handleLatChange}
          placeholder="Input Latitude"
        />
        
        <input
          className="p-2 rounded-md border-purple-700 border-solid border-2 shadow-md"
          type="number"
          step="any"
          value={mlng}
          onChange={handleLngChange}
          placeholder="Input Longitude"
        />

        <button
          className="rounded-md text-purple-700 font-medium bg-purple-100 px-6 py-2 shadow-md ease-in-out border-purple-700 border-solid border-2 hover:scale-105 hover:shadow-lg duration-200"
          onClick={handleLocationChange}
          disabled={!mlat || !mlng}
        >
          Add Marker
        </button>

        <button
          className="rounded-md text-blue-700 font-medium bg-blue-100 px-6 py-2 shadow-md ease-in-out border-blue-700 border-solid border-2 hover:scale-105 hover:shadow-lg duration-200"
          onClick={centerOnRover}
        >
          Center on Rover
        </button>
      </div>
    </div>
  );
}

export default GPSMap;