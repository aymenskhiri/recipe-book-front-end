import { ref, onMounted, onUnmounted } from 'vue'
import { recipesApi, Recipe } from '@/store/recipesApi'
import { store } from '@/store'

export function useAllRecipes() {
  const recipes = ref<Recipe[]>([])
  const loading = ref(true)
  const error = ref<string | null>(null)

  let unsubscribe: (() => void) | null = null

  onMounted(() => {
    const queryResult = store.dispatch(recipesApi.endpoints.getAllRecipes.initiate())

    unsubscribe = queryResult.unsubscribe

    const storeUnsubscribe = store.subscribe(() => {
      const state = store.getState()

      const queryCacheKey = recipesApi.endpoints.getAllRecipes.select()(state)

      if (queryCacheKey.data) {
        recipes.value = queryCacheKey.data.data
        loading.value = false
      }

      if (queryCacheKey.error) {
        error.value = 'Failed to load recipes'
        loading.value = false
      }

      if (queryCacheKey.status === 'pending') {
        loading.value = true
      }
    })

    return () => {
      unsubscribe?.()
      storeUnsubscribe()
    }
  })

  onUnmounted(() => {
    unsubscribe?.()
  })

  const refetch = () => {
    loading.value = true
    error.value = null
    store.dispatch(recipesApi.endpoints.getAllRecipes.initiate(undefined, { forceRefetch: true }))
  }

  return { recipes, loading, error, refetch }
}
