import { configureStore } from '@reduxjs/toolkit'
import { recipesApi } from './recipesApi'
import { authApi } from './authApi'

export const store = configureStore({
  reducer: {
    [recipesApi.reducerPath]: recipesApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(recipesApi.middleware).concat(authApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
