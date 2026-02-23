import { createContext, useContext } from "react";

export const SocketContext = createContext(null);

/**
 * Hook to access the global socket instance.
 * @returns {Socket|null}
 */
export const useSocket = () => {
  return useContext(SocketContext);
};
