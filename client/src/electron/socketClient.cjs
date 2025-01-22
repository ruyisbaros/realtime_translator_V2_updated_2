const { io } = require("socket.io-client");
const { spawn } = require("child_process");

const CHUNK_DURATION_SECONDS = 2; // Chunk duration in seconds
const SAMPLE_RATE = 44100; // 44.1 kHz sample rate
const BYTES_PER_SAMPLE = 2; // 16-bit audio (2 bytes per sample)
const CHANNELS = 2; // Stereo audio
const CHUNK_SIZE =
  CHUNK_DURATION_SECONDS * SAMPLE_RATE * BYTES_PER_SAMPLE * CHANNELS;

const socket = io("http://localhost:9001", {
  transports: ["websocket"], // Enforce WebSocket transport
});

socket.on("connect", () => {
  console.log("Node.js connected to Socket.IO server:", socket.id);
  socket.emit("register", { clientType: "nodejs", id: "node-client" });
});

socket.on("disconnect", () => {
  console.log("Node.js disconnected from Socket.IO server");
});

function streamAudioToWebSocket(sourceId, audioStreamProcess) {
  if (audioStreamProcess) {
    console.error("Audio streaming already in progress. Stop it first.");
    return;
  }
  const buffer = [];
  let totalBytes = 0;

  audioStreamProcess = spawn("parec", [
    `--monitor-stream=${sourceId}`,
    "--format=s16le",
    "--rate=44100",
    "--channels=2",
  ]);

  audioStreamProcess.stdout.on("data", (chunk) => {
    buffer.push(chunk);
    totalBytes += chunk.length;

    if (totalBytes >= CHUNK_SIZE) {
      const audioChunk = Buffer.concat(buffer);
      socket.emit("audio-chunk", {
        type: "audio-chunk",
        chunk: audioChunk.toString("base64"),
      });

      // Reset the buffer and totalBytes for the next chunk
      buffer.length = 0;
      totalBytes = 0;
    }
  });

  audioStreamProcess.stderr.on("data", (err) => {
    console.error("audioStreamProcess error:", err.toString());
  });

  audioStreamProcess.on("close", (code) => {
    console.log(`audioStreamProcess process closed with code ${code}`);
    // Handle cleanup if needed
  });
}

module.exports = { streamAudioToWebSocket };
