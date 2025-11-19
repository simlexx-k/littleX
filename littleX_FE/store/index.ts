import tweetReducer from "./tweetSlice";
import { configureStore } from "@reduxjs/toolkit";
import usersReducer from "./userSlice";
import aiReducer from "./aiSlice";

export const store = configureStore({
  reducer: {
    users: usersReducer,
    tweet: tweetReducer,
    ai: aiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
