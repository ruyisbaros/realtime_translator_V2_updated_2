import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  video_url: "",
  selectedFile: null,
  isVideoUploaded: false,
  previewUrl: "",
  isUploadFinished: false,
  progress_state: "audio_extraction",
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
      state.progress_state = action.payload;
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
} = videoSlice.actions;
export default videoSlice.reducer;
