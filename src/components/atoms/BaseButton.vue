<template>
  <Button
    :label="label"
    :icon="icon"
    :class="[baseClass, variant, { disabled: disabled }]"
    :disabled="disabled"
    @click="handleClick"
    v-bind="$attrs"
  />
</template>

<script lang="ts" setup>
import Button from "primevue/button";

interface Props {
  label?: string;
  icon?: string;
  variant?: "primary" | "success" | "danger" | "secondary";
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
}

const props = withDefaults(defineProps<Props>(), {
  variant: "primary",
  size: "md",
  disabled: false,
});

const emit = defineEmits<{
  click: [event: Event];
}>();

const handleClick = (event: Event) => {
  if (!props.disabled) {
    emit("click", event);
  }
};

const baseClass = computed(() => {
  const classes = ["base-button"];

  if (props.size) {
    classes.push(`btn-${props.size}`);
  }

  return classes.join(" ");
});
</script>

<script lang="ts">
import { computed } from "vue";
export default {
  inheritAttrs: false,
};
</script>

<style scoped>
.base-button {
  border: none !important;
  border-radius: 4px !important;
  font-weight: 500 !important;
  cursor: pointer !important;
  transition: all 0.2s ease !important;
}

.primary {
  background-color: #2563eb !important;
  color: #ffffff !important;
}

.primary:hover:not(.disabled) {
  background-color: #1e40af !important;
}

.success {
  background-color: #28a745 !important;
  color: #ffffff !important;
}

.success:hover:not(.disabled) {
  background-color: #218838 !important;
}

.danger {
  background-color: transparent !important;
  color: #b91c1c !important;
}

.danger:hover:not(.disabled) {
  background-color: #d1c2c22e !important;
}

.secondary {
  background: none !important;
  color: #447edb !important;
}

.secondary:hover:not(.disabled) {
  background-color: #f3f4f6 !important;
}

.btn-sm {
  padding: 6px 12px !important;
  font-size: 12px !important;
}

.btn-md {
  padding: 8px 16px !important;
  font-size: 14px !important;
}

.btn-lg {
  padding: 10px 20px !important;
  font-size: 16px !important;
}

.disabled {
  opacity: 0.6 !important;
  cursor: not-allowed !important;
}

.success.disabled {
  background-color: #94d3a2 !important;
}
</style>
