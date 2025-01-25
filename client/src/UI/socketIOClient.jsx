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
import {
  setIsTranslationCompleteRdx,
  setParsedSubtitlesRdx,
  setProgressStateRdx,
  setTranslatedContentRdx,
} from "./redux/videoSubtitleSlice";

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
      socketRef.current.on("register_ack", (data) => {
        console.log("Server acknowledgment:", data);
      });
      // Listen for new translated text messages
      socketRef.current.on("transcription", (data) => {
        console.log("Received translated text (React):", data.text);
        // Handle the translated text here
        dispatch(setTranslatedTextRdx(data.text));
        dispatch(setIsLoadingRdx(false));
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
    // Listen video-audio operations state
    socketRef.current.on("process-state", (data) => {
      const { stage, message, progress } = data;
      console.log("Received new state:", data);
      dispatch(setProgressStateRdx({ stage, message, progress }));
    });

    // Listen translation complete state
    socketRef.current.on("processing-complete", async (data) => {
      console.log("Received translation complete state:", data);
      const { details } = data;
      const { parsed_subtitles } = details;

      dispatch(setParsedSubtitlesRdx(parsed_subtitles));
      dispatch(setTranslatedContentRdx(data));
      setTimeout(() => {
        dispatch(setIsTranslationCompleteRdx(true));
      }, 2000);
    });

    socketRef.current.on("disconnect", (reason) => {
      console.log("React disconnected:", reason);
      setConnectionStatus("disconnected");
    });

    socketRef.current.on("connect_error", (error) => {
      console.error("Connection error:", error);
      setConnectionStatus("error");
    });
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
