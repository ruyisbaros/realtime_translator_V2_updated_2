import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  audio_channels: [],
  selected_source: null,
  translated_text: "",
  operationState: "idle",
  isLoading: false,
  target_language: "en",
  source_language: "en",
  same_language_warning: "",
  no_voice_detected: false,
  display_warning_box: false,
  waveform: [],
  rms: 0,
  volume: 50,
  currentTime: 0,
  duration: 0,
  display_subtitles: true,
};

const playerSlice = createSlice({
  name: "audio_src",
  initialState,
  reducers: {
    setAudioChannelsRdx: (state, action) => {
      state.audio_channels = action.payload;
    },
    setSelectedSourceRdx: (state, action) => {
      state.selected_source = action.payload;
    },
    handleOperationStateRdx: (state, action) => {
      state.operationState = action.payload;
      //console.log(state.operationState);
    },
    closeSubtitlesRdx: (state) => {
      state.display_subtitles = false;
    },
    showSubtitlesRdx: (state) => {
      state.display_subtitles = true;
    },
    setVolumeRdx: (state, action) => {
      state.volume = action.payload;
    },
    setCurrentTimeRdx: (state, action) => {
      state.currentTime = action.payload;
    },
    setDurationRdx: (state, action) => {
      state.duration = action.payload;
    },
    setIsLoadingRdx: (state, action) => {
      state.isLoading = action.payload;
    },
    setTranslatedTextRdx: (state, action) => {
      state.translated_text = state.translated_text
        ? `${state.translated_text}${action.payload}`.trim() // Append new chunk with space
        : action.payload; // First chunk, no need for space
    },
    clear_translated_text: (state) => {
      state.translated_text = "";
    },
    setTargetLanguageRdx: (state, action) => {
      state.target_language = action.payload;
    },
    setSourceLanguageRdx: (state, action) => {
      state.source_language = action.payload;
    },
    setSameLanguageWarningRdx: (state, action) => {
      state.same_language_warning = action.payload;
      if (state.same_language_warning) {
        state.display_warning_box = true;
      } else {
        state.display_warning_box = false;
      }
    },
    setNoVoiceDetectedRdx: (state, action) => {
      state.no_voice_detected = action.payload;
      if (state.no_voice_detected) {
        state.display_warning_box = true;
      } else {
        state.display_warning_box = false;
      } // Hide warning box if voice detected
    },
    setVolumeDataRdx: (state, action) => {
      state.waveform = [...state.waveform, action.payload.waveform];
      state.rms = action.payload.rms;
    },
  },
});

export const {
  setAudioChannelsRdx,
  setSelectedSourceRdx,
  handleOperationStateRdx,
  setVolumeRdx,
  setCurrentTimeRdx,
  setDurationRdx,
  setIsLoadingRdx,
  setTranslatedTextRdx,
  clear_translated_text,
  closeSubtitlesRdx,
  showSubtitlesRdx,
  setTargetLanguageRdx,
  setSourceLanguageRdx,
  setSameLanguageWarningRdx,
  setNoVoiceDetectedRdx,
  setVolumeDataRdx,
} = playerSlice.actions;
export default playerSlice.reducer;
