<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="800"
    scrollable
  >
    <v-card>
      <v-card-title>{{ editMode ? 'Edit' : 'Create' }} Recipe</v-card-title>
      <v-card-text style="max-height: 600px">
        <v-form @submit.prevent="$emit('saveRecipe')">
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
                  @click="$emit('removeIngredient', index)"
                >
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </div>
              <v-btn
                color="primary"
                variant="text"
                prepend-icon="mdi-plus"
                @click="$emit('addIngredient')"
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
                <v-btn
                  icon
                  size="small"
                  color="error"
                  class="ml-2"
                  @click="$emit('removeStep', index)"
                >
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </div>
              <v-btn
                color="primary"
                variant="text"
                prepend-icon="mdi-plus"
                @click="$emit('addStep')"
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
</template>

<script setup lang="ts">
defineProps<{
  modelValue: boolean
  editMode: boolean
  form: any
  saving: boolean
}>()

defineEmits<{
  'update:modelValue': [value: boolean]
  saveRecipe: []
  addIngredient: []
  removeIngredient: [index: number]
  addStep: []
  removeStep: [index: number]
}>()
</script>
