const { Server } = require("socket.io");
const http = require("http");
const cors = require("cors");

const PORT = 9001;
const httpServer = http.createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Allow all origins for now
    methods: ["GET", "POST"],
  },
  pingTimeout: 6000,
  pingInterval: 3000,
});

let clients = []; // To track connected clients

io.on("connection", (socket) => {
  console.log("Connected to:", socket.id);

  // Handle client registration
  socket.on("register", (data) => {
    const { clientType, id } = data;
    const existingClient = clients.find((c) => c.id === id);
    if (existingClient) {
      existingClient.socketId = socket.id;
      console.log("Client reconnected:", existingClient);
    } else {
      clients.push({ id, socketId: socket.id, clientType });
      console.log("New client registered:", data);
    }
  });

  // Handle file upload complete from React.js
  /*   socket.on("define-active-app", (data) => {
    const fastAPISocket = clients.find((c) => c.clientType === "fastapi");
    if (fastAPISocket) {
      io.to(fastAPISocket.socketId).emit("define-active-app", data);
    } else {
      console.error("No FastAPI client connected");
    }
  }); */

  // Handle audio chunks from Node.js
  socket.on("audio-chunk", (data) => {
    const fastAPISocket = clients.find((c) => c.clientType === "fastapi");
    if (fastAPISocket) {
      io.to(fastAPISocket.socketId).emit("audio-chunk", data);
      //console.log("Chunk sent to fastAPI ");
    } else {
      console.error("No FastAPI client connected");
    }
  });
  ////// UPLOADING VIDEO LOGIC STARTS//////////////
  socket.on("start-processing", (data) => {
    console.log("Fastapi started processing command received from React");
    const fastAPISocket = clients.find((c) => c.clientType === "fastapi");
    if (fastAPISocket) {
      io.to(fastAPISocket.socketId).emit("start-processing", data);
    } else {
      console.error("No FastAPI client connected");
    }
  });

  socket.on("process-state", (data) => {
    console.log("Process state emit from nodejs to react", data);
    const reactAPISocket = clients.find((c) => c.clientType === "react");
    if (reactAPISocket) {
      io.to(reactAPISocket.socketId).emit("process-state-react", data);
    } else {
      console.error("No FastAPI client connected");
    }
  });

  // Handle processing complete from fastAPI
  socket.on("processing-complete", (data) => {
    const reactAPISocket = clients.find((c) => c.clientType === "react");
    if (reactAPISocket) {
      io.to(reactAPISocket.socketId).emit("processing-complete", data);
    } else {
      console.error("No FastAPI client connected");
    }
  });
  // Handle processing complete from fastAPI
  socket.on("upload-error", (data) => {
    const reactAPISocket = clients.find((c) => c.clientType === "react");
    if (reactAPISocket) {
      io.to(reactAPISocket.socketId).emit("upload-error", data);
    } else {
      console.error("No FastAPI client connected");
    }
  });
  ////// UPLOADING VIDEO LOGIC ENDS//////////////
  // Handle transcriptions from FastAPI
  socket.on("transcription", (data) => {
    const receivers = [];
    clients.forEach((c) => {
      if (c.clientType === "nodejs" || c.clientType === "react") {
        receivers.push(c);
      }
    });
    if (receivers.length > 0) {
      receivers.forEach((r) =>
        io
          .to(r.socketId)
          .emit("transcription-to-clients", { data, target: r.clientType })
      );
      console.log("Transcription sent to React and Node.js", data.text);
    } else {
      console.error("No clients available");
    }
  });
  //Same language warning
  socket.on("language-warning", (data) => {
    console.log("same language warning", data);
    const reactAPISocket = clients.find((c) => c.clientType === "react");
    if (reactAPISocket) {
      io.to(reactAPISocket.socketId).emit("language-warning", data);
    }
  });

  socket.on("graph-data", (data) => {
    const reactAPISocket = clients.find((c) => c.clientType === "react");
    if (reactAPISocket) {
      io.to(reactAPISocket.socketId).emit("graph-data", data);
    }
  });

  // Handle disconnections
  socket.on("disconnect", () => {
    const index = clients.findIndex((client) => client.socketId === socket.id);
    if (index !== -1) {
      console.log("Client disconnected:", clients[index]);
      clients.splice(index, 1); // Remove client
    }
  });
});

// Start the server
httpServer.listen(PORT, () => {
  console.log(`Socket.IO server running on http://localhost:${PORT}`);
});
