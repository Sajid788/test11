import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  value: 1,
};

const diceSlice = createSlice({
  name: 'dice',
  initialState,
  reducers: {
    rollDice: (state) => {
      state.value = Math.floor(Math.random() * 6) + 1;
    },
  },
});

export const { rollDice } = diceSlice.actions;
export default diceSlice.reducer;

