import React, { useState, useRef, useEffect } from "react";


const VideoStream = () => {
    const videoRef1 = useRef(null);
    const videoRef2 = useRef(null);
    const videoRef3 = useRef(null);
    const pcRef = useRef(null);
    const [connectionStatus, setConnectionStatus] = useState("Disconnected");

    let trackCount = 0;

    const startConnection = async () => {
        setConnectionStatus("Connecting...");

        try {
            // Create a new RTCPeerConnection
            const pc = new RTCPeerConnection({
                iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
            });
            pcRef.current = pc;

            // Handle incoming tracks
            pc.ontrack = (event) => {
                const stream = new MediaStream([event.track]);

                if (trackCount === 0 && videoRef1.current) {
                    videoRef1.current.srcObject = stream;
                    videoRef1.current.play();
                }
                if (trackCount === 1 && videoRef2.current) {
                    videoRef2.current.srcObject = stream;
                    videoRef2.current.play();
                }

                if (trackCount === 2 && videoRef3.current) {
                    videoRef3.current.srcObject = stream;
                    videoRef3.current.play();
                }
                
                trackCount++;
            }; 

            // Handle connection state changes
            pc.onconnectionstatechange = () => {
                switch (pc.connectionState) {
                    case "connected":
                        setConnectionStatus("Connected");
                        break;
                    case "disconnected":
                    case "failed":
                        setConnectionStatus("Disconnected");
                        cleanupConnection();
                        break;
                    case "connecting":
                        setConnectionStatus("Connecting...");
                        break;
                    default:
                        setConnectionStatus("Disconnected");
                }
            };
            

            pc.addTransceiver("video", { direction: "recvonly" });
            pc.addTransceiver("video", { direction: "recvonly" });
            pc.addTransceiver("video", { direction: "recvonly"});
            // Create an SDP offer
            const offer = await pc.createOffer({
                offerToReceiveAudio: false,
                offerToReceiveVideo: true, // Ensure the offer explicitly requests video
            });
            await pc.setLocalDescription(offer);

            // Send the offer to the server
            const response = await fetch("http://192.168.0.111:8080/offer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sdp: pc.localDescription.sdp,
                    type: pc.localDescription.type,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to fetch SDP answer from the server");
            }

            // Process the server's SDP answer
            const data = await response.json();
            if (!data.sdp || !data.type) {
                throw new Error("Invalid SDP answer received from the server");
            }
            const answer = new RTCSessionDescription(data);
            await pc.setRemoteDescription(answer);

            setConnectionStatus("Connected");
        } catch (error) {
            console.error("Error during connection:", error);
            setConnectionStatus("Failed to connect");
        }
    };

    const cleanupConnection = () => {
        if (pcRef.current) {
            pcRef.current.close();
            pcRef.current = null;
        }
    };

    useEffect(() => {
        return () => {
            cleanupConnection();
        };
    }, []);

    return (

        <div className="pl-32 grid grid-cols-3 fixed h-screen w-full">
            <div className="col-start-2 col-end-3 flex justify-center items-center">
                <div className="relative border-solid border-4 border-customPurple w-11/12 h-11/12 rounded-lg bg-white">
                    <div className="w-full h-full relative overflow-hidden">
                        <button className="bg-customPurple rounded-lg p-2 text-lg m-2" onClick={startConnection} disabled={connectionStatus === "Connected"} >
                            Start Stream | Status: {connectionStatus}
                        </button>
                        <div className="aspect-video w-full h-full">
                            <video
                                ref={videoRef2}
                                autoPlay
                                playsInline
                                controls
                                className="max-w-full max-h-full w-full h-full object-contain"
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div className="col-start-3 col-end-4 flex justify-center items-center">
                <div className="relative border-solid border-4 border-customPurple w-11/12 h-11/12 rounded-lg bg-white">
                    <div className="w-full h-full relative overflow-hidden">
                        <button className="bg-customPurple rounded-lg p-2 text-lg m-2" onClick={startConnection} disabled={connectionStatus === "Connected"} >
                            Start Stream | Status: {connectionStatus}
                        </button>
                        <div className="aspect-video w-full h-full">
                            <video
                                ref={videoRef1}
                                autoPlay
                                playsInline
                                controls
                                className="max-w-full max-h-full w-full h-full object-contain"
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div className="col-start-2 col-end-3 flex justify-center items-center">
                <div className="relative border-solid border-4 border-customPurple rounded-lg w-11/12 h-11/12 bg-white">
                    <div className="w-full h-full relative overflow-hidden">
                        <button className="bg-customPurple rounded-lg p-2 text-lg m-2" onClick={startConnection} disabled={connectionStatus === "Connected"} >
                            Start Stream | Status: {connectionStatus}
                        </button>
                        <div className="aspect-video w-full h-full">
                            <video
                                ref={videoRef3}
                                autoPlay
                                playsInline
                                controls
                                className="max-w-full max-h-full w-full h-full object-contain"
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div className="col-start-3 col-end-4 flex justify-center items-center">
                <div className="relative border-solid border-4 border-customPurple rounded-lg w-11/12 h-11/12 bg-white">
                    <div className="w-full h-full relative overflow-hidden">
                        <button className="bg-customPurple rounded-lg p-2 text-lg m-2" onClick={startConnection} disabled={connectionStatus === "Connected"} >
                            Start Stream | Status: {connectionStatus}
                        </button>
                        <div className="aspect-video w-full h-full">
                            <video
                                ref={videoRef1}
                                autoPlay
                                playsInline
                                controls
                                className="max-w-full max-h-full w-full h-full object-contain"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>


    );
};

export default VideoStream;