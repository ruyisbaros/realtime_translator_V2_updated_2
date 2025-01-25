import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  video_url: "",
  selectedFile: null,
  isVideoUploaded: false,
  previewUrl: "",
  isUploadFinished: false,
  progress_state: {
    uploading: { progress: 0, message: "" },
    extracting: { progress: 0, message: "" },
    batching: { progress: 0, message: "" },
    transcribing: { progress: 0, message: "" },
    translating: { progress: 0, message: "" },
    finalizing: { progress: 0, message: "" },
  },
  isTranslationComplete: false,
  metadata: null,
  isPlaying: false,
};

const videoSlice = createSlice({
  name: "video_subtitles",
  initialState,
  reducers: {
    setSelectedFileRdx: (state, action) => {
      const { file, metadata } = action.payload;
      state.selectedFile = file;
      state.previewUrl = URL.createObjectURL(file);
      state.metadata = metadata;
    },
    resetSelectedFileRdx: (state) => {
      state.selectedFile = null;
      state.previewUrl = null;
      state.metadata = null;
    },
    togglePlay: (state) => {
      state.isPlaying = !state.isPlaying;
    },
    setIsVideoUploadedRdx: (state, action) => {
      state.isVideoUploaded = action.payload;
    },
    setIsUploadFinishedRdx: (state, action) => {
      state.isUploadFinished = action.payload;
    },
    setPreviewUrlRdx: (state, action) => {
      state.previewUrl = action.payload;
    },
    setProgressStateRdx: (state, action) => {
      if (action.payload) {
        const { stage, progress, message } = action.payload;
        state.progress_state = {
          ...state.progress_state,
          [stage]: {
            progress: progress, // Directly update progress
            message: message, // Directly update message
          },
        };
      }
    },
    setTranslationCompleteRdx: (state, action) => {
      state.isTranslationComplete = action.payload;
    },
  },
});

export const {
  setSelectedFileRdx,
  togglePlay,
  setIsVideoUploadedRdx,
  setIsUploadFinishedRdx,
  resetSelectedFileRdx,
  setPreviewUrlRdx,
  setProgressStateRdx,
  setTranslationCompleteRdx,
} = videoSlice.actions;
export default videoSlice.reducer;
