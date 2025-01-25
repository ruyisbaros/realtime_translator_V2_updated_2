import { app, BrowserWindow, Tray, Menu, ipcMain, screen } from "electron";
import path from "path";
import url from "url";
import process from "process";
import { exec } from "child_process";
import { getAudioSources } from "./capture_audio_src.cjs";
import { monitorAudioWithCorked } from "./pulseAudioController.cjs";
import { spawn } from "child_process";
import { io } from "socket.io-client";
import { Buffer } from "buffer";
import { stateManager } from "./stateManager.cjs";

let mainWindow;
let overlayWindow;
let tray;
let audioStreamProcess = null;

const isDev = !app.isPackaged; // Check if the app is running in development
const trayIconPath = isDev
  ? path.join(app.getAppPath(), "public/assets/logo_3_20.png") // Development
  : path.join(app.getAppPath(), "assets/logo_3_20.png"); // Production

/* GET PRELOAD JS */
function getPreloadPath() {
  const isDev = !app.isPackaged;
  return isDev
    ? path.join(app.getAppPath(), "src/electron/preload.cjs")
    : path.join(app.getAppPath(), "preload.cjs");
}
function getSubtitlePath() {
  const isDev = !app.isPackaged;
  return isDev
    ? path.join(app.getAppPath(), "src/electron/subtitle.html")
    : path.join(app.getAppPath(), "subtitle.html");
}

//console.log("Preload Path:", getPreloadPath());

/* CREATE MAIN WINDOW */
function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  mainWindow = new BrowserWindow({
    width: Math.min(1200, width),
    height: Math.min(800, height),
    minWidth: 800,
    minHeight: 600,
    frame: false,
    transparent: true, // Make the window background transparent
    webPreferences: {
      preload: getPreloadPath(), // Ensure preload.js path is correct
      contextIsolation: true, // Recommended for security
      nodeIntegration: false, // Disable Node.js in the renderer process
      enableRemoteModule: false, // Avoid deprecated remote module
      sandbox: false, // Ensure sandboxing doesn’t block features
      webSecurity: false,
    },
  });

  if (isDev) {
    mainWindow.loadURL("http://localhost:5123");
  } else {
    const distPath = path.join(
      app.getAppPath(),
      "client/dist-react/index.html"
    );
    const fileUrl = url.pathToFileURL(distPath).toString();

    console.log(`Loading file: ${fileUrl}`);
    mainWindow.loadURL(fileUrl);
  }
  mainWindow.webContents.session.webRequest.onBeforeSendHeaders(
    (details, callback) => {
      callback({
        requestHeaders: {
          Origin: "http://localhost:5123",
          ...details.requestHeaders,
        },
      });
    }
  );

  mainWindow.webContents.session.webRequest.onHeadersReceived(
    (details, callback) => {
      callback({
        responseHeaders: {
          "Access-Control-Allow-Origin": "http://localhost:5123",
          "Access-Control-Allow-Credentials": true,
          "Access-Control-Allow-Methods":
            "GET, POST, PUT, DELETE, PATCH, OPTIONS",
          "Access-Control-Allow-Headers":
            "Content-Type, Authorization, X-Requested-With",

          ...details.responseHeaders,
        },
      });
    }
  );
  createTray();
  createOverlay();
}

/* CREATE TRAY */
function createTray() {
  tray = new Tray(trayIconPath); // Replace with your icon
  tray.setToolTip("Translation Service");

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Show App",
      click: () => {
        mainWindow.show();
      },
    },
    {
      label: "Start Translation",
      click: () => {
        console.log("Translation started");
        // Add logic to start translation here
      },
    },
    {
      label: "Stop Translation",
      click: () => {
        console.log("Translation stopped");
        // Add logic to stop translation here
      },
    },
    {
      label: "Quit",
      click: () => {
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);

  // Optional: Double-click to show the app
  tray.on("double-click", () => {
    mainWindow.show();
  });
}
// Overlay Window
function createOverlay() {
  overlayWindow = new BrowserWindow({
    transparent: true, // Make the window transparent
    frame: false, // Remove the window frame
    alwaysOnTop: true, // Keep the overlay on top
    fullscreenable: false, // Prevent accidental fullscreen
    resizable: false,
    webPreferences: {
      preload: path.join(app.getAppPath(), "src/electron/preload.js"), // Preload for overlay IPC
    },
  });

  overlayWindow.setIgnoreMouseEvents(true); // Ignore mouse interactions
  overlayWindow.setBounds({ x: 0, y: 0, width: 800, height: 50 }); // Default position and size
  overlayWindow.hide(); // Start hidden until explicitly shown

  overlayWindow.loadURL("http://localhost:5123/overlay");
}
/* ///// SUBTITLE WINDOW //////////////////// */
let subtitleWindow = null;
ipcMain.on("show-subtitle-window", () => {
  if (!subtitleWindow) {
    subtitleWindow = new BrowserWindow({
      width: 800,
      height: 80,
      frame: false,
      transparent: true,
      alwaysOnTop: true,
      resizable: true,
      webPreferences: {
        preload: getPreloadPath(), // Use dynamic preload path
        nodeIntegration: true,
        contextIsolation: false,
      },
    });

    subtitleWindow.loadFile(getSubtitlePath()); // Use dynamic subtitle path

    subtitleWindow.on("closed", () => {
      subtitleWindow = null;
    });
  }
});

