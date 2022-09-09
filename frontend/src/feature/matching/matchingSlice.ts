/* eslint no-param-reassign: 0 */
import { createSlice } from "@reduxjs/toolkit";

interface MatchingState {
	inQueue: boolean;
}

const initialState: MatchingState = {
	inQueue: false,
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
	},
});

export const { enterQueue, leaveQueue } = matchingSlice.actions;
export default matchingSlice.reducer;
