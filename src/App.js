import React, { useEffect, useState } from 'react';
import { Link, Routes, Route } from "react-router-dom";
import CameraPage from './pages/Cameras.js';
import Sensors from './pages/Sensors.js';
import CanData from './pages/CanInfo.js';
import WeMars from "./images/WE_Mars.jpg";

function App() {

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [imageOpen, setImageOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleImage = () => setImageOpen(!imageOpen)

  const handleClick = () => {
  toggleSidebar();
  toggleImage();
  };

  return (
    <div className="App relative">
      {!imageOpen && (<button onClick={handleClick} className="fixed top-2 left-2 z-50 p-1 hover:opacity-80 transition">
        <img
          src={WeMars}
          alt="WeMars Logo"
          className="w-32 h-auto rounded-lg"
        />
      </button>
      )}

      {sidebarOpen && (
        <div className="fixed top-3 left-3 h-44 w-32 bg-white shadow-lg z-40 p-4 rounded-md">
          <button
            onClick={handleClick}
            className="text-right text-xl font-bold mb-4"
          >
            ✕
          </button>
          <nav className="flex flex-col space-y-4">
            <Link to="/cameras" onClick={handleClick} className="text-purple-600 hover:underline">
              Cameras
            </Link>
            <Link to="/sensors" onClick={handleClick} className="text-purple-600 hover:underline">
              Sensors
            </Link>
          </nav>
        </div>
      )}

      {/* Main Routes */}
      <div>
        <Routes>
          <Route index element={<CameraPage />} />
          <Route path="/cameras" element={<CameraPage />} />
          <Route path="/sensors" element={<Sensors />} />
          <Route path="/canInfo" element={<CanData />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;