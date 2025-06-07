<template>
  <div class="table-container" :class="{ 'loading-state': loading }">
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner">
        <i class="pi pi-spin pi-spinner"></i>
      </div>
      <div class="loading-text">{{ loadingText }}</div>
    </div>

    <DataTable
      :value="data"
      :dataKey="dataKey"
      :selection="selection"
      :responsiveLayout="responsiveLayout"
      :emptyMessage="emptyMessage"
      class="datatable-custom"
      @selection-change="$emit('selection-change', $event)"
      v-bind="$attrs"
    >
      <slot />
    </DataTable>
  </div>
</template>

<script lang="ts" setup>
import DataTable from "primevue/datatable";

interface Props {
  data: any[];
  dataKey?: string;
  selection?: any[];
  responsiveLayout?: string;
  emptyMessage?: string;
  loading?: boolean;
  loadingText?: string;
}

withDefaults(defineProps<Props>(), {
  dataKey: "id",
  responsiveLayout: "scroll",
  emptyMessage: "No data available.",
  loading: false,
  loadingText: "Loading...",
});

defineEmits<{
  "selection-change": [event: any];
}>();
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
};
</script>

<style scoped>
.table-container {
  position: relative;
  width: 100%;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(2px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 10;
  border-radius: 4px;
}

.loading-spinner {
  font-size: 2rem;
  color: #447edb;
  margin-bottom: 16px;
}

.loading-text {
  color: #6b7280;
  font-size: 16px;
  font-weight: 500;
}

.loading-state .datatable-custom {
  opacity: 0.6;
  pointer-events: none;
}

.datatable-custom {
  width: 100%;
  background-color: #ffffff;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: opacity 0.3s ease;
}

:deep(.datatable-custom .p-datatable-thead > tr > th.p-sortable) {
  background-color: #eef2ff !important;
  position: sticky;
  top: 0;
  z-index: 1;
  border-bottom: 1px solid #d1d5db !important;
  color: #374151 !important;
  font-weight: 600 !important;
}

:deep(.datatable-custom .p-datatable-tbody > tr:nth-child(even)) {
  background-color: #fafafa !important;
}

:deep(.datatable-custom .p-datatable-tbody td) {
  color: #59626ecc !important;
  padding: 12px 16px !important;
  font-size: 14px !important;
}

:deep(.datatable-custom .p-datatable-tbody .p-datatable-empty-message) {
  text-align: center !important;
  padding: 24px !important;
  color: #6b7280 !important;
  font-style: italic !important;
}

:deep(.datatable-custom .p-datatable-tbody > tr:hover) {
  background-color: #f3f4f6 !important;
  cursor: pointer;
}

:deep(.datatable-custom .p-datatable-tbody > tr.p-highlight:hover) {
  background-color: #e0e7ff !important;
}

:deep(.p-datatable-column-sorted) {
  background-color: #0f8dda1a !important;
  color: #1f76df !important;
}

:deep(.p-datatable-column-sorted .p-datatable-sort-icon) {
  color: #1f76df !important;
}

:deep(.p-checkbox-checked .p-checkbox-box) {
  border-color: #358fd9 !important;
  background-color: #358fd9 !important;
}
</style>
