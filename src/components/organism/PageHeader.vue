<template>
  <div class="header-section">
    <h2 class="page-title">{{ title }}</h2>
    <div class="header-actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<script lang="ts" setup>
interface Props {
  title: string;
}

defineProps<Props>();
</script>

<style scoped>
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  margin-bottom: 16px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #333333;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}
</style>
