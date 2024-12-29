import React, { useState, useRef, useEffect } from "react";


const VideoStream = () => {
    const videoRef = useRef(null);
    const pcRef = useRef(null);
    const [connectionStatus, setConnectionStatus] = useState("Disconnected");

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
                const [stream] = event.streams;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.play();
                }
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

            // Create an SDP offer
            const offer = await pc.createOffer({
                offerToReceiveAudio: false,
                offerToReceiveVideo: true, // Ensure the offer explicitly requests video
            });
            await pc.setLocalDescription(offer);

            // Send the offer to the server
            const response = await fetch("http://192.168.0.200:8080/offer", {
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
            cleanupConnection(); // Clean up when the component unmounts
        };
    }, []);

    return (
        <div>
            <button className="bg-purple-300 rounded-lg p-2 text-lg m-2" onClick={startConnection} disabled={connectionStatus === "Connected"} >
                Start Stream | Status: {connectionStatus}
            </button>
            <video
                ref={videoRef}
                autoPlay
                playsInline
                controls
                style={{ width: "100%", height: "auto" }}
            />
        </div>
    );
};

export default VideoStream;