/* eslint-disable import/no-cycle */
import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../feature/user/userSlice";
import matchingReducer from "../feature/matching/matchingSlice";
import sessionReducer from "../feature/session/sessionSlice";

const store = configureStore({
  reducer: {
    user: userReducer,
    matching: matchingReducer,
    session: sessionReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
