<template>
  <v-card class="mb-6">
    <v-card-text>
      <v-row align="center">
        <v-col cols="12" md="4">
          <v-text-field
            :model-value="search"
            @update:model-value="$emit('update:search', $event)"
            label="Search recipes..."
            prepend-inner-icon="mdi-magnify"
            density="comfortable"
            hide-details
          />
        </v-col>
        <v-col cols="12" md="4">
          <v-select
            :model-value="selectedCuisine"
            @update:model-value="$emit('update:selectedCuisine', $event)"
            :items="cuisineTypesArray"
            label="Filter by cuisine"
            density="comfortable"
            hide-details
            clearable
          />
        </v-col>
        <v-col cols="12" md="4">
          <v-select
            :model-value="selectedAuthor"
            @update:model-value="$emit('update:selectedAuthor', $event)"
            :items="authorsArray"
            label="Filter by chef"
            density="comfortable"
            hide-details
            clearable
          />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
defineProps<{
  search: string
  selectedCuisine: string
  selectedAuthor: string
  cuisineTypesArray: string[]
  authorsArray: string[]
}>()

defineEmits<{
  'update:search': [value: string]
  'update:selectedCuisine': [value: string]
  'update:selectedAuthor': [value: string]
}>()
</script>
