import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { io } from "socket.io-client";
import { useAuth } from "../hooks/useAuth";
import { SocketContext } from "../hooks/useSocket";

/**
 * SocketProvider manages the lifecycle of the Socket.io connection.
 * It initializes the connection when a user is logged in and disconnects on logout.
 */
export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Only connect if user is authenticated
    if (!user?._id) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        Promise.resolve().then(() => {
          setSocket(null);
        });
      }
      return;
    }

    // Connect socket to the origin with explicit reconnection backoff logic
    const s = io(window.location.origin, {
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });
    socketRef.current = s;

    // Asynchronously setting state to avoid "cannot update while rendering" warnings
    Promise.resolve().then(() => {
      setSocket(s);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        Promise.resolve().then(() => {
          setSocket(null);
        });
      }
    };
  }, [user?._id]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

SocketProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
