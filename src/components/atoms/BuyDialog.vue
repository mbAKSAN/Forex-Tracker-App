<template>
  <Dialog
    :header="title"
    v-model:visible="dialogVisible"
    modal
    :style="{ width: width }"
    :closable="closable"
    class="dialog-custom"
  >
    <div v-if="selectedItems.length === 0" class="dialog-empty">
      {{ emptyMessage }}
    </div>
    <div v-else>
      <div
        v-for="item in selectedItems"
        :key="getItemKey(item)"
        class="dialog-row"
      >
        <label class="dialog-label">
          {{ getItemLabel(item) }} {{ volumeLabel }}:
        </label>
        <InputNumber
          v-model="volumes[getItemKey(item)]"
          mode="decimal"
          :min="0"
          :step="0.01"
          locale="en-US"
          :minFractionDigits="0"
          :maxFractionDigits="2"
          :useGrouping="false"
          placeholder="0.00"
          class="dialog-input"
        />
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <BaseButton
          :label="cancelLabel"
          icon="pi pi-times"
          variant="secondary"
          @click="handleCancel"
        />
        <BaseButton
          :label="confirmLabel"
          icon="pi pi-check"
          variant="success"
          @click="handleConfirm"
        />
      </div>
    </template>
  </Dialog>
</template>

<script lang="ts" setup>
import { ref, watch, reactive } from "vue";
import Dialog from "primevue/dialog";
import InputNumber from "primevue/inputnumber";
import BaseButton from "./BaseButton.vue";

interface Props {
  visible: boolean;
  selectedItems: any[];
  title?: string;
  width?: string;
  closable?: boolean;
  emptyMessage?: string;
  volumeLabel?: string;
  cancelLabel?: string;
  confirmLabel?: string;
  itemKeyField?: string;
  itemLabelField?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: "Buy",
  width: "400px",
  closable: false,
  emptyMessage: "Please select at least one item.",
  volumeLabel: "Volume",
  cancelLabel: "Cancel",
  confirmLabel: "Buy",
  itemKeyField: "id",
  itemLabelField: "name",
});

const emit = defineEmits<{
  "update:visible": [value: boolean];
  cancel: [];
  confirm: [volumes: Record<string, number>];
}>();

const dialogVisible = ref(props.visible);
const volumes = reactive<Record<string, number>>({});

watch(
  () => props.visible,
  (newVal) => {
    dialogVisible.value = newVal;
  }
);

watch(dialogVisible, (newVal) => {
  emit("update:visible", newVal);
});

watch(
  () => props.selectedItems,
  (newItems) => {
    Object.keys(volumes).forEach((key) => delete volumes[key]);

    newItems.forEach((item) => {
      const key = getItemKey(item);
      if (!(key in volumes)) {
        volumes[key] = 1;
      }
    });
  },
  { immediate: true }
);

const getItemKey = (item: any): string => {
  return item[props.itemKeyField] || item.id || item.pair || String(item);
};

const getItemLabel = (item: any): string => {
  return (
    item[props.itemLabelField] ||
    item.name ||
    item.pair ||
    item.label ||
    String(item)
  );
};

const handleCancel = () => {
  dialogVisible.value = false;
  Object.keys(volumes).forEach((key) => delete volumes[key]);
  emit("cancel");
};

const handleConfirm = () => {
  const volumesCopy = { ...volumes };
  dialogVisible.value = false;
  Object.keys(volumes).forEach((key) => delete volumes[key]);
  emit("confirm", volumesCopy);
};
</script>

<style scoped>
.dialog-custom {
  width: v-bind(width) !important;
}

:deep(.dialog-custom .p-dialog-header) {
  font-size: 18px !important;
  font-weight: 600 !important;
  color: #111827 !important;
}

.dialog-empty {
  text-align: center;
  color: #6b7280;
  margin: 16px 0;
}

.dialog-row {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.dialog-label {
  flex: 1;
  color: #374151;
  font-size: 14px;
}

.dialog-input {
  flex: 1;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
