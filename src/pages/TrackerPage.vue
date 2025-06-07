<template>
  <div class="tracker-container">
    <PageHeader title="Forex Pairs Tracker">
      <template #actions>
        <BaseButton
          label="Buy"
          icon="pi pi-shopping-cart"
          variant="success"
          :disabled="selectedPairs.length === 0"
          @click="showBuyDialog = true"
        />
      </template>
    </PageHeader>

    <div class="table-section">
      <BaseDataTable
        v-model:selection="selectedPairsData"
        :data="pairsData"
        dataKey="pair"
        :loading="isLoading"
        loadingText="Loading forex pairs..."
        @selection-change="onSelectionChange"
      >
        <Column selectionMode="multiple" headerStyle="width: 3rem" />

        <Column field="pair" header="Pair" sortable style="min-width: 8rem" />

        <Column field="price" header="Price" sortable style="min-width: 6rem">
          <template #body="{ data }">
            {{ data.price.toFixed(5) }}
          </template>
        </Column>

        <Column field="change" header="Change" sortable style="min-width: 6rem">
          <template #body="{ data }">
            <ChangeIndicator :change="data.change" />
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
      </BaseDataTable>
    </div>

    <BuyDialog
      v-model:visible="showBuyDialog"
      :selectedItems="selectedPairsData"
      title="Buy"
      emptyMessage="Lütfen en az bir çift seçin."
      volumeLabel="Volume"
      itemKeyField="pair"
      itemLabelField="pair"
      @cancel="onCancelBuy"
      @confirm="onConfirmBuy"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onBeforeUnmount, onUnmounted } from "vue";
import Column from "primevue/column";
import { useForex } from "@/composable/useForex";
import { useForexStore } from "@/stores/forexStore";
import BaseDataTable from "@/components/molecules/BaseDataTable.vue";
import BaseButton from "@/components/atoms/BaseButton.vue";
import PageHeader from "@/components/organism/PageHeader.vue";
import ChangeIndicator from "@/components/organism/ChangeIndicator.vue";
import BuyDialog from "@/components/atoms/BuyDialog.vue";

interface PairData {
  pair: string;
  price: number;
  prevPrice: number;
  change: number;
  volume: number;
  lastUpdate: string;
}

const { tradeList, addToPortfolio, formatSymbol, disconnect } = useForex();
const forexStore = useForexStore();

const pairsData = ref<PairData[]>([]);
const selectedPairsData = ref<PairData[]>([]);
const showBuyDialog = ref(false);
const isLoading = ref(true);

const selectedPairs = computed(() => selectedPairsData.value);

const stopWatching = watch(
  tradeList,
  (newTrades) => {
    if (isLoading.value && newTrades.length > 0) {
      isLoading.value = false;
    }

    newTrades.forEach((trade: any) => {
      const symbol = formatSymbol(trade.s);
      const price = trade.p;
      const volume = trade.v;
      const time = new Date(trade.t);
      const hours = time.getHours();
      const minutes = time.getMinutes();
      const seconds = time.getSeconds();

      const hours12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
      const ampm = hours >= 12 ? "PM" : "AM";

      const lastUpdate = `${hours12.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")} ${ampm}`;

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
  });
};

const onCancelBuy = () => {
  selectedPairsData.value = [];
  forexStore.clearSelection();
};

const onConfirmBuy = async (volumes: Record<string, number>) => {
  for (const pair of selectedPairsData.value) {
    const vol = volumes[pair.pair];
    if (vol > 0) {
      const oandaSymbol = `OANDA:${pair.pair.replace("/", "_")}`;
      await addToPortfolio(oandaSymbol, vol);
    }
  }
  selectedPairsData.value = [];
  forexStore.clearSelection();
};

const cleanup = () => {
  if (stopWatching) {
    stopWatching();
  }

  disconnect();

  forexStore.clearSelection();
  pairsData.value = [];
  selectedPairsData.value = [];
};

onBeforeUnmount(() => {
  cleanup();
});

onUnmounted(() => {
  cleanup();
});
</script>

<style scoped>
.tracker-container {
  background-color: #f4f5f6;
  box-sizing: border-box;
}

.table-section {
  padding: 0 16px 16px 16px;
}
</style>
