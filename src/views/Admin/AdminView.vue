<template>
  <v-container fluid class="pa-4">
    <v-row align="center" class="mb-6">
      <v-col>
        <h1 class="text-h4 font-weight-bold">Admin Dashboard - All Recipes</h1>
        <p class="text-body-1 text-grey mt-2">Manage all recipes from the community</p>
      </v-col>
      <v-col cols="auto">
        <v-btn color="primary" size="large" @click="$router.push('/')">
          <v-icon left>mdi-home</v-icon>
          User View
        </v-btn>
        <v-btn color="success" size="large" class="ml-2" @click="openCreateDialog">
          <v-icon left>mdi-plus</v-icon>
          Add Recipe
        </v-btn>
      </v-col>
    </v-row>

    <AdminStats :recipes="recipes" :unique-authors="uniqueAuthors" :cuisine-types="cuisineTypes" />

    <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4" />

    <v-alert v-if="error" type="error" dismissible class="mb-6" @click:close="error = ''">
      {{ error }}
    </v-alert>

    <AdminFilters
      v-model:search="search"
      v-model:selected-cuisine="selectedCuisine"
      v-model:selected-author="selectedAuthor"
      :cuisine-types-array="cuisineTypesArray"
      :authors-array="authorsArray"
    />

    <AdminRecipesTable
      :recipes="filteredRecipes"
      :loading="loading"
      :search="search"
      :selected-cuisine="selectedCuisine"
      :selected-author="selectedAuthor"
      @edit-recipe="editRecipe"
      @delete-recipe="confirmDelete"
      @clear-filters="clearFilters"
    />

    <AdminRecipeDialog
      v-model="dialog"
      :edit-mode="editMode"
      :form="form"
      :saving="saving"
      @save-recipe="saveRecipe"
      @add-ingredient="addIngredient"
      @remove-ingredient="removeIngredient"
      @add-step="addStep"
      @remove-step="removeStep"
    />

    <AdminDeleteDialog v-model="deleteDialog" :deleting="deleting" @confirm-delete="deleteRecipe" />
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { store } from '@/store'
import { recipesApi, Recipe } from '@/store/recipesApi'
import AdminStats from './AdminStats.vue'
import AdminFilters from './AdminFilters.vue'
import AdminDeleteDialog from './AdminDeleteDialog.vue'
import AdminRecipeDialog from './AdminRecipeDialog.vue'
import AdminRecipesTable from './AdminRecipesTable.vue'

const recipes = ref<Recipe[]>([])
const loading = ref(true)
const error = ref('')
const saving = ref(false)
const deleting = ref(false)

const dialog = ref(false)
const deleteDialog = ref(false)
const editMode = ref(false)
const currentId = ref<number | null>(null)
const recipeToDelete = ref<number | null>(null)

const search = ref('')
const selectedCuisine = ref('')
const selectedAuthor = ref('')

const form = ref({
  name: '',
  cuisine_type: '',
  ingredients: [''] as string[],
  steps: [''] as string[],
  picture: null as File | null,
  pictureUrl: '',
})

const uniqueAuthors = computed(() => {
  const authors = new Set()
  recipes.value.forEach((recipe) => {
    if (recipe.user?.name) {
      authors.add(recipe.user.name)
    }
  })
  return authors
})

const cuisineTypes = computed(() => {
  const cuisines = new Set()
  recipes.value.forEach((recipe) => {
    if (recipe.cuisine_type) {
      cuisines.add(recipe.cuisine_type)
    }
  })
  return cuisines
})

const cuisineTypesArray = computed(() => Array.from(cuisineTypes.value) as string[])
const authorsArray = computed(() => Array.from(uniqueAuthors.value) as string[])

const filteredRecipes = computed(() => {
  return recipes.value.filter((recipe) => {
    const matchesSearch =
      !search.value ||
      recipe.name.toLowerCase().includes(search.value.toLowerCase()) ||
      recipe.cuisine_type.toLowerCase().includes(search.value.toLowerCase())

    const matchesCuisine = !selectedCuisine.value || recipe.cuisine_type === selectedCuisine.value

    const matchesAuthor = !selectedAuthor.value || recipe.user?.name === selectedAuthor.value

    return matchesSearch && matchesCuisine && matchesAuthor
  })
})

