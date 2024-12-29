import React, { useContext } from 'react';
import WebSocketContext from './WebSocketContext';

const IMUData = () => {
  const { data, initialData } = useContext(WebSocketContext);

  return (
    <div id="Imu Data" className="relative flex w-[450px] h-[275px] overflow-hidden p-10 rounded-lg border-solid border-4 border-purple-700 bg-purple-100 shadow-lg">
      
      <div>
        <h1 className="text-xl pb-2 font-serif mb-4">IMU Data</h1>
        <p className="text-lg pb-2 mb-4">Pitch [x]: {data.pitch}</p>
        <p className="text-lg pb-2 mb-4">Roll [y]: {data.roll}</p>
        <p className="text-lg pb-2">Yaw [z]: {data.yaw}</p>
      </div>

      <div className="pl-28">
        <h1 className="text-xl pb-2 font-serif mb-4">Header Data</h1>
        <p className="text-lg pb-2 mb-4">Pitch [x]: {initialData?.pitch}</p>
        <p className="text-lg pb-2 mb-4">Roll [y]: {initialData?.roll}</p>
        <p className="text-lg pb-2">Yaw [z]: {initialData?.yaw}</p>
      </div>
    </div>
  );
};

export default IMUData;

