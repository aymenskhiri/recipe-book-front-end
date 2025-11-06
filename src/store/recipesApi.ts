// src/store/recipesApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export interface Recipe {
  id: number
  name: string
  cuisine_type: string
  ingredients: string[]
  steps: string[]
  picture: string | null
  user: { id: number; name: string }
  created_at: string
}

export interface RecipesResponse {
  data: Recipe[]
}

export interface RecipeResponse {
  data: Recipe
}

export interface MessageResponse {
  message: string
}

export const recipesApi = createApi({
  reducerPath: 'recipesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://127.0.0.1:8000/api',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token')
      if (token) headers.set('Authorization', `Bearer ${token}`)
      return headers
    },
  }),
  tagTypes: ['Recipe'],
  endpoints: (builder) => ({
    getAllRecipes: builder.query<RecipesResponse, void>({
      query: () => '/recipes',
      providesTags: ['Recipe'],
    }),
    getMyRecipes: builder.query<RecipesResponse, void>({
      query: () => '/my-recipes',
      providesTags: ['Recipe'],
    }),
    getRecipe: builder.query<RecipeResponse, number>({
      query: (id) => `/recipes/${id}`,
      providesTags: ['Recipe'],
    }),
    createRecipe: builder.mutation<RecipeResponse, FormData>({
      query: (data) => ({ url: '/recipes', method: 'POST', body: data }),
      invalidatesTags: ['Recipe'],
    }),
    updateRecipe: builder.mutation<RecipeResponse, { id: number; data: FormData }>({
      query: ({ id, data }) => ({
        url: `/recipes/${id}`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Recipe'],
    }),
    deleteRecipe: builder.mutation<MessageResponse, number>({
      query: (id) => ({ url: `/recipes/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Recipe'],
    }),
  }),
})

export const {
  useGetAllRecipesQuery,
  useGetMyRecipesQuery,
  useGetRecipeQuery,
  useCreateRecipeMutation,
  useUpdateRecipeMutation,
  useDeleteRecipeMutation,
} = recipesApi
