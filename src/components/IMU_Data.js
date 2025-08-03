import React, { useContext } from 'react';
import WebSocketContext from './GPSWebSocketContext';

const IMUData = () => {
  const { data, initialData } = useContext(WebSocketContext);

  return (
    <div className="relative flex w-full h-[275px] overflow-hidden p-6 rounded-lg border-4 border-solid border-purple-700 bg-purple-100 shadow-lg">
      <div>
        <h1 className="text-xl font-serif text-purple-300 mb-4">IMU Data</h1>
        <p className="text-lg text-purple-300">Pitch [x]: {data.pitch}</p>
        <p className="text-lg text-purple-300">Roll [y]: {data.roll}</p>
        <p className="text-lg text-purple-300">Yaw [z]: {data.yaw}</p>
      </div>

      <div className="pl-10">
        <h1 className="text-xl font-serif text-purple-300 mb-4">Header Data</h1>
        <p className="text-lg text-purple-300">Pitch [x]: {initialData?.pitch}</p>
        <p className="text-lg text-purple-300">Roll [y]: {initialData?.roll}</p>
        <p className="text-lg text-purple-300">Yaw [z]: {initialData?.yaw}</p>
      </div>
    </div>
  );
}

export default IMUData;

