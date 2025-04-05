import { configureStore } from '@reduxjs/toolkit';
import portfolioReducer from './portfolioSlice';

export const store = configureStore({
  reducer: {
    portfolio: portfolioReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
}); 