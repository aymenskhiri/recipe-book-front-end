<template>
  <v-container fluid class="pa-4">
    <v-row align="center" class="mb-6">
      <v-col>
        <h1 class="text-h4 font-weight-bold">
          {{ isAdmin ? 'My Recipes (Admin)' : 'My Recipes' }}
        </h1>
        <p class="text-body-1 text-grey mt-2">
          {{ isAdmin ? 'Manage your personal recipes' : 'Manage your personal recipe collection' }}
        </p>
      </v-col>
      <v-col cols="auto">
        <v-btn
          v-if="isAdmin"
          color="secondary"
          size="large"
          class="ml-2"
          @click="$router.push('/admin')"
        >
          <v-icon left>mdi-shield-account</v-icon>
          Admin Panel
        </v-btn>
        <v-btn color="success" size="large" class="ml-2" @click="openCreateDialog">
          <v-icon left>mdi-plus</v-icon>
          Add Recipe
        </v-btn>
      </v-col>
    </v-row>

    <v-row v-if="isAdmin" class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <v-card color="primary" class="pa-4 text-white">
          <div class="d-flex align-center">
            <v-icon size="40" class="mr-3">mdi-book-multiple</v-icon>
            <div>
              <div class="text-h4 font-weight-bold">{{ recipes.length }}</div>
              <div class="text-caption">My Recipes</div>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card color="secondary" class="pa-4 text-white">
          <div class="d-flex align-center">
            <v-icon size="40" class="mr-3">mdi-chef-hat</v-icon>
            <div>
              <div class="text-h4 font-weight-bold">{{ cuisineTypes.size }}</div>
              <div class="text-caption">Cuisine Types</div>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4" />

    <v-alert v-if="error" type="error" dismissible class="mb-6" @click:close="error = ''">
      {{ error }}
    </v-alert>

    <v-card class="mb-6">
      <v-card-text>
        <v-row align="center">
          <v-col cols="12" md="6">
            <v-text-field
              v-model="search"
              label="Search my recipes..."
              prepend-inner-icon="mdi-magnify"
              density="comfortable"
              hide-details
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-select
              v-model="selectedCuisine"
              :items="cuisineTypesArray"
              label="Filter by cuisine"
              density="comfortable"
              hide-details
              clearable
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-row>
      <v-col v-for="recipe in filteredRecipes" :key="recipe.id" cols="12" sm="6" md="4" lg="3">
        <v-card
          class="h-100 transition"
          @click="$router.push(`/recipe/${recipe.id}`)"
          style="cursor: pointer"
          elevation="4"
          hover
        >
          <div class="relative">
            <v-img :src="recipe.picture || fallbackImage" height="180" cover>
              <template v-slot:placeholder>
                <div class="d-flex align-center justify-center fill-height">
                  <v-icon size="48" color="grey">mdi-silverware-fork-knife</v-icon>
                </div>
              </template>
            </v-img>

            <v-chip class="absolute top-2 left-2" color="primary" small label>
              {{ recipe.cuisine_type }}
            </v-chip>

            <v-chip
              v-if="recipe.is_hidden"
              class="absolute top-2 right-2"
              color="orange darken-3"
              small
              label
            >
              <v-icon small left>mdi-eye-off</v-icon>
              Hidden
            </v-chip>
          </div>

          <v-card-title class="text-h6 font-weight-bold pt-4 pb-2">
            {{ recipe.name }}
          </v-card-title>

          <v-card-subtitle class="pb-3">
            <v-icon small class="mr-1">mdi-chef-hat</v-icon>
            {{ recipe.cuisine_type }}
          </v-card-subtitle>

          <v-card-text class="text-caption text-grey">
            <div class="mb-2">
              <strong>Ingredients:</strong> {{ recipe.ingredients?.length || 0 }} items
            </div>
            <div><strong>Steps:</strong> {{ recipe.steps?.length || 0 }} steps</div>
          </v-card-text>

          <v-card-actions>
            <v-btn color="primary" variant="text" @click.stop="editRecipe(recipe)">
              <v-icon left>mdi-pencil</v-icon>
              Edit
            </v-btn>

            <!-- Toggle Visibility Button -->
            <v-btn
              :color="recipe.is_hidden ? 'success' : 'warning'"
              variant="text"
              @click.stop="toggleVisibility(recipe)"
              :loading="togglingId === recipe.id"
              :disabled="togglingId !== null && togglingId !== recipe.id"
            >
              <v-icon left>{{ recipe.is_hidden ? 'mdi-eye' : 'mdi-eye-off' }}</v-icon>
              {{ recipe.is_hidden ? 'Show' : 'Hide' }}
            </v-btn>

            <v-btn color="error" variant="text" @click.stop="confirmDelete(recipe.id)">
              <v-icon left>mdi-delete</v-icon>
              Delete
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <div v-if="!loading && filteredRecipes.length === 0" class="text-center py-12">
      <v-icon size="80" color="grey lighten-2">mdi-book-open-variant</v-icon>
      <p class="text-h6 mt-4 grey--text">
        {{
          search || selectedCuisine
            ? 'No recipes match your filters'
            : isAdmin
              ? "You haven't created any personal recipes yet"
              : "You haven't created any recipes yet"
        }}
      </p>
      <v-btn
        v-if="search || selectedCuisine"
        color="primary"
        class="mt-4 mr-2"
        @click="clearFilters"
      >
        Clear Filters
      </v-btn>
      <v-btn v-else color="primary" class="mt-4" @click="openCreateDialog">
        Create Your First Recipe
      </v-btn>
    </div>

    <!-- Create/Edit Dialog -->
    <v-dialog v-model="dialog" max-width="800" scrollable>
      <v-card>
        <v-card-title>{{ editMode ? 'Edit' : 'Create' }} Recipe</v-card-title>
        <v-card-text style="max-height: 600px">
          <v-form @submit.prevent="saveRecipe">
            <v-text-field v-model="form.name" label="Recipe Name" required class="mb-4" />

            <v-text-field v-model="form.cuisine_type" label="Cuisine Type" required class="mb-4" />

            <div class="mb-4">
              <label class="text-subtitle-1 font-weight-medium mb-2 d-block">Ingredients</label>
              <v-card variant="outlined" class="pa-3 mb-2">
                <div
                  v-for="(_, index) in form.ingredients"
                  :key="index"
                  class="d-flex align-center mb-2"
                >
                  <v-text-field
                    v-model="form.ingredients[index]"
                    density="compact"
                    hide-details
                    placeholder="e.g., 200g spaghetti"
                    class="flex-grow-1"
                  />
                  <v-btn
                    icon
                    size="small"
                    color="error"
                    class="ml-2"
                    @click="removeIngredient(index)"
                  >
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </div>
                <v-btn
                  color="primary"
                  variant="text"
                  prepend-icon="mdi-plus"
                  @click="addIngredient"
                  block
                >
                  Add Ingredient
                </v-btn>
              </v-card>
            </div>

            <div class="mb-4">
              <label class="text-subtitle-1 font-weight-medium mb-2 d-block">Cooking Steps</label>
              <v-card variant="outlined" class="pa-3 mb-2">
                <div v-for="(_, index) in form.steps" :key="index" class="d-flex align-start mb-2">
                  <span class="text-caption mr-2 mt-2">{{ index + 1 }}.</span>
                  <v-textarea
                    v-model="form.steps[index]"
                    density="compact"
                    hide-details
                    rows="2"
                    placeholder="Describe this step..."
                    class="flex-grow-1"
                  />
                  <v-btn icon size="small" color="error" class="ml-2" @click="removeStep(index)">
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </div>
                <v-btn
                  color="primary"
                  variant="text"
                  prepend-icon="mdi-plus"
                  @click="addStep"
                  block
                >
                  Add Step
                </v-btn>
              </v-card>
            </div>

            <v-file-input
              v-model="form.picture"
              label="Picture"
              accept="image/*"
              prepend-icon="mdi-camera"
              hint="Upload a new image"
              persistent-hint
              class="mb-4"
            />

            <div v-if="editMode && form.pictureUrl" class="mb-4">
              <label class="text-caption d-block mb-2">Current Picture:</label>
              <v-img :src="form.pictureUrl" height="150" class="rounded" cover />
            </div>

            <v-btn type="submit" color="primary" block :loading="saving" size="large">
              {{ editMode ? 'Update' : 'Create' }} Recipe
            </v-btn>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">Confirm Delete</v-card-title>
        <v-card-text>
          Are you sure you want to delete this recipe? This action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="deleteDialog = false">Cancel</v-btn>
          <v-btn color="error" @click="deleteRecipe" :loading="deleting">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { store } from '@/store'
