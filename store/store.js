import { configureStore } from '@reduxjs/toolkit';
import hrisReducer from './slices/hrisSlice';
import uiReducer from './slices/uiSlice'

export const store = configureStore({
  reducer: {
    hris: hrisReducer,
    ui: uiReducer,
  },
});