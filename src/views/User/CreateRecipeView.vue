<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        <v-card class="pa-6" elevation="4">
          <v-card-title class="text-h4 font-weight-bold text-center mb-6">
            Create New Recipe
          </v-card-title>

          <v-form @submit.prevent="handleSubmit">
 
            <v-text-field
              v-model="form.name"
              label="Recipe Name"
              prepend-inner-icon="mdi-silverware-fork-knife"
              :error-messages="errors.name"
              required
              class="mb-4"
            />

            
            <v-text-field
              v-model="form.cuisine_type"
              label="Cuisine Type"
              prepend-inner-icon="mdi-earth"
              :error-messages="errors.cuisine_type"
              required
              class="mb-4"
            />
 
            <v-card variant="outlined" class="mb-4">
              <v-card-title class="text-h6">
                <v-icon left>mdi-format-list-bulleted</v-icon>
                Ingredients
              </v-card-title>
              <v-card-text>
                <v-text-field
                  v-model="newIngredient"
                  label="Add Ingredient"
                  append-inner-icon="mdi-plus"
                  @click:append-inner="addIngredient"
                  @keypress.enter="addIngredient"
                  class="mb-2"
                />
                <v-chip
                  v-for="(ingredient, index) in form.ingredients"
                  :key="index"
                  closable
                  @click:close="removeIngredient(index)"
                  class="ma-1"
                >
                  {{ ingredient }}
                </v-chip>
                <v-alert v-if="errors.ingredients" type="error" density="compact" class="mt-2">
                  {{ errors.ingredients }}
                </v-alert>
              </v-card-text>
            </v-card>
 
            <v-card variant="outlined" class="mb-4">
              <v-card-title class="text-h6">
                <v-icon left>mdi-chef-hat</v-icon>
                Cooking Steps
              </v-card-title>
              <v-card-text>
                <v-textarea
                  v-model="newStep"
                  label="Add Step"
                  rows="2"
                  append-inner-icon="mdi-plus"
                  @click:append-inner="addStep"
                  class="mb-2"
                />
                <v-list lines="two">
                  <v-list-item
                    v-for="(step, index) in form.steps"
                    :key="index"
                    :title="`Step ${index + 1}`"
                    :subtitle="step"
                  >
                    <template v-slot:append>
                      <v-btn icon variant="text" color="error" @click="removeStep(index)">
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </template>
                  </v-list-item>
                </v-list>
                <v-alert v-if="errors.steps" type="error" density="compact" class="mt-2">
                  {{ errors.steps }}
                </v-alert>
              </v-card-text>
            </v-card>
 
            <v-card variant="outlined" class="mb-4">
              <v-card-title class="text-h6">
                <v-icon left>mdi-image</v-icon>
                Recipe Image
              </v-card-title>
              <v-card-text>
                <v-file-input
                  v-model="form.picture"
                  label="Upload Recipe Image"
                  accept="image/*"
                  prepend-icon="mdi-camera"
                  :error-messages="errors.picture"
                  show-size
                />
                <v-img
                  v-if="imagePreview"
                  :src="imagePreview"
                  max-height="200"
                  contain
                  class="mt-2 rounded"
                />
              </v-card-text>
            </v-card>
 
            <v-row class="mt-6">
              <v-col>
                <v-btn color="secondary" variant="outlined" block @click="$router.back()">
                  <v-icon left>mdi-arrow-left</v-icon>
                  Cancel
                </v-btn>
              </v-col>
              <v-col>
                <v-btn
                  type="submit"
                  color="primary"
                  block
                  :loading="loading"
                  :disabled="!isFormValid"
                >
                  <v-icon left>mdi-content-save</v-icon>
                  Create Recipe
                </v-btn>
              </v-col>
            </v-row>
 
            <v-alert v-if="success" type="success" class="mt-4">
              Recipe created successfully!
            </v-alert>

            <v-alert v-if="error" type="error" class="mt-4">
              {{ error }}
            </v-alert>
          </v-form>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { store } from '@/store'
import { recipesApi } from '@/store/recipesApi'

const router = useRouter()
 
const form = ref({
  name: '',
  cuisine_type: '',
  ingredients: [] as string[],
  steps: [] as string[],
  picture: null as File | null,
})
 
const newIngredient = ref('')
const newStep = ref('')
 
const loading = ref(false)
const success = ref(false)
const error = ref('')
const imagePreview = ref('')
 
const errors = ref({
  name: '',
  cuisine_type: '',
  ingredients: '',
  steps: '',
  picture: '',
})
 
watch(
  () => form.value.picture,
  (file) => {
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        imagePreview.value = e.target?.result as string
      }
      reader.readAsDataURL(file)
    } else {
      imagePreview.value = ''
    }
  },
)
 
const isFormValid = computed(() => {
  return (
    form.value.name &&
    form.value.cuisine_type &&
    form.value.ingredients.length > 0 &&
    form.value.steps.length > 0
  )
})
 
const addIngredient = () => {
  if (newIngredient.value.trim()) {
    form.value.ingredients.push(newIngredient.value.trim())
    newIngredient.value = ''
    errors.value.ingredients = ''
  }
}

const removeIngredient = (index: number) => {
  form.value.ingredients.splice(index, 1)
}

const addStep = () => {
  if (newStep.value.trim()) {
    form.value.steps.push(newStep.value.trim())
    newStep.value = ''
    errors.value.steps = ''
  }
}

const removeStep = (index: number) => {
  form.value.steps.splice(index, 1)
}
 
const handleSubmit = async () => {
 
  errors.value = { name: '', cuisine_type: '', ingredients: '', steps: '', picture: '' }
  error.value = ''
  success.value = false

  if (!form.value.name) errors.value.name = 'Recipe name is required'
  if (!form.value.cuisine_type) errors.value.cuisine_type = 'Cuisine type is required'
  if (form.value.ingredients.length === 0)
    errors.value.ingredients = 'At least one ingredient is required'
  if (form.value.steps.length === 0) errors.value.steps = 'At least one step is required'

  if (Object.values(errors.value).some((msg) => msg)) return

  loading.value = true

  try {
 
    const formData = new FormData()
    formData.append('name', form.value.name)
    formData.append('cuisine_type', form.value.cuisine_type)
    form.value.ingredients.forEach((ingredient) => {
      formData.append('ingredients[]', ingredient)
    })
    form.value.steps.forEach((step) => {
      formData.append('steps[]', step)
    })
    if (form.value.picture) {
      formData.append('picture', form.value.picture)
    }
 
    const result = await store
      .dispatch(recipesApi.endpoints.createRecipe.initiate(formData))
      .unwrap()

    success.value = true
 
    setTimeout(() => {
      router.push(`/recipe/${result.data.id}`)
    }, 1500)
  } catch (err: any) {
    error.value = err?.data?.message || 'Failed to create recipe'
 
    if (err?.data?.errors) {
      const backendErrors = err.data.errors
      Object.keys(backendErrors).forEach((key) => {
        if (key in errors.value) {
          errors.value[key as keyof typeof errors.value] = backendErrors[key][0]
        }
      })
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.rounded {
  border-radius: 8px;
}
</style>
