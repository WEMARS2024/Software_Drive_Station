import React, { useState } from 'react';
import { Link, Routes, Route } from "react-router-dom";
import CameraPage from './pages/Cameras.js';
import Sensors from './pages/Sensors.js';
import WeMars from "./images/WE_Mars.jpg";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [imageOpen, setImageOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleImage = () => setImageOpen(!imageOpen);

  const handleClick = () => {
    toggleSidebar();
    toggleImage();
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
        .then(() => setIsFullScreen(true))
        .catch(err => console.log('Error entering fullscreen:', err));
    } else {
      document.exitFullscreen()
        .then(() => setIsFullScreen(false))
        .catch(err => console.log('Error exiting fullscreen:', err));
    }
  };

  return (
    <div className="App relative bg-gray-900">
      {/* Sidebar Button */}
      {!imageOpen && (
        <button
          onClick={handleClick}
          className="sticky z-50 p-1 hover:opacity-90 transition rounded-md bg-purple-600 text-white shadow-lg focus:outline-none transform translate-x-4 translate-y-4"
          title="Open Sidebar"
        >
          <img
            src={WeMars}
            alt="WeMars Logo"
            className="w-16 h-auto rounded-md"
          />
        </button>
      )}

      {/* Fullscreen Button */}
      <button
        onClick={toggleFullScreen}
        className="sticky z-50 p-2 hover:opacity-90 transition rounded-md bg-white text-purple-600 shadow-lg focus:outline-none transform translate-x-[1625px] translate-y-[8px]" 
        title={isFullScreen ? "Exit Full Screen" : "Go Full Screen"}
      >
        {isFullScreen ? "Exit Full Screen" : "Go Full Screen"}
      </button>

      {/* Sidebar */}
      {sidebarOpen && (
        <div className="fixed top-0 left-0 h-full w-64 bg-gray-900 shadow-lg z-40 p-4 rounded-r-md">
          <button
            onClick={handleClick}
            className="text-right text-xl font-bold mb-4 text-white"
          >
            ✕
          </button>
          <nav className="flex flex-col space-y-4">
            <Link to="/cameras" onClick={handleClick} className="text-purple-300 hover:underline">
              Cameras
            </Link>
            <Link to="/sensors" onClick={handleClick} className="text-purple-300 hover:underline">
              Sensors
            </Link>
            <Link to="/canInfo" onClick={handleClick} className="text-purple-300 hover:underline">
              CAN Data
            </Link>
          </nav>
        </div>
      )}

      {/* Main Routes */}
      <div className="pt-2"> 
        <Routes>
          <Route index element={<CameraPage />} />
          <Route path="/cameras" element={<CameraPage />} />
          <Route path="/sensors" element={<Sensors />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
