/* eslint-disable no-unused-vars */
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  active_app: "",
};

const currentUserSlice = createSlice({
  name: "activeApp",
  initialState,
  reducers: {
    setActiveAppRdx: (state, action) => {
      console.log(action.payload);
      state.active_app = action.payload;
    },
  },
});

export const { setActiveAppRdx } = currentUserSlice.actions;
export default currentUserSlice.reducer;
