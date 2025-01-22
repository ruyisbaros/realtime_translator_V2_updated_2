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
    const client = { id, socketId: socket.id, clientType };
    clients.unshift(client);
    console.log("Registered client:", client);
    //io.emit("updateClients", clients); // Notify all clients of the update
  });

  // Handle audio chunks from Node.js
  socket.on("audio-chunk", (data) => {
    //console.log("Chunk received from Node.js ");
    const fastAPISocket = clients.find((c) => c.clientType === "fastapi");
    if (fastAPISocket) {
      io.to(fastAPISocket.socketId).emit("audio-chunk", data);
      //console.log("Chunk sent to fastAPI ");
    } else {
      console.error("No FastAPI client connected");
    }
  });

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
    const index = clients.findIndex((client) => client.id === socket.id);
    if (index !== -1) {
      console.log("Client disconnected:", clients[index]);
      clients.splice(index, 1); // Remove from list
    }
  });
});

// Start the server
httpServer.listen(PORT, () => {
  console.log(`Socket.IO server running on http://localhost:${PORT}`);
});