/* INVOKE WINDOWS*/
app.whenReady().then(() => {
  createWindow();

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});

/* ///////EVENTS///////////// */
ipcMain.on("close-window", () => {
  if (mainWindow) {
    mainWindow.close();
    stopAudioStream();
    if (subtitleWindow) {
      subtitleWindow.close();
    }
  }
});
ipcMain.on("close-subtitle-window", () => {
  if (subtitleWindow) {
    subtitleWindow.close();
  }
});

ipcMain.on("minimize-window", () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
});
ipcMain.handle("scan-audio-sources", async () => {
  return await getAudioSources();
});
ipcMain.on("start-operation", (event, message) => {
  if (stateManager.getState() === "running") {
    console.error("Cannot start. Already running.");
    return;
  }
  const { id, type, source_language, target_language, mediaName } = message;

  if (type === "start-operation" && id) {
    //console.log("Valid audio source ID:", id);

    streamAudioToWebSocket(id, source_language, target_language, mediaName);
  } else {
    console.error("Invalid or missing source ID");
  }
});

///////////Socket Events////////////
const CHUNK_DURATION_SECONDS = 2; // Chunk duration in seconds
const SAMPLE_RATE = 44100; // 44.1 kHz sample rate
const BYTES_PER_SAMPLE = 2; // 16-bit audio (2 bytes per sample)
const CHANNELS = 2; // Stereo audio
const CHUNK_SIZE =
  CHUNK_DURATION_SECONDS * SAMPLE_RATE * BYTES_PER_SAMPLE * CHANNELS;

const socket = io("http://127.0.0.1:8000", {
  transports: ["websocket"], // Enforce WebSocket transport
});

socket.on("connect", () => {
  console.log("Node.js connected to Socket.IO server:", socket.id);
  socket.emit("register", { clientType: "nodejs", id: "node-client" });
});

// Listen for new translated text messages
socket.on("transcription", (data) => {
  if (subtitleWindow) {
    console.log("Received translated text (Node):", data.text);
    // Handle the translated text here
    subtitleWindow.webContents.send("update-subtitle", data.text);
  }
});
socket.on("disconnect", () => {
  console.log("Socket disconnected, attempting to reconnect...");
  setTimeout(() => socket.connect(), 3000);
});

function streamAudioToWebSocket(
  initialSourceId,
  source_language,
  target_language,
  mediaName
) {
  let buffer = [];
  let totalBytes = 0;

  let currentSourceId = initialSourceId; // Start with the initial source ID

  monitorAudioWithCorked(
    mediaName,
    (updatedSourceId) => {
      // Start or resume transcription when audio is active
      if (!audioStreamProcess) {
        currentSourceId = updatedSourceId; // Update the source ID dynamically
        console.log(`Starting audio stream with source ID: ${currentSourceId}`);
        audioStreamProcess = spawn("parec", [
          `--monitor-stream=${currentSourceId}`,
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
              source_language,
              target_language,
            });

            // Reset the buffer and totalBytes for the next chunk
            buffer = [];
            totalBytes = 0;
          }
        });

        audioStreamProcess.on("close", (code) => {
          console.log(`Audio stream process exited with code ${code}`);
          audioStreamProcess = null;
        });
      }
    },
    () => {
      // Pause or stop transcription when audio is paused
      if (audioStreamProcess) {
        console.log("Stopping audio stream...");
        audioStreamProcess.kill();
        audioStreamProcess = null;
      }
    }
  );
}

function stopAudioStream() {
  if (audioStreamProcess) {
    console.log("Stopping audio streaming process...");
    audioStreamProcess.kill("SIGTERM"); // Gracefully kill the process
    audioStreamProcess = null; // Reset the process instance
    console.log("Audio streaming process stopped.");
  } else {
    console.log("No active audio streaming process to stop.");
  }
}

ipcMain.handle("play-media", async () => {
  console.log("Playing media using remote debugging...");
});

ipcMain.handle("pause-media", async () => {
  console.log("Pausing media using remote debugging...");
});

ipcMain.on("set-volume", (event, volume) => {
  // For Linux with PulseAudio
  const command = `pactl set-sink-volume @DEFAULT_SINK@ ${volume}%`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error setting volume: ${stderr}`);
      return;
    }
    console.log(`Volume set to ${volume}%`);
  });

  // Uncomment below for loudness library (Node.js cross-platform solution)
  // const loudness = require("loudness");
  // loudness.setVolume(volume).then(() => console.log(`Volume set to ${volume}%`));
});

ipcMain.handle("mute", () => {
  // For Linux with PulseAudio
  const command = `pactl set-sink-volume @DEFAULT_SINK@ 0%`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error setting volume: ${stderr}`);
      return;
    }
    console.log(`Volume muted`);
  });
});
ipcMain.handle("unmute", () => {
  // For Linux with PulseAudio
  const command = `pactl set-sink-volume @DEFAULT_SINK@ 60%`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error setting volume: ${stderr}`);
      return;
    }
    console.log(`Volume muted`);
  });
});
