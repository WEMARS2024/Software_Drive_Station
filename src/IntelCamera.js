import React, { useRef } from 'react';
import { VncScreen } from 'react-vnc';

const VNCViewer = () => {


    return (
        <div className="relative border-solid border-4 border-black w-[800px] h-[700px] left-10 top-[125px] rounded-lg bg-slate-200">
            <span className="relative text-white bg-black rounded-md bottom-0 right-1 p-1 px-2 font-serif">Camera 1</span>
            <VncScreen 
                url='ws://192.168.137.250:3000' 
                scaleViewport 
                style={{width:'100%', height: '100%'}} 
            />
        </div>
    );
};

export default VNCViewer;