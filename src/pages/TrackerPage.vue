<template>
  <div class="tracker-container">
    <div class="header-section">
      <span class="title-custom">Forex Pairs Tracker</span>
      <Button
        label="Buy"
        icon="pi pi-shopping-cart"
        class="buy-btn"
        :disabled="selectedPairs.length === 0"
        @click="showBuyDialog = true"
      />
    </div>

    <div class="table-section">
      <DataTable
        v-model:selection="selectedPairsData"
        :value="pairsData"
        dataKey="pair"
        class="datatable-custom"
        responsiveLayout="scroll"
      >
        <Column selectionMode="multiple" headerStyle="width: 3rem" />

        <Column field="pair" header="Pair" sortable style="min-width: 8rem" />

        <Column field="price" header="Price" sortable style="min-width: 6rem" class="header-style">
          <template #body="{ data }">
            {{ data.price.toFixed(5) }}
          </template>
        </Column>

        <Column field="change" header="Change" sortable style="min-width: 6rem">
          <template #body="{ data }">
            <span
              :class="{
                'change-positive': data.change > 0,
                'change-negative': data.change < 0,
                'percent-sign': data.change === 0,
              }"
            >
              {{ (data.change * 100).toFixed(3)
              }}<span class="percent-sign">%</span>
            </span>
          </template>
        </Column>

        <Column
          field="volume"
          header="Volume"
          sortable
          style="min-width: 6rem"
        />

        <Column
          field="lastUpdate"
          header="Last Update"
          sortable
          style="min-width: 8rem"
        />
      </DataTable>
    </div>

    <Dialog
      header="Buy"
      v-model:visible="showBuyDialog"
      modal
      :style="{ width: '400px' }"
      :closable="false"
      class="dialog-custom"
    >
      <div v-if="selectedPairs.length === 0" class="dialog-empty">
        Lütfen en az bir çift seçin.
      </div>
      <div v-else>
        <div
          v-for="pair in selectedPairsData"
          :key="pair.pair"
          class="dialog-row"
        >
          <label class="dialog-label">{{ pair.pair }} Volume:</label>
          <InputNumber
            v-model="volumes[pair.pair]"
            mode="decimal"
            :min="0"
            :step="0.01"
            locale="en-US"
            decimalSeparator="."
            :useGrouping="false"
            placeholder="0.00"
            class="dialog-input"
          />
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <Button
            label="Cancel"
            icon="pi pi-times"
            class="cancel-btn"
            @click="onCancelBuy"
          />
          <Button
            label="Buy"
            icon="pi pi-check"
            class="confirm-btn"
            @click="onConfirmBuy"
          />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, watch } from "vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import InputNumber from "primevue/inputnumber";
import { useForex } from "@/composable/useForex";
import { useForexStore } from "@/stores/forexStore";
import { onBeforeUnmount } from 'vue';

interface PairData {
  pair: string;
  price: number;
  prevPrice: number;
  change: number;
  volume: number;
  lastUpdate: string;
}

const { tradeList, addToPortfolio, formatSymbol } = useForex();
const forexStore = useForexStore();

const pairsData = ref<PairData[]>([]);
const selectedPairsData = ref<PairData[]>([]);
const showBuyDialog = ref(false);
const volumes = reactive<Record<string, number>>({});

const selectedPairs = computed(() => selectedPairsData.value);
const { disconnect } = useForex();

watch(
  tradeList,
  (newTrades) => {
    newTrades.forEach((trade) => {
      const symbol = formatSymbol(trade.s);
      const price = trade.p;
      const volume = trade.v;
      const time = new Date(trade.t);
      const lastUpdate = `${time.getHours().toString().padStart(2, "0")}:${time
        .getMinutes()
        .toString()
        .padStart(2, "0")}:${time.getSeconds().toString().padStart(2, "0")}`;

      const existing = pairsData.value.find((p) => p.pair === symbol);
      if (existing) {
        const prevPrice = existing.price;
        const changePercent = trade.change || 0;
        existing.prevPrice = prevPrice;
        existing.price = price;
        existing.change = changePercent;
        existing.volume = volume;
        existing.lastUpdate = lastUpdate;
      } else {
        pairsData.value.push({
          pair: symbol,
          price,
          prevPrice: price,
          change: trade.change || 0,
          volume,
          lastUpdate,
        });
      }
    });
  },
  { immediate: true, deep: true }
);

