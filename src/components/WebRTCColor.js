import React, { useState, useRef, useEffect } from "react";

const VideoStream = () => {
    const videoRef1 = useRef(null);
    const videoRef2 = useRef(null);
    const videoRef3 = useRef(null);
    const videoRef4 = useRef(null);
    const videoRef5 = useRef(null);
    const videoRef6 = useRef(null);

    const streamRefs = {
        color: videoRef1,
        depth: videoRef2,
        webcam1: videoRef3,
        webcam2: videoRef4,
        webcam3: videoRef5,
        webcam4: videoRef6,
    };

    const pcMap = useRef({});

    const [streamStatus, setStreamStatus] = useState({});

    const startConnection = async (streamName, videoRef) => {
        setStreamStatus(prev => ({ ...prev, [streamName]: "Connecting..." }));

        try {
            const pc = new RTCPeerConnection({
                iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
            });
            pcMap.current[streamName] = pc;

            pc.ontrack = (event) => {
                const stream = new MediaStream([event.track]);
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.play();
                }
            };

            pc.onconnectionstatechange = () => {
                if (pc.connectionState === "connected") {
                    setStreamStatus(prev => ({ ...prev, [streamName]: "Connected" }));
                } else if (["disconnected", "failed", "closed"].includes(pc.connectionState)) {
                    setStreamStatus(prev => ({ ...prev, [streamName]: "Disconnected" }));
                    cleanupConnection(streamName);
                }
            };

            pc.addTransceiver("video", { direction: "recvonly" });

            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            const response = await fetch("http://192.168.1.100:8080/offer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sdp: pc.localDescription.sdp,
                    type: pc.localDescription.type,
                    streams: [streamName],
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to fetch SDP answer from the server");
            }

            const data = await response.json();
            const answer = new RTCSessionDescription(data);
            await pc.setRemoteDescription(answer);

            setStreamStatus(prev => ({ ...prev, [streamName]: "Connected" }));
        } catch (error) {
            console.error(`Error starting stream "${streamName}":`, error);
            setStreamStatus(prev => ({ ...prev, [streamName]: "Failed" }));
        }
    };

    const stopStream = async (streamName) => {
        try {
            await fetch("http://192.168.1.100:8080/stop", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ stream: streamName }),
            });
        } catch (err) {
            console.error(`Error stopping stream "${streamName}":`, err);
        }

        cleanupConnection(streamName);
        setStreamStatus(prev => ({ ...prev, [streamName]: "Stopped" }));
    };

    const cleanupConnection = (streamName) => {
        const pc = pcMap.current[streamName];
        if (pc) {
            pc.close();
            delete pcMap.current[streamName];
        }

        const ref = streamRefs[streamName];
        if (ref?.current) {
            ref.current.srcObject = null;
        }
    };

    useEffect(() => {
        return () => {
            Object.keys(pcMap.current).forEach(cleanupConnection);
        };
    }, []);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 p-8 bg-gray-900 min-h-screen">
            {Object.entries(streamRefs).map(([streamName, ref], index) => (
                <div
                    key={streamName}
                    className="bg-gray-800 border-2 border-purple-600 rounded-lg shadow-lg p-4 flex flex-col justify-between"
                >
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-purple-300 font-semibold text-lg">
                            {streamName.toUpperCase()}
                        </h2>
                        <div className="flex gap-2">
                            <button
                                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1 rounded"
                                onClick={() => startConnection(streamName, ref)}
                                disabled={streamStatus[streamName] === "Connected"}
                            >
                                {streamStatus[streamName] === "Connected" ? "Connected" : "Start"}
                            </button>
                            <button
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded"
                                onClick={() => stopStream(streamName)}
                                disabled={!streamStatus[streamName] || streamStatus[streamName] === "Disconnected"}
                            >
                                Stop
                            </button>
                        </div>
                    </div>
                    <div className="aspect-video bg-black rounded overflow-hidden">
                        <video
                            ref={ref}
                            autoPlay
                            playsInline
                            controls
                            className="w-full h-full object-contain"
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default VideoStream;