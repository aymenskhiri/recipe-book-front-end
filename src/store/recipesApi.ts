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
  is_hidden: boolean
}

export interface RecipesResponse {
  data: Recipe[]
}

export interface RecipeResponse {
  data: Recipe
}

export interface ToggleVisibilityResponse {
  message: string
  recipe: { id: number; name: string; is_hidden: boolean }
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
    getMyRecipes: builder.query<RecipesResponse, void>({
      query: () => '/my-recipes',
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Recipe' as const, id })),
              { type: 'Recipe', id: 'LIST' },
            ]
          : [{ type: 'Recipe', id: 'LIST' }],
    }),

    getRecipe: builder.query<RecipeResponse, number>({
      query: (id) => `/recipes/${id}`,
      providesTags: (result, error, id) => [{ type: 'Recipe', id }],
    }),

    createRecipe: builder.mutation<RecipeResponse, FormData>({
      query: (data) => ({ url: '/recipes', method: 'POST', body: data }),
      invalidatesTags: [{ type: 'Recipe', id: 'LIST' }],
    }),

    updateRecipe: builder.mutation<RecipeResponse, { id: number; data: FormData }>({
      query: ({ id, data }) => ({
        url: `/recipes/${id}`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'Recipe', id: arg.id },
        { type: 'Recipe', id: 'LIST' },
      ],
    }),

    deleteRecipe: builder.mutation<any, number>({
      query: (id) => ({ url: `/recipes/${id}`, method: 'DELETE' }),
      invalidatesTags: (result, error, id) => [
        { type: 'Recipe', id },
        { type: 'Recipe', id: 'LIST' },
      ],
    }),

    toggleRecipeVisibility: builder.mutation<ToggleVisibilityResponse, number>({
      query: (id) => ({
        url: `/recipes/${id}/toggle-visibility`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Recipe', id },
        { type: 'Recipe', id: 'LIST' },
      ],
    }),
  }),
})

export const {
  useGetMyRecipesQuery,
  useGetRecipeQuery,
  useCreateRecipeMutation,
  useUpdateRecipeMutation,
  useDeleteRecipeMutation,
  useToggleRecipeVisibilityMutation,
} = recipesApi
