<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="400"
  >
    <v-card>
      <v-card-title class="text-h6">Confirm Delete</v-card-title>
      <v-card-text>
        Are you sure you want to delete this recipe? This action cannot be undone.
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn @click="$emit('update:modelValue', false)">Cancel</v-btn>
        <v-btn color="error" @click="$emit('confirmDelete')" :loading="deleting">Delete</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: boolean
  deleting: boolean
}>()

defineEmits<{
  'update:modelValue': [value: boolean]
  confirmDelete: []
}>()
</script>
