import { createSlice } from "@reduxjs/toolkit";

let toastCounter = 0;

const uiSlice = createSlice({
  name: "ui",
  initialState: {
    toast: null, // { id, message, duration }
    superadminAuthed: false,
  },
  reducers: {
    showToast: {
      reducer(state, action) {
        state.toast = action.payload;
      },
      prepare(message, duration = 3000) {
        toastCounter += 1;
        return { payload: { id: toastCounter, message, duration } };
      },
    },
    clearToast(state, action) {
      // Hanya hapus kalau toast yang mau dihapus masih yang sama (mencegah race condition antar toast)
      if (state.toast && state.toast.id === action.payload) {
        state.toast = null;
      }
    },
    setSuperadminAuthed(state, action) {
      state.superadminAuthed = action.payload;
    },
  },
});

export const { showToast, clearToast,setSuperadminAuthed } = uiSlice.actions;
export default uiSlice.reducer;
