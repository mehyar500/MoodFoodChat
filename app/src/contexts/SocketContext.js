// SocketContext.js
import React, { createContext, useState, useEffect, useMemo } from 'react';
import io from 'socket.io-client';
import { useAuthContext } from './AuthContext';

const SocketContext = createContext();

const SocketProvider = ({ children }) => {
  const { user } = useAuthContext();

  const socket = useMemo(() => {
    if (user) {
      return io(`${process.env.REACT_APP_API_URL}/chat?userId=${user._id}`, {
        transports: ['websocket'],
        reconnectionAttempts: 10,
        timeout: 10000,
      });
    }
    return null;
  }, [user]);
    
  const [isLoading, setIsLoading] = useState(true);
  const [socketReady, setSocketReady] = useState(false);

  useEffect(() => {
    if (!socket) {
      return;
    }
    
    setIsLoading(true);

    socket.on('connect', () => {
      console.log('Socket connected');
      setSocketReady(true);
      setIsLoading(false);
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected', reason);
      setSocketReady(false);
    });

    return () => {
      socket.off('disconnect');
      if (socket) {
        socket.close();
      }
    };
  }, [socket]);

  return (
    <SocketContext.Provider value={{ socket, isLoading, socketReady }}>
      {children}
    </SocketContext.Provider>
  );
};

export { SocketContext, SocketProvider };
