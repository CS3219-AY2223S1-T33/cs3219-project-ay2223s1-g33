/* eslint no-param-reassign: 0 */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface MatchingState {
  inQueue: boolean;
  /** In order of `Easy`, `Medium`, `Hard` */
  diffSelected: [boolean, boolean, boolean];
  roomToken?: string;
}

const initialState: MatchingState = {
  inQueue: false,
  diffSelected: [false, false, false],
  roomToken: undefined,
};

export const matchingSlice = createSlice({
  name: "matching",
  initialState,
  reducers: {
    enterQueue: (state) => {
      state.inQueue = true;
    },
    leaveQueue: (state) => {
      state.inQueue = false;
    },
    enterRoom: (state, action: PayloadAction<{ roomToken: string }>) => {
      const { roomToken } = action.payload;
      state.roomToken = roomToken;
    },
    leaveRoom: (state) => {
      state.roomToken = undefined;
    },
    toggleDifficulty: (state, action: PayloadAction<{ index: number }>) => {
      const { index } = action.payload;
      const newValue = !state.diffSelected[index];
      state.diffSelected.splice(index, 1, newValue);
    },
    reset: (state) => {
      state.inQueue = initialState.inQueue;
      state.diffSelected = initialState.diffSelected;
      state.roomToken = initialState.roomToken;
    },
  },
});

export const {
  enterQueue,
  enterRoom,
  leaveRoom,
  leaveQueue,
  toggleDifficulty,
  reset,
} = matchingSlice.actions;
export default matchingSlice.reducer;