interface SelectionChangeEvent {
  value: PairData[];
}
const onSelectionChange = (event: SelectionChangeEvent) => {
  selectedPairsData.value = event.value;
  forexStore.clearSelection();
  event.value.forEach((pair) => {
    const oandaSymbol = `OANDA:${pair.pair.replace("/", "_")}`;
    forexStore.togglePairSelection(oandaSymbol);
    if (!(pair.pair in volumes)) volumes[pair.pair] = 1;
  });
};

const onCancelBuy = () => {
  showBuyDialog.value = false;
  selectedPairsData.value = [];
  forexStore.clearSelection();
  Object.keys(volumes).forEach((key) => delete volumes[key]);
};

const onConfirmBuy = async () => {
  for (const pair of selectedPairsData.value) {
    const vol = volumes[pair.pair];
    if (vol > 0) {
      const oandaSymbol = `OANDA:${pair.pair.replace("/", "_")}`;
      await addToPortfolio(oandaSymbol, vol);
    }
  }
  showBuyDialog.value = false;
  selectedPairsData.value = [];
  forexStore.clearSelection();
  Object.keys(volumes).forEach((key) => delete volumes[key]);
};

onBeforeUnmount(() => {
  disconnect();
});
</script>

<style scoped>
.tracker-container {
  background-color: #f4f5f6;
  box-sizing: border-box;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  margin-bottom: 16px;
}

.title-custom {
  font-size: 25px;
  font-weight: 600;
  color: #333333;
}

.buy-btn {
  background-color: #28a745 !important;
  color: #ffffff !important;
  border: none !important;
  border-radius: 4px !important;
  padding: 8px 16px !important;
  font-size: 14px !important;
  cursor: pointer !important;
}

.buy-btn:hover:not(:disabled) {
  background-color: #218838 !important;
}

.buy-btn:disabled {
  background-color: #94d3a2 !important;
  cursor: not-allowed !important;
}

.table-section {
  padding: 0 16px 16px 16px;
}

.datatable-custom {
  width: 100%;
  background-color: #ffffff;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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
  font-size: 16px !important;
}

:deep(.datatable-custom .p-datatable-tbody .p-datatable-empty-message) {
  text-align: center !important;
  padding: 24px !important;
  color: #6b7280 !important;
  font-style: italic !important;
}

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

.dialog-custom {
  width: 400px !important;
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

.cancel-btn {
  background: none !important;
  border: none !important;
  color: #447edb !important;
  padding: 8px 16px !important;
  cursor: pointer !important;
}

.cancel-btn:hover {
  background-color: #f3f4f6 !important;
  border-radius: 4px !important;
}

.confirm-btn {
  background-color: #28a745 !important;
  color: #ffffff !important;
  border: none !important;
  border-radius: 4px !important;
  padding: 8px 16px !important;
  font-size: 14px !important;
  cursor: pointer !important;
}

.confirm-btn:hover:not(:disabled) {
  background-color: #218838 !important;
}

.confirm-btn:disabled {
  background-color: #94d3a2 !important;
  cursor: not-allowed !important;
}
:deep(.datatable-custom .p-datatable-tbody > tr:hover) {
  background-color: #f3f4f6 !important;
  cursor: pointer;
}

:deep(.datatable-custom .p-datatable-tbody > tr.p-highlight:hover) {
  background-color: #e0e7ff !important;
}
:deep(.p-datatable-column-sorted){
background-color: #0f8dda1a !important;
color: #1f76df !important;
}
:deep(.p-datatable-column-sorted .p-datatable-sort-icon){
  color: #1f76df !important;
}
:deep(.p-checkbox-checked .p-checkbox-box){
  border-color: #358fd9 !important;
  background-color: #358fd9 !important;
}

</style>
