import { configureStore } from '@reduxjs/toolkit';
import diceReducer from './diceSlice';

export const store = configureStore({
  reducer: {
    dice: diceReducer,
  },
});

