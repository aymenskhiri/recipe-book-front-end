import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query'

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  name: string
  email: string
  password: string
  password_confirmation: string
}

export interface ForgotPasswordPayload {
  email: string
}

export interface ResetPasswordPayload {
  token: string
  email: string
  password: string
  password_confirmation: string
}

export interface AuthResponse {
  token: string
  user: {
    id: number
    name: string
    email: string
  }
}

const BASE_URL = 'http://127.0.0.1:8000/api'

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token')
      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginCredentials>({
      query: (credentials) => ({
        url: '/login',
        method: 'POST',
        body: credentials,
      }),
    }),

    register: builder.mutation<AuthResponse, RegisterCredentials>({
      query: (credentials) => ({
        url: '/register',
        method: 'POST',
        body: credentials,
      }),
    }),

    forgotPassword: builder.mutation<
      { message: string; debug_token?: string },
      ForgotPasswordPayload
    >({
      query: (payload) => ({
        url: '/forgot-password',
        method: 'POST',
        body: payload,
      }),
    }),

    resetPassword: builder.mutation<{ message: string }, ResetPasswordPayload>({
      query: (payload) => ({
        url: '/reset-password',
        method: 'POST',
        body: payload,
      }),
    }),
  }),
})

export const { login, register, forgotPassword, resetPassword } = authApi.endpoints
