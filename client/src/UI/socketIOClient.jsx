import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import SocketContext from "./WebSocketContext";
import { useDispatch } from "react-redux";
import {
  setIsLoadingRdx,
  setSameLanguageWarningRdx,
  setTranslatedTextRdx,
  setVolumeDataRdx,
} from "./redux/selectedAudioSrc";

// eslint-disable-next-line react/prop-types
export const SocketProvider = ({ children, wsUrl }) => {
  const dispatch = useDispatch();
  const socketRef = useRef(null); // Persistent socket instance
  const [connectionStatus, setConnectionStatus] = useState("disconnected");

  const connectSocket = () => {
    setConnectionStatus("connecting");
    socketRef.current = io(wsUrl, {
      transports: ["websocket"], // Ensure WebSocket transport
      reconnection: true, // Auto-reconnect
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
      pingTimeout: 10000, // Disconnect if no pong within 10 seconds
      pingInterval: 5000, // Send a ping every 5 seconds
    });

    socketRef.current.on("connect", () => {
      console.log("React connected to Socket.IO server:", socketRef.current.id);
      setConnectionStatus("connected");

      // Emit "register" to identify this client
      socketRef.current.emit("register", {
        clientType: "react",
        id: "react-client",
      });

      // Listen for new translated text messages
      socketRef.current.on("transcription-to-clients", (message) => {
        if (message.target === "react") {
          console.log("Received translated text:", message.data.text);
          // Handle the translated text here
          dispatch(setTranslatedTextRdx(message.data.text));
          dispatch(setIsLoadingRdx(false));
        }
      });

      // Listen for new translated text messages
      socketRef.current.on("language-warning", (data) => {
        console.log(data);
        dispatch(setSameLanguageWarningRdx(data.message));
      });
    });

    // Listen for audio rms and waveforms
    socketRef.current.on("graph-data", (data) => {
      const { waveform, rms } = data.graph_data;
      console.log("Received graph data:", data.graph_data);
      dispatch(setVolumeDataRdx({ waveform, rms }));
    });

    socketRef.current.on("disconnect", (reason) => {
      console.log("React disconnected:", reason);
      setConnectionStatus("disconnected");
    });

    socketRef.current.on("connect_error", (error) => {
      console.error("Connection error:", error);
      setConnectionStatus("error");
    });

    // Log all incoming events for debugging
    /*   socketRef.current.onAny((event, data) => {
      console.log(`Event received: ${event}`, data);
    }); */
  };

  useEffect(() => {
    connectSocket();

    return () => {
      if (socketRef.current) {
        console.log(
          "Disconnecting happens on React socket:",
          socketRef.current.id
        );
        socketRef.current.disconnect();
      }
    };
  }, []);

  const sendMessage = (event, data) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    } else {
      console.error("Socket.IO is not connected");
    }
  };

  const contextValue = {
    socket: socketRef.current,
    connectionStatus,
    sendMessage,
  };

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};
