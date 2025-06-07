<template>
  <span :class="changeClass">
    {{ formattedChange }}<span class="percent-sign">%</span>
  </span>
</template>

<script lang="ts" setup>
import { computed } from "vue";

interface Props {
  change: number;
  precision?: number;
  multiplier?: number;
}

const props = withDefaults(defineProps<Props>(), {
  precision: 3,
  multiplier: 100,
});

const formattedChange = computed(() => {
  return (props.change * props.multiplier).toFixed(props.precision);
});

const changeClass = computed(() => {
  if (props.change > 0) return "change-positive";
  if (props.change < 0) return "change-negative";
  return "change-zero";
});
</script>

<style scoped>
.change-positive {
  color: #10b981 !important;
  font-weight: 600;
}

.change-negative {
  color: #ef4444 !important;
  font-weight: 600;
}

.change-zero {
  color: #6b7280 !important;
  font-weight: 500;
}

.percent-sign {
  font-size: 0.85em;
  font-weight: 500;
  margin-left: 2px;
  font-family: sans-serif;
}
</style>
