import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    loggedIn: false,
    userDetails: {},
    categoryId: null,
  },
  reducers: {
    setLoginTrue: (state) => {
      state.loggedIn = true;
    },
    setLoginFalse: (state) => {
      state.loggedIn = false;
    },
    setUserDetails: (state, action) => {
      state.userDetails = action.payload;
    },
    setCateId: (state, action) => {
      state.categoryId = action.payload;
    },
  },
});

export const {
  setLoginTrue,
  setLoginFalse,
  setUserDetails,
  setCateId,
} = authSlice.actions;
export default authSlice.reducer;
