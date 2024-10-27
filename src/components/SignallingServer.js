import React, { useEffect, useRef } from 'react';

const WebRTCStream = () => {
    const videoRef = useRef(null);
    const pcRef = useRef(null); // Use null initially to avoid premature creation of PC
    let ws;

    useEffect(() => {
        // Function to handle WebSocket connection (including reconnect logic)
        const connectWebSocket = () => {
            ws = new WebSocket('ws://10.0.0.58:3000');

            ws.onopen = () => {
                console.log('Connected to WebSocket signaling server');
                initializePeerConnection(); // Initialize the RTCPeerConnection here after WebSocket connection
            };

            ws.onmessage = async (event) => {
                console.log('Message from server:', event.data);
                const data = JSON.parse(event.data);

                // Handle WebRTC offer
                if (data.type === 'offer') {
                    console.log('Received offer:', data);
                    try {
                        await pcRef.current.setRemoteDescription(new RTCSessionDescription(data));
                        const answer = await pcRef.current.createAnswer();
                        await pcRef.current.setLocalDescription(answer);

                        // Send answer back to the server
                        ws.send(JSON.stringify({
                            type: 'answer',
                            sdp: pcRef.current.localDescription.sdp
                        }));
                    } catch (error) {
                        console.error('Error handling offer:', error);
                    }
                }

                // Handle WebRTC answer
                if (data.type === 'answer') {
                    console.log('Received answer:', data);
                    await pcRef.current.setRemoteDescription(new RTCSessionDescription(data));
                }

                // Handle ICE candidates
                if (data.type === 'candidate') {
                    console.log('Received ICE candidate:', data);
                    try {
                        await pcRef.current.addIceCandidate(new RTCIceCandidate(data));
                    } catch (error) {
                        console.error('Error adding ICE candidate:', error);
                    }
                }
            };

            ws.onerror = (error) => {
                console.error('WebSocket error:', error);
            };

            ws.onclose = (event) => {
                console.log('WebSocket connection closed:', event);
                if (event.code !== 1000) {
                    // Reconnect logic if it wasn't a clean close (code 1000)
                    console.log('Attempting to reconnect...');
                    setTimeout(connectWebSocket, 3000);  // Reconnect after 3 seconds
                }
            };
        };

        // Function to initialize the PeerConnection
        const initializePeerConnection = () => {
            // Check if a peer connection already exists and is not closed
            if (pcRef.current && pcRef.current.signalingState !== 'closed') {
                console.warn('RTCPeerConnection is already open');
                return;
            }

            // Create a new RTCPeerConnection
            pcRef.current = new RTCPeerConnection();

            // ICE candidate gathering
            pcRef.current.onicecandidate = (event) => {
                if (event.candidate) {
                    console.log('Sending ICE candidate:', event.candidate);
                    ws.send(JSON.stringify({
                        type: 'candidate',
                        sdpMLineIndex: event.candidate.sdpMLineIndex,
                        sdpMid: event.candidate.sdpMid,
                        candidate: event.candidate.candidate
                    }));
                }
            };

            // Attach the incoming media stream to the video element
            pcRef.current.ontrack = (event) => {
                if (videoRef.current) {
                    videoRef.current.srcObject = event.streams[0];
                }
            };

            console.log('RTCPeerConnection initialized');
        };

        // Start the WebSocket connection
        connectWebSocket();

        // Cleanup when the component unmounts
        return () => {
            if (pcRef.current) {
                pcRef.current.close();  // Close the WebRTC PeerConnection
            }
            if (ws) ws.close();  // Close the WebSocket connection
        };
    }, []);

    return (
        <div>
            <video ref={videoRef} autoPlay playsInline style={{ width: '100%' }} />
        </div>
    );
};

export default WebRTCStream;
