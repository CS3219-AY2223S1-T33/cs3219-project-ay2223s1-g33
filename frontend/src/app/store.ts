import { configureStore } from "@reduxjs/toolkit";
// eslint-disable-next-line
import userReducer from "../feature/user/userSlice";
import matchingReducer from "../feature/matching/matchingSlice";
import chatReducer from "../feature/chat/chatSlice";
import sessionReducer from "../feature/session/sessionSlice";

const store = configureStore({
	reducer: {
		user: userReducer,
		matching: matchingReducer,
		chat: chatReducer,
		session: sessionReducer,
	},
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