import { recipesApi, Recipe } from '@/store/recipesApi'  

const recipes = ref<Recipe[]>([])
const loading = ref(true)
const error = ref('')
const saving = ref(false)
const deleting = ref(false)
const togglingId = ref<number | null>(null)

const dialog = ref(false)
const deleteDialog = ref(false)
const editMode = ref(false)
const currentId = ref<number | null>(null)
const recipeToDelete = ref<number | null>(null)

const search = ref('')
const selectedCuisine = ref('')

const fallbackImage = 'https://via.placeholder.com/300x180/f5f5f5/cccccc?text=No+Image'

const user = computed(() => {
  const userData = localStorage.getItem('user')
  return userData ? JSON.parse(userData) : null
})

const isAdmin = computed(() => {
  return user.value?.role === 'admin' || user.value?.is_admin
})

const form = ref({
  name: '',
  cuisine_type: '',
  ingredients: [''] as string[],
  steps: [''] as string[],
  picture: null as File | null,
  pictureUrl: '',
})

const cuisineTypes = computed(() => {
  const cuisines = new Set<string>()
  recipes.value.forEach((recipe) => {
    if (recipe.cuisine_type) cuisines.add(recipe.cuisine_type)
  })
  return cuisines
})

const cuisineTypesArray = computed(() => Array.from(cuisineTypes.value))

