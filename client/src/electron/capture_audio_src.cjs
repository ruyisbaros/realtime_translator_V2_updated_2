const { exec } = require("child_process");
let cachedSinkInputs = [];
function getAudioSources() {
  return new Promise((resolve, reject) => {
    exec("pactl list sink-inputs", (err, stdout, stderr) => {
      if (err) {
        console.error("Error fetching audio sources:", stderr);
        return reject(stderr);
      }

      const sources = stdout
        .split("\n\n") // Each sink input block
        .map((block) => {
          const idMatch = block.match(/Sink Input #(\d+)/);
          const nameMatch = block.match(/media\.name = "(.+)"/);
          const appNameMatch = block.match(/application\.name = "(.+)"/);
          const corkedMatch = block.match(/Corked: (\w+)/);

          return {
            id: idMatch ? idMatch[1] : null,
            corked: corkedMatch[1] === "yes" ? true : false,
            mediaName: nameMatch ? nameMatch[1] : "Unnamed Source",
            applicationName: appNameMatch
              ? appNameMatch[1]
              : "Unknown Application",
          };
        })
        .filter((source) => source.id); // Remove blocks without an ID
      cachedSinkInputs = sources;
      console.log(cachedSinkInputs);
      resolve(sources);
    });
  });
}

module.exports = { getAudioSources };
