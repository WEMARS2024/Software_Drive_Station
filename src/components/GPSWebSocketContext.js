import React, { createContext, useEffect, useState, useRef } from 'react';

const GPSWebSocketContext = createContext(null);

export const GPSWebSocketProvider = ({ children }) => {
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef(null);

  const connectWebSocket = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.CONNECTING) {
      return wsRef.current;
    }

    if (wsRef.current) {
      wsRef.current.close();
    }

    const ws = new WebSocket('ws://192.168.1.100:5000');
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('Connected to GPS WebSocket server');
      setIsConnected(true);
      setError(null);
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        const { latitude, longitude } = message;
        setLocation({ latitude, longitude });
      } catch (error) {
        console.error('Error parsing GPS message:', error);
        setError('Error parsing GPS data');
      }
    };

    ws.onclose = (event) => {
      console.log('Disconnected from GPS WebSocket server');
      setIsConnected(false);
      
      if (event.code !== 1000) {
        setError('Disconnected from WebSocket');
        setTimeout(() => {
          if (wsRef.current === ws) {
            connectWebSocket();
          }
        }, 5000);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setError('WebSocket connection error');
    };

    return ws;
  };

  useEffect(() => {
    const ws = connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmounting');
        wsRef.current = null;
      }
    };
  }, []);

  return (
    <GPSWebSocketContext.Provider value={{ location, error, isConnected }}>
      {children}
    </GPSWebSocketContext.Provider>
  );
};

export default GPSWebSocketContext;