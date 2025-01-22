const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("myAPI", {
  navigate: (route) => ipcRenderer.send("navigate", route),
  minimizeWindow: () => ipcRenderer.send("minimize-window"),
  closeWindow: () => ipcRenderer.send("close-window"),
  closeSubtitleWindow: () => ipcRenderer.send("close-subtitle-window"),
  invoke: (channel, ...args) => {
    const validChannels = ["scan-audio-sources"]; // Whitelist channels
    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, ...args);
    }
  },
  sendAudioSource: (channel, ...args) => {
    const validChannels = ["start-operation"];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, ...args);
    }
  },
  showSubtitleWindow: () => {
    ipcRenderer.send("show-subtitle-window"); // Trigger the subtitle window
  },
  playMedia: () => ipcRenderer.invoke("play-media"),
  pauseMedia: () => ipcRenderer.invoke("pause-media"),
  setVolume: (volume) => ipcRenderer.send("set-volume", volume),
  volumeMute: () => ipcRenderer.invoke("mute"),
  volumeUnMute: () => ipcRenderer.invoke("unmute"),
});
