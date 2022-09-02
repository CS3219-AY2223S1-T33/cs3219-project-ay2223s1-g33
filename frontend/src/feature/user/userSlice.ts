/* eslint no-param-reassign: 0 */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "../../proto/types";

interface UserState {
	sessionToken: string;
	user: User;
}

const initialState = {
	sessionToken: "",
	user: User.create(),
};

export const userSlice = createSlice({
	name: "user",
	initialState,
	reducers: {
		login: (state, action: PayloadAction<UserState>) => {
			const { sessionToken, user } = action.payload;
			state.sessionToken = sessionToken;
			state.user = user;
		},
		logout: (state) => {
			state.sessionToken = initialState.sessionToken;
			state.user = initialState.user;
		},
	},
});

export const { login, logout } = userSlice.actions;

export default userSlice.reducer;
