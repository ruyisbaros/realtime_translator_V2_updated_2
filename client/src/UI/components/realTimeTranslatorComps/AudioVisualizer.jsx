import { useState, useEffect, useRef } from "react";

const AudioVisualizer = () => {
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationRef = useRef(null);
  const [isAudioSetup, setIsAudioSetup] = useState(false);
  const [spectrogramData, setSpectrogramData] = useState([]);
  const [isVisualizing, setIsVisualizing] = useState(false);
  const [audioStream, setAudioStream] = useState(null);

  const canvasWidth = 400; // You can customize this
  const canvasHeight = 200; // You can customize this

  const setupAudio = async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(stream);
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048;
      source.connect(analyserRef.current);
      setIsAudioSetup(true);
      setIsVisualizing(true);
      visualize();
    }
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  const visualize = () => {
    if (!analyserRef.current || !isVisualizing) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    let currentSpectrogramData = [...spectrogramData];

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      analyserRef.current.getByteFrequencyData(dataArray);

      currentSpectrogramData.push(Array.from(dataArray));

      if (currentSpectrogramData.length > canvasWidth) {
        currentSpectrogramData = currentSpectrogramData.slice(1);
      }

      setSpectrogramData(currentSpectrogramData);
    };
    draw();
  };

  const renderSpectrogram = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvasWidth, canvasHeight); // Clear previous frame

    if (spectrogramData.length === 0) return;

    const numBins = spectrogramData[0].length;
    const binHeight = canvasHeight / numBins;

    spectrogramData.forEach((frequencyData, timeIndex) => {
      frequencyData.forEach((magnitude, binIndex) => {
        const color = `hsl(0, 100%, ${(magnitude / 255) * 100}%)`;
        ctx.fillStyle = color;
        ctx.fillRect(timeIndex, binIndex * binHeight, 1, binHeight);
      });
    });
  };

  useEffect(() => {
    renderSpectrogram();
  }, [spectrogramData]);

  const handleStartAudio = () => {
    if (!isAudioSetup) {
      setupAudio();
    }
  };

  const handleStopVisualization = () => {
    setIsVisualizing(false);
    if (audioStream) {
      audioStream.getTracks().forEach((track) => track.stop());
      setAudioStream(null);
    }
    setSpectrogramData([]); // Reset spectrogram data
  };

  return (
    <>
      {!isAudioSetup && <button onClick={handleStartAudio}>Start Audio</button>}
      {isAudioSetup && (
        <div className="mt-6 px-2">
          <button
            onClick={handleStopVisualization}
            disabled={!isVisualizing}
            className="btn mb-2 block mx-auto"
          >
            Stop Charting
          </button>
          <canvas
            ref={canvasRef}
            width={canvasWidth}
            height={canvasHeight}
            style={{ border: "1px solid black" }}
          />
        </div>
      )}
    </>
  );
};

export default AudioVisualizer;
