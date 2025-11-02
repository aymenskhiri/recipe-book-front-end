<template>
  <v-row class="mb-6">
    <v-col cols="12" sm="6" md="3">
      <v-card color="primary" class="pa-4 text-white">
        <div class="d-flex align-center">
          <v-icon size="40" class="mr-3">mdi-book-multiple</v-icon>
          <div>
            <div class="text-h4 font-weight-bold">{{ recipes.length }}</div>
            <div class="text-caption">Total Recipes</div>
          </div>
        </div>
      </v-card>
    </v-col>
    <v-col cols="12" sm="6" md="3">
      <v-card color="secondary" class="pa-4 text-white">
        <div class="d-flex align-center">
          <v-icon size="40" class="mr-3">mdi-account-group</v-icon>
          <div>
            <div class="text-h4 font-weight-bold">{{ uniqueAuthors.size }}</div>
            <div class="text-caption">Unique Chefs</div>
          </div>
        </div>
      </v-card>
    </v-col>
    <v-col cols="12" sm="6" md="3">
      <v-card color="success" class="pa-4 text-white">
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
</template>

<script setup lang="ts">
import { Recipe } from '@/store/recipesApi'

defineProps<{
  recipes: Recipe[]
  uniqueAuthors: Set<unknown>
  cuisineTypes: Set<unknown>
}>()
</script>
