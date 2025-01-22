import { configureStore } from "@reduxjs/toolkit";
import currentUserSlice from "./currentUserSlice";

import selectedAudioSrc from "./selectedAudioSrc";
import videoSubtitleSlice from "./videoSubtitleSlice";

export const store = configureStore({
  reducer: {
    currentUser: currentUserSlice,
    audio_src: selectedAudioSrc,
    video_subtitles: videoSubtitleSlice,
  },
});