onMounted(async () => {
  await loadRecipes()
})

const loadRecipes = async () => {
  try {
    loading.value = true
    error.value = ''

    const result = await store.dispatch(recipesApi.endpoints.getAllRecipes.initiate())

    if (result.data?.data) {
      recipes.value = result.data.data
    } else if (Array.isArray(result.data)) {
      recipes.value = result.data
    } else {
      recipes.value = []
    }
  } catch (err: any) {
    error.value = err?.data?.error || 'Failed to load recipes'
    recipes.value = []
  } finally {
    loading.value = false
  }
}

const openCreateDialog = () => {
  editMode.value = false
  form.value = {
    name: '',
    cuisine_type: '',
    ingredients: [''],
    steps: [''],
    picture: null,
    pictureUrl: '',
  }
  dialog.value = true
}

const editRecipe = (recipe: Recipe) => {
  editMode.value = true
  currentId.value = recipe.id
  form.value = {
    name: recipe.name,
    cuisine_type: recipe.cuisine_type,
    ingredients:
      recipe.ingredients && recipe.ingredients.length > 0 ? [...recipe.ingredients] : [''],
    steps: recipe.steps && recipe.steps.length > 0 ? [...recipe.steps] : [''],
    picture: null,
    pictureUrl: recipe.picture || '',
  }
  dialog.value = true
}

const addIngredient = () => {
  form.value.ingredients.push('')
}

const removeIngredient = (index: number) => {
  if (form.value.ingredients.length > 1) {
    form.value.ingredients.splice(index, 1)
  }
}

const addStep = () => {
  form.value.steps.push('')
}

const removeStep = (index: number) => {
  if (form.value.steps.length > 1) {
    form.value.steps.splice(index, 1)
  }
}

const saveRecipe = async () => {
  const validIngredients = form.value.ingredients.filter((i) => i.trim() !== '')
  const validSteps = form.value.steps.filter((s) => s.trim() !== '')

  if (validIngredients.length === 0) {
    error.value = 'Please add at least one ingredient'
    return
  }

  if (validSteps.length === 0) {
    error.value = 'Please add at least one cooking step'
    return
  }

  saving.value = true
  try {
    const formData = new FormData()
    formData.append('name', form.value.name)
    formData.append('cuisine_type', form.value.cuisine_type)

    validIngredients.forEach(() => {
      formData.append('ingredients[]', validIngredients[0])
    })
    validSteps.forEach(() => {
      formData.append('steps[]', validSteps[0])
    })

    if (form.value.picture) {
      formData.append('picture', form.value.picture)
    }

    if (editMode.value && currentId.value) {
      formData.append('_method', 'PUT')
      await store
        .dispatch(
          recipesApi.endpoints.updateRecipe.initiate({
            id: currentId.value,
            data: formData,
          }),
        )
        .unwrap()
    } else {
      await store.dispatch(recipesApi.endpoints.createRecipe.initiate(formData)).unwrap()
    }

    dialog.value = false
    error.value = ''
    await loadRecipes()
  } catch (err: any) {
    console.error('Save error:', err)
    error.value = err?.data?.message || err?.data?.error || 'Failed to save recipe'
  } finally {
    saving.value = false
  }
}

const confirmDelete = (id: number) => {
  recipeToDelete.value = id
  deleteDialog.value = true
}

const deleteRecipe = async () => {
  if (!recipeToDelete.value) return

  deleting.value = true
  try {
    await store.dispatch(recipesApi.endpoints.deleteRecipe.initiate(recipeToDelete.value)).unwrap()
    deleteDialog.value = false
    await loadRecipes()
  } catch (err: any) {
    error.value = err?.data?.error || 'Failed to delete recipe'
  } finally {
    deleting.value = false
    recipeToDelete.value = null
  }
}

const clearFilters = () => {
  search.value = ''
  selectedCuisine.value = ''
  selectedAuthor.value = ''
}
</script>
