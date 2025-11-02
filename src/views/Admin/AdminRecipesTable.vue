<template>
  <v-card>
    <v-card-title>All Recipes</v-card-title>
    <v-card-text>
      <v-table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Recipe Name</th>
            <th>Cuisine</th>
            <th>Chef</th>
            <th>Ingredients</th>
            <th>Steps</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="recipe in recipes" :key="recipe.id">
            <td>{{ recipe.id }}</td>
            <td>
              <div class="d-flex align-center">
                <v-avatar size="40" class="mr-3">
                  <v-img :src="recipe.picture || fallbackImage" />
                </v-avatar>
                <span class="font-weight-medium">{{ recipe.name }}</span>
              </div>
            </td>
            <td>
              <v-chip size="small" color="primary">
                {{ recipe.cuisine_type }}
              </v-chip>
            </td>
            <td>{{ recipe.user?.name || 'Unknown' }}</td>
            <td>
              <v-chip size="small" variant="outlined">
                {{ recipe.ingredients?.length || 0 }} items
              </v-chip>
            </td>
            <td>
              <v-chip size="small" variant="outlined">
                {{ recipe.steps?.length || 0 }} steps
              </v-chip>
            </td>
            <td>
              <span class="text-caption text-grey">
                {{ formatDate(recipe.created_at) }}
              </span>
            </td>
            <td>
              <div class="d-flex" style="gap: 8px">
                <v-btn
                  icon
                  size="small"
                  color="primary"
                  @click="$router.push(`/recipe/${recipe.id}`)"
                  title="View Recipe"
                >
                  <v-icon>mdi-eye</v-icon>
                </v-btn>
                <v-btn
                  icon
                  size="small"
                  color="warning"
                  @click="$emit('editRecipe', recipe)"
                  title="Edit Recipe"
                >
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
                <v-btn
                  icon
                  size="small"
                  color="error"
                  @click="$emit('deleteRecipe', recipe.id)"
                  title="Delete Recipe"
                >
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </div>
            </td>
          </tr>
        </tbody>
      </v-table>

      <div v-if="!loading && recipes.length === 0" class="text-center py-12">
        <v-icon size="80" color="grey lighten-2">mdi-book-off</v-icon>
        <p class="text-h6 mt-4 grey--text">
          {{
            search || selectedCuisine || selectedAuthor
              ? 'No recipes match your filters'
              : 'No recipes found'
          }}
        </p>
        <v-btn
          v-if="search || selectedCuisine || selectedAuthor"
          color="primary"
          class="mt-4"
          @click="$emit('clearFilters')"
        >
          Clear Filters
        </v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { Recipe } from '@/store/recipesApi'

const fallbackImage = 'https://via.placeholder.com/300x180/f5f5f5/cccccc?text=No+Image'

defineProps<{
  recipes: Recipe[]
  loading: boolean
  search: string
  selectedCuisine: string
  selectedAuthor: string
}>()

defineEmits<{
  editRecipe: [recipe: Recipe]
  deleteRecipe: [id: number]
  clearFilters: []
}>()

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}
</script>