const filteredRecipes = computed(() => {
  return recipes.value.filter((recipe) => {
    const matchesSearch =
      !search.value ||
      recipe.name.toLowerCase().includes(search.value.toLowerCase()) ||
      recipe.cuisine_type.toLowerCase().includes(search.value.toLowerCase())

    const matchesCuisine = !selectedCuisine.value || recipe.cuisine_type === selectedCuisine.value

    return matchesSearch && matchesCuisine
  })
})

onMounted(async () => {
  await loadRecipes()
})

const loadRecipes = async () => {
  try {
    loading.value = true
    error.value = ''
    const result = await store.dispatch(recipesApi.endpoints.getMyRecipes.initiate())

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
    ingredients: recipe.ingredients?.length ? [...recipe.ingredients] : [''],
    steps: recipe.steps?.length ? [...recipe.steps] : [''],
    picture: null,
    pictureUrl: recipe.picture || '',
  }
  dialog.value = true
}

const addIngredient = () => form.value.ingredients.push('')
const removeIngredient = (index: number) => {
  if (form.value.ingredients.length > 1) form.value.ingredients.splice(index, 1)
}

const addStep = () => form.value.steps.push('')
const removeStep = (index: number) => {
  if (form.value.steps.length > 1) form.value.steps.splice(index, 1)
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
    formData.append('ingredients', JSON.stringify(validIngredients))
    formData.append('steps', JSON.stringify(validSteps))

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

const toggleVisibility = async (recipe: Recipe) => {
  if (togglingId.value !== null) return
  togglingId.value = recipe.id

  try {
    await store.dispatch(recipesApi.endpoints.toggleRecipeVisibility.initiate(recipe.id)).unwrap()
 
    const recipeIndex = recipes.value.findIndex((r) => r.id === recipe.id)
    if (recipeIndex !== -1) {
      const updatedRecipes = [...recipes.value]
      updatedRecipes[recipeIndex] = {
        ...updatedRecipes[recipeIndex],
        is_hidden: !updatedRecipes[recipeIndex].is_hidden,
      }
      recipes.value = updatedRecipes
    }
  } catch (err: any) {
    error.value = err?.data?.message || 'Failed to toggle visibility'
 
    const recipeIndex = recipes.value.findIndex((r) => r.id === recipe.id)
    if (recipeIndex !== -1) {
      const revertedRecipes = [...recipes.value]
      revertedRecipes[recipeIndex] = {
        ...revertedRecipes[recipeIndex],
        is_hidden: recipe.is_hidden,  
      }
      recipes.value = revertedRecipes
    }
  } finally {
    togglingId.value = null
  }
}

const clearFilters = () => {
  search.value = ''
  selectedCuisine.value = ''
}
</script>

<style scoped>
.h-100 {
  height: 100%;
}
.transition {
  transition: transform 0.2s ease-in-out;
}
.transition:hover {
  transform: translateY(-4px);
}
.relative {
  position: relative;
}
.absolute {
  position: absolute;
  z-index: 1;
}
</style>
