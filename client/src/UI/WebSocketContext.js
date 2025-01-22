import { createContext, useContext } from "react";

const SocketContext = createContext(null);

export const useWebSocket = () => {
  return useContext(SocketContext);
};

export default SocketContext; // Export the context for provider
