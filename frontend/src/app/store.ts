import { configureStore } from "@reduxjs/toolkit";
// eslint-disable-next-line
import userReducer from "../feature/user/userSlice";
import matchingReducer from "../feature/matching/matchingSlice";
import chatReducer from "../feature/chat/chatSlice";

const store = configureStore({
  reducer: {
    user: userReducer,
    matching: matchingReducer,
    chat: chatReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
