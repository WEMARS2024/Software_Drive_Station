import React, { useContext, useState, useEffect } from 'react';
import { AdvancedMarker, APIProvider, Map, Marker } from '@vis.gl/react-google-maps';
import WebSocketContext from './GPSWebSocketContext';

const API_Key = 'AIzaSyCYBmTARagWHZnlzn4wcSgYzMkC4nmW1e4';

function GPSMap() {
  const { location, error, isConnected } = useContext(WebSocketContext);
 
  const [mlat, setMlat] = useState('');
  const [mlng, setMlng] = useState('');
  const [mlng1, setMlng1] = useState('');
  const [mlat1, setMlat1] = useState('');
  const [mlng2, setMlng2] = useState('');
  const [mlat2, setMlat2] = useState('');
  const [distance, setDistance] = useState(null);
  const [manualMarkers, setManualMarkers] = useState([]);
  const [roverLocation, setRoverLocation] = useState({ lat: 40, lng: -80 });
  const [followMode, setFollowMode] = useState(true);
  const [mapKey, setMapKey] = useState(0);

  useEffect(() => {
    console.log('Location updated:', location);
   
    if (location && location.latitude !== null && location.longitude !== null) {
      const newLocation = { lat: location.latitude, lng: location.longitude };
      setRoverLocation(newLocation);
    }
  }, [location]);

  const handleLatChange = (event) => setMlat(event.target.value);
  const handleLngChange = (event) => setMlng(event.target.value);
  const handleLat1Change = (event) => setMlat1(event.target.value);
  const handleLng1Change = (event) => setMlng1(event.target.value);
  const handleLat2Change = (event) => setMlat2(event.target.value);
  const handleLng2Change = (event) => setMlng2(event.target.value);

  const handleLocationChange = () => {
    const lat = parseFloat(mlat);
    const lng = parseFloat(mlng);
   
    if (!isNaN(lat) && !isNaN(lng)) {
      const newMarker = {
        id: Date.now(),
        lat,
        lng,
        title: `Marker ${manualMarkers.length + 1}`
      };
      setManualMarkers(prev => [...prev, newMarker]);
      setMlat('');
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

  const distanceBetweenTwoPoints = () => {
    const lat1 = parseFloat(mlat1);
    const lng1 = parseFloat(mlng1);
    const lat2 = parseFloat(mlat2);
    const lng2 = parseFloat(mlng2);
    const R = 6371;
    const toRad = (d) => (d* Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);

    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    const c = 2 * R * Math.asin(Math.sqrt(a));
    setDistance(c);
  }

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
      <div className="mt-4 flex flex-wrap gap-4 items-center">
        <input
          className="p-2 rounded-md border-purple-700 border-solid border-2 shadow-md"
          type="number"
          step="any"
          value={mlat1}
          onChange={handleLat1Change}
          placeholder="Input Latitude1"
        />
       
        <input
          className="p-2 rounded-md border-purple-700 border-solid border-2 shadow-md"
          type="number"
          step="any"
          value={mlng1}
          onChange={handleLng1Change}
          placeholder="Input Longitude1"
        />
        <input
          className="p-2 rounded-md border-purple-700 border-solid border-2 shadow-md"
          type="number"
          step="any"
          value={mlat2}
          onChange={handleLat2Change}
          placeholder="Input Latitude2"
        />
       
        <input
          className="p-2 rounded-md border-purple-700 border-solid border-2 shadow-md"
          type="number"
          step="any"
          value={mlng2}
          onChange={handleLng2Change}
          placeholder="Input Longitude2"
        />

        <button
          className="rounded-md text-purple-700 font-medium bg-purple-100 px-6 py-2 shadow-md ease-in-out border-purple-700 border-solid border-2 hover:scale-105 hover:shadow-lg duration-200"
          onClick={distanceBetweenTwoPoints}
          disabled={!mlat1 || !mlng1 || !mlat2 || !mlng2}
        >
          Calculate Distance
        </button>
        {distance !== null && (
          <div className="text-md text-white font-semibold">
            Distance: {distance.toFixed(2)} km
          </div>
        )}
      </div>
      </div>
    </div>
  );
}

export default GPSMap;