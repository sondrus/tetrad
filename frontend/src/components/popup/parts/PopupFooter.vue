<template>
  <div class="controls">
    <div class="extra" v-if="$slots.default">
      <slot></slot>
    </div>
    <div class="buttons">
      <button
        v-for="(action, index) in props.actions"
        :key="index"
        :type="action.type"
        :data-role="action.role"
        @click="action.onClick"
      >
        <span class="icon" :class="action.icon"></span>
        <span class="text">{{ $t(action?.lang ?? '') }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  actions: {
    lang?: string,
    icon?: string
    role?: string
    type?: 'submit' | 'button' | 'reset'
    onClick?: () => void
  }[]
}>()
</script>
