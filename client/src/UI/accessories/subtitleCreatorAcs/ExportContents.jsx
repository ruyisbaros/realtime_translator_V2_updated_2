const ExportContents = () => {
  // Event Handlers
  const onExportSubtitles = () => {};
  const onExportVideo = () => {};
  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="w-full flex ">
        <h2 className="text-teal-400 text-xl font-semibold mb-1">
          Export & Tools
        </h2>
      </div>
      <div className="flex justify-center gap-2 items-center h-full w-full ">
        <button
          className="text-[#ececec] bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-600 hover:to-teal-500  font-semibold py-2 px-6 rounded-lg shadow-md transition-all duration-200"
          onClick={onExportSubtitles}
        >
          Export Subtitles
        </button>
        <button
          className="text-[#ececec] bg-gradient-to-r from-purple-500 to-pink-400 hover:from-purple-600 hover:to-pink-500  font-semibold py-2 px-6 rounded-lg shadow-md "
          onClick={onExportVideo}
        >
          Export Video with Subtitles
        </button>
      </div>
    </div>
  );
};

export default ExportContents;
