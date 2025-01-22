const { exec } = require("child_process");
let sinkList = []; // Cached list of sink inputs
let lastCheckedSink = null; // To track the currently active sink
const SINK_CHECK_INTERVAL = 3000; // Check every 3 seconds

function getSinkInputByMediaName(mediaName) {
  // Re-fetch sink inputs and find the matching one by media.name
  return new Promise((resolve, reject) => {
    exec("pactl list sink-inputs", (err, stdout, stderr) => {
      if (err) {
        console.error("Error fetching sink inputs:", stderr);
        return reject(stderr);
      }

      const sources = stdout
        .split("\n\n")
        .map((block) => {
          const idMatch = block.match(/Sink Input #(\d+)/);
          const nameMatch = block.match(/media\.name = "(.+)"/);
          const corkedMatch = block.match(/Corked: (yes|no)/);

          return {
            id: idMatch ? idMatch[1] : null,
            mediaName: nameMatch ? nameMatch[1] : null,
            corked: corkedMatch ? corkedMatch[1] === "yes" : null,
          };
        })
        .filter((source) => source.id && source.mediaName);

      sinkList = sources; // Update the cached list

      const matchingSink = sources.find((sink) => sink.mediaName === mediaName);
      resolve(matchingSink);
    });
  });
}

function monitorAudioWithCorked(mediaName, onActive, onPaused) {
  let isCorked = null;

  const checkSinkState = async () => {
    try {
      const sink = await getSinkInputByMediaName(mediaName);

      if (!sink) {
        console.log("Sink not found. Stopping monitoring.");
        clearInterval(interval);
        return;
      }

      if (sink.corked && isCorked !== true) {
        isCorked = true;
        console.log("Audio paused.");
        onPaused();
      } else if (!sink.corked && isCorked !== false) {
        isCorked = false;
        console.log("Audio active.");
        onActive(sink.id); // Pass the updated sink ID
      }
    } catch (err) {
      console.error("Error checking sink state:", err);
    }
  };

  const interval = setInterval(checkSinkState, SINK_CHECK_INTERVAL);

  // Immediately check the state once on start
  checkSinkState();

  return () => {
    clearInterval(interval);
    console.log("Stopped monitoring audio.");
  };
}

module.exports = { monitorAudioWithCorked };
