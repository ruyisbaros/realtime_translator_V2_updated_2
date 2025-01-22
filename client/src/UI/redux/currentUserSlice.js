/* eslint-disable no-unused-vars */
import { createSlice } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

const initialState = {
  loggedUser: Cookies.get("user") ? JSON.parse(Cookies.get("user")) : null,
  
};

const currentUserSlice = createSlice({
  name: "currentUser",
  initialState,
  reducers: {
    setCurrentUser: (state, action) => {
      console.log(action.payload)
      state.loggedUser= {...action.payload}
    },
    logout: (state, _) => {
      state.loggedUser = null;
      Cookies.remove("user");
    },
  },
});

export const { setCurrentUser, logout } = currentUserSlice.actions;
export default currentUserSlice.reducer;
