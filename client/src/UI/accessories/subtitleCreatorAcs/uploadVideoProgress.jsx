// eslint-disable-next-line react/prop-types
const UploadVideoProgress = ({ uploadProgress, cancelUpload, isCanceled }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 text-gray-200 rounded-2xl p-8 w-2/3 max-w-[600px] shadow-2xl border border-gray-700 relative">
        {/* Title */}
        <h3 className="text-2xl font-semibold mb-8 text-center text-teal-400 tracking-wide">
          Uploading Your Video
        </h3>

        <div className="mb-6">
          <div className="w-full h-4 relative bg-gray-800 rounded-full overflow-hidden shadow-inner">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-teal-400 to-teal-600 rounded-full transition-all duration-500"
              style={{ width: `${uploadProgress}%` }}
            >
              {/* Glowing effect with radial gradient */}
              <div className="absolute top-0 left-0 w-full h-full bg-radial-gradient rounded-full opacity-50"></div>
            </div>
          </div>
          <p className="mt-2 text-center text-sm font-medium text-gray-400">
            {uploadProgress === 100
              ? "Processing audio extraction..."
              : `Progress: ${uploadProgress}%`}
          </p>
        </div>

        <div className="flex justify-center">
          <button
            onClick={cancelUpload}
            disabled={uploadProgress === 0 || isCanceled}
            className={`px-5 py-2 text-sm font-bold rounded-md shadow-md transition-all duration-300
              ${
                uploadProgress === 0 || isCanceled
                  ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                  : "bg-red-500 hover:bg-red-600 text-white hover:shadow-lg"
              } `}
          >
            {isCanceled ? "Canceled" : "Cancel Upload"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadVideoProgress;
